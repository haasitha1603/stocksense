from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models import (
    Product, StockLevel, Receipt, Delivery, Transfer, Warehouse,
    OperationStatus, User
)
from app.schemas import (
    DemandEstimate, StockoutRiskItem, ReorderRecommendation,
    TransferRecommendation, DashboardKPISummary
)
from app.api.deps import get_current_user
from app.services.intelligence_service import IntelligenceService

router = APIRouter(prefix="/intelligence", tags=["Inventory Intelligence & Analytics"])

@router.get("/demand/{product_id}", response_model=DemandEstimate)
def get_demand_estimate(
    product_id: int,
    lookback_days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return IntelligenceService.estimate_demand(
            db=db,
            organization_id=current_user.organization_id,
            product_id=product_id,
            lookback_days=lookback_days
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/stockout-risks", response_model=List[StockoutRiskItem])
def get_stockout_risks(
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return IntelligenceService.get_stockout_risks(
        db=db,
        organization_id=current_user.organization_id,
        warehouse_id=warehouse_id
    )

@router.get("/reorder/{product_id}", response_model=ReorderRecommendation)
def get_reorder_recommendation(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return IntelligenceService.get_reorder_recommendation(
            db=db,
            organization_id=current_user.organization_id,
            product_id=product_id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/transfers", response_model=List[TransferRecommendation])
def get_transfer_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return IntelligenceService.get_transfer_recommendations(
        db=db,
        organization_id=current_user.organization_id
    )

@router.get("/dashboard-summary", response_model=DashboardKPISummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    products = db.query(Product).filter(
        Product.organization_id == current_user.organization_id,
        Product.status == "Active"
    ).all()

    total_value = 0.0
    products_in_stock = 0
    low_stock = 0
    out_of_stock = 0

    for p in products:
        stock_agg = db.query(func.sum(StockLevel.on_hand)).filter(
            StockLevel.product_id == p.id,
            StockLevel.organization_id == current_user.organization_id
        ).scalar() or 0.0
        
        on_hand = float(stock_agg)
        if p.unit_cost and p.unit_cost > 0:
            total_value += on_hand * p.unit_cost

        if on_hand <= 0:
            out_of_stock += 1
        elif on_hand <= p.reorder_level:
            low_stock += 1
        else:
            products_in_stock += 1

    pending_receipts = db.query(func.count(Receipt.id)).filter(
        Receipt.organization_id == current_user.organization_id,
        Receipt.status.in_([OperationStatus.DRAFT.value, OperationStatus.READY.value, OperationStatus.WAITING.value])
    ).scalar() or 0

    pending_deliveries = db.query(func.count(Delivery.id)).filter(
        Delivery.organization_id == current_user.organization_id,
        Delivery.status.in_([OperationStatus.DRAFT.value, OperationStatus.READY.value, OperationStatus.WAITING.value])
    ).scalar() or 0

    transfers_count = db.query(func.count(Transfer.id)).filter(
        Transfer.organization_id == current_user.organization_id
    ).scalar() or 0

    # Calculate overall health score (0 - 100)
    total_skus = max(1, len(products))
    health_score = max(0.0, min(100.0, 100.0 - (out_of_stock / total_skus * 50.0) - (low_stock / total_skus * 30.0)))
    health_score = round(health_score, 1)

    if health_score >= 80.0:
        health_status = "Healthy"
    elif health_score >= 50.0:
        health_status = "At Risk"
    else:
        health_status = "Critical"

    return DashboardKPISummary(
        total_inventory_value=round(total_value, 2),
        products_in_stock=products_in_stock,
        low_stock_items=low_stock,
        out_of_stock_items=out_of_stock,
        pending_receipts=pending_receipts,
        pending_deliveries=pending_deliveries,
        internal_transfers_count=transfers_count,
        inventory_health=health_status,
        health_score=health_score
    )
