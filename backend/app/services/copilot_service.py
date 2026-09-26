from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from app.core.config import settings
from app.models import Product, StockLevel, Warehouse, Location, Receipt, Delivery, Transfer
from app.schemas import CopilotQueryRequest, CopilotQueryResponse
from app.services.intelligence_service import IntelligenceService

logger = logging.getLogger(__name__)

class CopilotService:
    @classmethod
    def query(
        cls,
        db: Session,
        organization_id: int,
        req: CopilotQueryRequest
    ) -> CopilotQueryResponse:
        # 1. Gather Grounded Live Facts
        risks = IntelligenceService.get_stockout_risks(db, organization_id)
        transfers = IntelligenceService.get_transfer_recommendations(db, organization_id)
        
        products = db.query(Product).filter(
            Product.organization_id == organization_id,
            Product.status == "Active"
        ).all()
        
        warehouses = db.query(Warehouse).filter(
            Warehouse.organization_id == organization_id,
            Warehouse.is_active == True
        ).all()

        total_skus = len(products)
        total_val = sum((p.unit_cost or 0.0) * float(db.query(func.sum(StockLevel.on_hand)).filter(
            StockLevel.product_id == p.id,
            StockLevel.organization_id == organization_id
        ).scalar() or 0.0) for p in products)

        top_risks = [r for r in risks if r.risk_level in ["critical", "warning"]][:5]
        
        grounded_data = {
            "total_active_products": total_skus,
            "total_inventory_value": round(total_val, 2),
            "warehouses": [w.name for w in warehouses],
            "top_stockout_risks": [
                {
                    "sku": r.sku,
                    "name": r.product_name,
                    "available": r.available_stock,
                    "days_cover": r.days_of_cover,
                    "criticality": r.business_criticality,
                    "risk_level": r.risk_level
                }
                for r in top_risks
            ],
            "recommended_transfers": [
                {
                    "product": t.product_name,
                    "sku": t.sku,
                    "qty": t.recommended_transfer_quantity,
                    "from": t.source_warehouse_name,
                    "to": t.destination_warehouse_name,
                    "evidence": t.evidence
                }
                for t in transfers
            ]
        }

        cited_products = []
        for r in top_risks:
            if r.product_name.lower() in req.query.lower() or r.sku.lower() in req.query.lower():
                cited_products.append(f"{r.product_name} ({r.sku})")
        if not cited_products and top_risks:
            cited_products = [f"{r.product_name} ({r.sku})" for r in top_risks[:2]]

        suggested_actions = []
        if transfers:
            suggested_actions.append({
                "type": "transfer",
                "label": f"Transfer {transfers[0].recommended_transfer_quantity:.0f} {transfers[0].sku} to {transfers[0].destination_warehouse_name}",
                "target": "/operations/transfers"
            })
        if top_risks:
            suggested_actions.append({
                "type": "reorder",
                "label": f"Review Reorder for {top_risks[0].product_name}",
                "target": f"/products/{top_risks[0].product_id}"
            })
        suggested_actions.append({
            "type": "simulate",
            "label": "Test in What-If Decision Lab",
            "target": "/intelligence/scenarios"
        })

        # 2. Check if Gemini API is available
        answer_text = ""
        model_used = "Deterministic Grounded Engine"

        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                
                context_prompt = (
                    "You are StockSense Copilot, an expert multi-warehouse inventory assistant.\n"
                    "RULES:\n"
                    "1. Answer ONLY using the authorized ground-truth inventory data below.\n"
                    "2. Cite exact SKUs, warehouse names, days of cover, and formulas.\n"
                    "3. If information is not in the data, state that it is unavailable.\n"
                    "4. Suggest practical operational next steps (reorder, transfer, or What-If simulation).\n\n"
                    f"GROUND TRUTH INVENTORY CONTEXT:\n{grounded_data}\n\n"
                    f"USER QUERY: {req.query}"
                )

                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=context_prompt
                )
                if response and response.text:
                    answer_text = response.text
                    model_used = f"{settings.GEMINI_MODEL} (Google GenAI)"
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to deterministic answer: {e}")

        # 3. Fallback Deterministic Engine if Gemini not available or failed
        if not answer_text:
            query_lower = req.query.lower()
            if "stockout" in query_lower or "risk" in query_lower or "low stock" in query_lower:
                if top_risks:
                    bullet_list = "\n".join([
                        f"- **{r.product_name}** (`{r.sku}`): {r.available_stock} units available (~{r.days_of_cover or 'N/A'} days cover). Criticality: {r.business_criticality}. Risk Level: {r.risk_level.upper()}."
                        for r in top_risks
                    ])
                    answer_text = (
                        f"### Current Stockout Risk Analysis\n"
                        f"Based on real-time outbound demand velocities, there are **{len(top_risks)} products** requiring operational review:\n\n"
                        f"{bullet_list}\n\n"
                        f"**Recommended Action:** High-criticality items with days of cover below supplier lead times should be prioritized for immediate purchase order reorder or internal warehouse transfer."
                    )
                else:
                    answer_text = "All active inventory items currently maintain healthy days of cover relative to demand."

            elif "transfer" in query_lower or "move" in query_lower or "rebalance" in query_lower:
                if transfers:
                    t = transfers[0]
                    answer_text = (
                        f"### Cross-Warehouse Transfer Opportunity\n"
                        f"**{t.product_name}** (`{t.sku}`) has a surplus at **{t.source_warehouse_name}** ({t.source_surplus:.0f} defensible surplus units) "
                        f"while **{t.destination_warehouse_name}** is facing a projected shortage (~{t.destination_days_cover} days cover).\n\n"
                        f"**Recommendation:** Transfer **{t.recommended_transfer_quantity:.0f} units** from {t.source_warehouse_name} to {t.destination_warehouse_name}. "
                        f"This rebalances local inventory without violating source safety buffers ({t.source_safe_buffer:.0f} units preserved)."
                    )
                else:
                    answer_text = "No immediate inter-warehouse stock rebalancing is recommended at this time; all warehouses hold balanced coverage."

            elif "reorder" in query_lower or "buy" in query_lower or "supplier" in query_lower:
                if top_risks:
                    r = top_risks[0]
                    reorder_rec = IntelligenceService.get_reorder_recommendation(db, organization_id, r.product_id)
                    answer_text = (
                        f"### Reorder Recommendation: {reorder_rec.product_name} (`{reorder_rec.sku}`)\n"
                        f"- **Current Stock:** {reorder_rec.current_usable_stock} units\n"
                        f"- **Daily Consumption:** {reorder_rec.daily_demand_rate:.2f} units/day\n"
                        f"- **Lead Time:** {reorder_rec.supplier_lead_time_days} days\n"
                        f"- **Recommended Order:** **{reorder_rec.recommended_order_quantity:.0f} units**\n\n"
                        f"*Formula:* `max(0, demand_during_lead_time + safety_stock + target_cycle - usable_stock - incoming)`."
                    )
                else:
                    answer_text = "No immediate supplier reorders are urgent. All products meet minimum cycle stock requirements."

            else:
                answer_text = (
                    f"### StockSense Inventory Intelligence Overview\n"
                    f"- **Active SKUs:** {total_skus}\n"
                    f"- **Total Inventory Valuation:** ${total_val:,.2f}\n"
                    f"- **Monitored Warehouses:** {', '.join([w.name for w in warehouses])}\n"
                    f"- **At-Risk Products:** {len(top_risks)}\n\n"
                    f"You can ask about stockout risks, recommended reorders, inter-warehouse transfers, or simulate demand surges in the What-If Decision Lab."
                )

        return CopilotQueryResponse(
            answer=answer_text,
            grounded_evidence=grounded_data,
            cited_products=cited_products,
            suggested_actions=suggested_actions,
            model_used=model_used
        )
