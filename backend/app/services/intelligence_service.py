from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models import (
    StockMovement, StockLevel, Product, Warehouse, Location,
    Receipt, ReceiptLine, Delivery, OperationStatus, MovementType,
    BusinessCriticality, Alert
)
from app.schemas import (
    DemandEstimate, StockoutRiskItem, ReorderRecommendation,
    TransferRecommendation
)

def utc_now():
    return datetime.now(timezone.utc)

class IntelligenceService:
    @classmethod
    def estimate_demand(
        cls,
        db: Session,
        organization_id: int,
        product_id: int,
        lookback_days: int = 30
    ) -> DemandEstimate:
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.organization_id == organization_id
        ).first()
        if not product:
            raise ValueError(f"Product {product_id} not found")

        cutoff_date = utc_now() - timedelta(days=lookback_days)

        # Strictly customer outbound deliveries only
        movements = db.query(StockMovement).filter(
            StockMovement.organization_id == organization_id,
            StockMovement.product_id == product_id,
            StockMovement.movement_type == MovementType.DELIVERY.value,
            StockMovement.created_at >= cutoff_date
        ).all()

        events_count = len(movements)
        # Quantity is negative for DELIVERY, so absolute value
        total_units = sum(abs(m.quantity) for m in movements)

        # Minimum data threshold: at least 2 distinct delivery events
        has_sufficient = events_count >= 2

        if has_sufficient and lookback_days > 0:
            daily_rate = total_units / float(lookback_days)
            forecast_7d = round(daily_rate * 7, 1)
            forecast_30d = round(daily_rate * 30, 1)
            explanation = (
                f"Derived from {events_count} completed customer deliveries totaling {total_units:.1f} {product.unit_of_measure} "
                f"over the past {lookback_days} days. Average consumption velocity: {daily_rate:.2f} {product.unit_of_measure}/day."
            )
        else:
            daily_rate = 0.0
            forecast_7d = 0.0
            forecast_30d = 0.0
            explanation = (
                f"Insufficient historical outbound data ({events_count} events recorded). "
                f"A minimum of 2 customer deliveries within the {lookback_days}-day window is required for reliable statistical forecasting."
            )

        return DemandEstimate(
            product_id=product.id,
            product_name=product.name,
            sku=product.sku,
            lookback_days=lookback_days,
            outbound_events_count=events_count,
            total_outbound_units=total_units,
            daily_demand_rate=round(daily_rate, 2),
            forecast_7d=forecast_7d,
            forecast_30d=forecast_30d,
            has_sufficient_data=has_sufficient,
            explanation=explanation
        )

    @classmethod
    def get_stockout_risks(
        cls,
        db: Session,
        organization_id: int,
        warehouse_id: Optional[int] = None
    ) -> List[StockoutRiskItem]:
        query = db.query(Product).filter(
            Product.organization_id == organization_id,
            Product.status == "Active"
        )
        products = query.all()
        risk_items: List[StockoutRiskItem] = []

        for prod in products:
            # Query stock
            stock_q = db.query(func.sum(StockLevel.available)).filter(
                StockLevel.organization_id == organization_id,
                StockLevel.product_id == prod.id
            )
            if warehouse_id:
                stock_q = stock_q.filter(StockLevel.warehouse_id == warehouse_id)
            available_stock = float(stock_q.scalar() or 0.0)

            demand = cls.estimate_demand(db, organization_id, prod.id, lookback_days=30)
            daily_rate = demand.daily_demand_rate

            if daily_rate > 0:
                days_cover = round(available_stock / daily_rate, 1)
            else:
                days_cover = None

            # Calculate risk score (0 - 100)
            # Base probability of shortage
            prob_score = 0.0
            if days_cover is not None:
                lead_time = prod.lead_time_days or 7
                if days_cover <= 0:
                    prob_score = 90.0
                elif days_cover <= lead_time:
                    # Imminent stockout before supplier reorder could arrive
                    prob_score = 70.0 + (lead_time - days_cover) / max(1, lead_time) * 20.0
                elif days_cover <= lead_time * 1.5:
                    prob_score = 45.0
                elif available_stock <= prod.reorder_level:
                    prob_score = 35.0
                else:
                    prob_score = 10.0
            elif available_stock == 0:
                prob_score = 60.0
            elif available_stock <= prod.reorder_level:
                prob_score = 30.0
            else:
                prob_score = 5.0

            # Weight by Business Criticality
            crit = prod.business_criticality or "Standard"
            crit_mult = 1.4 if crit == "Critical" else (1.0 if crit == "Standard" else 0.7)
            composite_score = min(100.0, round(prob_score * crit_mult, 1))

            if composite_score >= 65.0:
                risk_level = "critical"
                impact_priority = "High"
            elif composite_score >= 35.0:
                risk_level = "warning"
                impact_priority = "Medium"
            else:
                risk_level = "healthy"
                impact_priority = "Low"

            if days_cover is not None:
                evidence = (
                    f"{available_stock} units available vs {daily_rate:.1f}/day demand. "
                    f"Cover: ~{days_cover} days. Supplier lead time: {prod.lead_time_days} days. Criticality: {crit}."
                )
            else:
                evidence = f"{available_stock} units on hand. Insufficient demand history to calculate days of cover. Criticality: {crit}."

            risk_items.append(StockoutRiskItem(
                product_id=prod.id,
                product_name=prod.name,
                sku=prod.sku,
                warehouse_id=warehouse_id,
                warehouse_name=None,
                available_stock=available_stock,
                daily_demand_rate=daily_rate,
                days_of_cover=days_cover,
                reorder_level=prod.reorder_level,
                lead_time_days=prod.lead_time_days,
                risk_level=risk_level,
                risk_score=composite_score,
                business_criticality=crit,
                impact_priority=impact_priority,
                evidence=evidence
            ))

        # Sort by composite impact-weighted risk score descending
        risk_items.sort(key=lambda x: x.risk_score, reverse=True)
        return risk_items

    @classmethod
    def get_reorder_recommendation(
        cls,
        db: Session,
        organization_id: int,
        product_id: int
    ) -> ReorderRecommendation:
        prod = db.query(Product).filter(
            Product.id == product_id,
            Product.organization_id == organization_id
        ).first()
        if not prod:
            raise ValueError(f"Product {product_id} not found")

        stock_q = db.query(func.sum(StockLevel.available)).filter(
            StockLevel.organization_id == organization_id,
            StockLevel.product_id == prod.id
        )
        usable_stock = float(stock_q.scalar() or 0.0)

        # Confirmed incoming receipts
        incoming_q = db.query(func.sum(ReceiptLine.quantity_expected)).join(Receipt).filter(
            Receipt.organization_id == organization_id,
            Receipt.status.in_([OperationStatus.DRAFT.value, OperationStatus.READY.value, OperationStatus.WAITING.value]),
            ReceiptLine.product_id == prod.id
        )
        confirmed_incoming = float(incoming_q.scalar() or 0.0)

        demand = cls.estimate_demand(db, organization_id, prod.id, lookback_days=30)
        daily_rate = demand.daily_demand_rate
        lead_time = prod.lead_time_days or 7

        demand_during_lead_time = daily_rate * lead_time
        safety_stock = round(daily_rate * (lead_time * 0.5), 1)
        target_cycle = round(daily_rate * 7.0, 1) # 7-day target cycle stock

        # Formula: max(0, demand_during_lead_time + safety_stock + target_cycle - usable_stock - confirmed_incoming)
        raw_order = (demand_during_lead_time + safety_stock + target_cycle) - usable_stock - confirmed_incoming
        recommended_order = max(0.0, round(raw_order))

        # Determine urgency
        days_cover = round(usable_stock / daily_rate, 1) if daily_rate > 0 else 999
        if days_cover <= lead_time:
            urgency = "Immediate"
        elif days_cover <= lead_time * 1.5 or usable_stock <= prod.reorder_level:
            urgency = "Upcoming"
        else:
            urgency = "Adequate"

        formula_str = "suggested_order = max(0, (daily_demand * lead_time) + safety_stock + target_cycle - usable_stock - incoming)"
        assumptions = [
            f"Daily demand velocity: {daily_rate:.2f} {prod.unit_of_measure}/day",
            f"Supplier lead time: {lead_time} days",
            f"Safety stock buffer: {safety_stock} units (50% lead-time coverage)",
            f"Target cycle coverage: {target_cycle} units (7 days review horizon)",
            f"Usable stock on hand: {usable_stock} units",
            f"Pending incoming POs: {confirmed_incoming} units"
        ]

        return ReorderRecommendation(
            product_id=prod.id,
            product_name=prod.name,
            sku=prod.sku,
            current_usable_stock=usable_stock,
            confirmed_incoming=confirmed_incoming,
            daily_demand_rate=daily_rate,
            supplier_lead_time_days=lead_time,
            demand_during_lead_time=round(demand_during_lead_time, 1),
            safety_stock=safety_stock,
            target_cycle_coverage=target_cycle,
            recommended_order_quantity=recommended_order,
            formula_used=formula_str,
            assumptions=assumptions,
            business_criticality=prod.business_criticality,
            urgency=urgency
        )

    @classmethod
    def get_transfer_recommendations(
        cls,
        db: Session,
        organization_id: int
    ) -> List[TransferRecommendation]:
        warehouses = db.query(Warehouse).filter(
            Warehouse.organization_id == organization_id,
            Warehouse.is_active == True
        ).all()

        if len(warehouses) < 2:
            return []

        products = db.query(Product).filter(
            Product.organization_id == organization_id,
            Product.status == "Active"
        ).all()

        recommendations: List[TransferRecommendation] = []

        for prod in products:
            demand = cls.estimate_demand(db, organization_id, prod.id, lookback_days=30)
            daily_rate = demand.daily_demand_rate

            # Per-warehouse stock
            wh_stocks = {}
            for wh in warehouses:
                avail = db.query(func.sum(StockLevel.available)).filter(
                    StockLevel.organization_id == organization_id,
                    StockLevel.product_id == prod.id,
                    StockLevel.warehouse_id == wh.id
                ).scalar() or 0.0
                wh_stocks[wh.id] = float(avail)

            for dest_wh in warehouses:
                dest_stock = wh_stocks.get(dest_wh.id, 0.0)
                dest_days_cover = round(dest_stock / daily_rate, 1) if daily_rate > 0 else 999

                # Check if destination is at risk (< lead_time or < reorder_level)
                if dest_days_cover < prod.lead_time_days or dest_stock <= prod.reorder_level:
                    shortage = max(0.0, (daily_rate * prod.lead_time_days) - dest_stock)
                    if shortage <= 0 and dest_stock <= prod.reorder_level:
                        shortage = prod.reorder_level - dest_stock

                    # Look for surplus in other warehouses
                    for src_wh in warehouses:
                        if src_wh.id == dest_wh.id:
                            continue
                        src_stock = wh_stocks.get(src_wh.id, 0.0)
                        # Source must keep safety buffer (e.g. 7 days demand + 10 units)
                        src_safe_buffer = round((daily_rate * 7.0) + 10.0, 1)
                        src_surplus = max(0.0, src_stock - src_safe_buffer)

                        if src_surplus >= 10.0:
                            transfer_qty = min(round(shortage), round(src_surplus))
                            if transfer_qty >= 5.0:
                                # Get locations
                                src_loc = db.query(Location).filter(
                                    Location.warehouse_id == src_wh.id,
                                    Location.is_active == True
                                ).first()
                                dest_loc = db.query(Location).filter(
                                    Location.warehouse_id == dest_wh.id,
                                    Location.is_active == True
                                ).first()

                                if src_loc and dest_loc:
                                    crit = prod.business_criticality or "Standard"
                                    rec = TransferRecommendation(
                                        product_id=prod.id,
                                        product_name=prod.name,
                                        sku=prod.sku,
                                        destination_warehouse_id=dest_wh.id,
                                        destination_warehouse_name=dest_wh.name,
                                        destination_location_id=dest_loc.id,
                                        destination_location_name=dest_loc.name,
                                        destination_shortage=round(shortage, 1),
                                        destination_days_cover=dest_days_cover,
                                        source_warehouse_id=src_wh.id,
                                        source_warehouse_name=src_wh.name,
                                        source_location_id=src_loc.id,
                                        source_location_name=src_loc.name,
                                        source_surplus=round(src_surplus, 1),
                                        source_safe_buffer=src_safe_buffer,
                                        recommended_transfer_quantity=float(transfer_qty),
                                        evidence=(
                                            f"Destination '{dest_wh.name}' has {dest_stock} units (~{dest_days_cover} days cover, lead time: {prod.lead_time_days}d). "
                                            f"Source '{src_wh.name}' holds {src_stock} units with a safe surplus of {src_surplus:.1f} units after preserving {src_safe_buffer} buffer units."
                                        ),
                                        impact_priority="High" if crit == "Critical" else "Medium"
                                    )
                                    recommendations.append(rec)

        return recommendations
