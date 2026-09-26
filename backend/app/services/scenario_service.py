from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Product, StockLevel, Warehouse, Location
from app.schemas import ScenarioSimulationRequest, ScenarioSimulationResponse
from app.services.intelligence_service import IntelligenceService

class ScenarioService:
    @classmethod
    def simulate_scenario(
        cls,
        db: Session,
        organization_id: int,
        req: ScenarioSimulationRequest
    ) -> ScenarioSimulationResponse:
        prod = db.query(Product).filter(
            Product.id == req.product_id,
            Product.organization_id == organization_id
        ).first()
        if not prod:
            raise ValueError(f"Product {req.product_id} not found")

        # Baseline stock
        stock_q = db.query(func.sum(StockLevel.available)).filter(
            StockLevel.organization_id == organization_id,
            StockLevel.product_id == prod.id
        )
        if req.warehouse_id:
            stock_q = stock_q.filter(StockLevel.warehouse_id == req.warehouse_id)
        baseline_stock = float(stock_q.scalar() or 0.0)

        # Baseline demand
        demand = IntelligenceService.estimate_demand(db, organization_id, prod.id, lookback_days=30)
        baseline_rate = demand.daily_demand_rate
        baseline_days_cover = round(baseline_stock / baseline_rate, 1) if baseline_rate > 0 else None

        lead_time = prod.lead_time_days or 7
        crit = prod.business_criticality or "Standard"
        crit_mult = 1.4 if crit == "Critical" else (1.0 if crit == "Standard" else 0.7)

        # Baseline risk
        if baseline_days_cover is not None:
            if baseline_days_cover <= 0:
                base_prob = 90.0
            elif baseline_days_cover <= lead_time:
                base_prob = 70.0 + (lead_time - baseline_days_cover) / max(1, lead_time) * 20.0
            elif baseline_days_cover <= lead_time * 1.5:
                base_prob = 45.0
            else:
                base_prob = 15.0
        else:
            base_prob = 20.0
        baseline_risk_score = min(100.0, round(base_prob * crit_mult, 1))

        # Baseline stockout day
        baseline_stockout_day = int(baseline_stock // baseline_rate) if baseline_rate > 0 and (baseline_stock // baseline_rate) <= req.horizon_days else None

        # ---------------- Apply Scenario Adjustments (Simulation Only) ----------------
        # 1. Demand change %
        sim_rate = max(0.0, round(baseline_rate * (1.0 + (req.demand_change_pct / 100.0)), 2))
        
        # 2. Supplier lead-time delay
        sim_lead_time = max(1, lead_time + req.lead_time_delay_days)

        # 3. Proposed transfer
        sim_stock = baseline_stock + req.proposed_transfer_units

        # Projected day-by-day trajectory for comparison chart
        projected_trajectory: List[Dict[str, Any]] = []
        curr_base = baseline_stock
        curr_sim = sim_stock
        sim_stockout_day = None

        for day in range(1, req.horizon_days + 1):
            curr_base = max(0.0, curr_base - baseline_rate)
            curr_sim = max(0.0, curr_sim - sim_rate)

            if curr_sim <= 0 and sim_stockout_day is None:
                sim_stockout_day = day

            projected_trajectory.append({
                "day": day,
                "baseline_projected": round(curr_base, 1),
                "simulated_projected": round(curr_sim, 1),
                "reorder_threshold": prod.reorder_level
            })

        sim_days_cover = round(sim_stock / sim_rate, 1) if sim_rate > 0 else None

        # Simulated risk score
        if sim_days_cover is not None:
            if sim_days_cover <= 0:
                sim_prob = 90.0
            elif sim_days_cover <= sim_lead_time:
                sim_prob = 70.0 + (sim_lead_time - sim_days_cover) / max(1, sim_lead_time) * 20.0
            elif sim_days_cover <= sim_lead_time * 1.5:
                sim_prob = 45.0
            else:
                sim_prob = 15.0
        else:
            sim_prob = 20.0

        sim_risk_score = min(100.0, round(sim_prob * crit_mult, 1))

        if sim_risk_score >= 65.0:
            sim_risk_level = "critical"
            sim_priority = "High"
        elif sim_risk_score >= 35.0:
            sim_risk_level = "warning"
            sim_priority = "Medium"
        else:
            sim_risk_level = "healthy"
            sim_priority = "Low"

        # Compare impact priority delta
        risk_diff = round(sim_risk_score - baseline_risk_score, 1)
        if risk_diff > 10:
            impact_delta = f"Risk increases by +{risk_diff} pts ({sim_risk_level.upper()})"
        elif risk_diff < -10:
            impact_delta = f"Risk decreases by {abs(risk_diff)} pts (IMPROVED to {sim_risk_level.upper()})"
        else:
            impact_delta = "Risk remains roughly stable"

        assumptions_applied = []
        if req.demand_change_pct != 0.0:
            assumptions_applied.append(f"Demand shift: {req.demand_change_pct:+.1f}% ({baseline_rate:.2f} -> {sim_rate:.2f} {prod.unit_of_measure}/day)")
        if req.lead_time_delay_days != 0:
            assumptions_applied.append(f"Supplier lead-time delay: +{req.lead_time_delay_days} days ({lead_time}d -> {sim_lead_time}d)")
        if req.proposed_transfer_units != 0.0:
            assumptions_applied.append(f"Proposed transfer: +{req.proposed_transfer_units:.0f} units into location")

        if not assumptions_applied:
            assumptions_applied.append("Baseline status quo (no adjustments applied)")

        # Decision guidance text
        if req.proposed_transfer_units > 0 and sim_days_cover and sim_days_cover >= sim_lead_time:
            guidance = (
                f"The proposed transfer of {req.proposed_transfer_units:.0f} units safely bridges the lead-time window, "
                f"extending days of cover from {baseline_days_cover or 0}d to {sim_days_cover}d and resolving imminent stockout risk."
            )
        elif req.demand_change_pct > 20.0 and sim_stockout_day and sim_stockout_day <= sim_lead_time:
            guidance = (
                f"A {req.demand_change_pct:.0f}% surge accelerates stockout to Day {sim_stockout_day}, prior to standard {sim_lead_time}-day lead time. "
                f"Immediate expedited order or internal transfer is strongly advised."
            )
        else:
            guidance = f"Simulation indicates {sim_days_cover or 'N/A'} days coverage with composite risk score of {sim_risk_score}/100."

        return ScenarioSimulationResponse(
            product_id=prod.id,
            product_name=prod.name,
            sku=prod.sku,
            business_criticality=crit,
            horizon_days=req.horizon_days,
            baseline_stock=baseline_stock,
            baseline_demand_rate=baseline_rate,
            baseline_days_cover=baseline_days_cover,
            baseline_risk_score=baseline_risk_score,
            baseline_stockout_day=baseline_stockout_day,
            simulated_demand_rate=sim_rate,
            simulated_lead_time_days=sim_lead_time,
            simulated_available_stock=sim_stock,
            projected_stock_by_day=projected_trajectory,
            simulated_days_cover=sim_days_cover,
            simulated_stockout_day=sim_stockout_day,
            simulated_risk_score=sim_risk_score,
            simulated_risk_level=sim_risk_level,
            impact_priority_delta=impact_delta,
            assumptions_applied=assumptions_applied,
            decision_guidance=guidance,
            is_mutation_performed=False
        )
