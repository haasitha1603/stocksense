from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.models import StockMovement, Product, Warehouse, Location, User
from app.schemas import StockMovementResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/ledger", tags=["Stock Movement Ledger"])

@router.get("", response_model=List[StockMovementResponse])
def get_ledger_entries(
    product_id: Optional[int] = None,
    warehouse_id: Optional[int] = None,
    movement_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(StockMovement).filter(
        StockMovement.organization_id == current_user.organization_id
    )

    if product_id:
        query = query.filter(StockMovement.product_id == product_id)
    if warehouse_id:
        query = query.filter(StockMovement.warehouse_id == warehouse_id)
    if movement_type and movement_type != "All":
        query = query.filter(StockMovement.movement_type == movement_type)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                StockMovement.reference_id.ilike(search_fmt),
                StockMovement.reason.ilike(search_fmt)
            )
        )

    movements = query.order_by(StockMovement.created_at.desc()).limit(limit).all()
    results = []

    for m in movements:
        p = db.query(Product).filter(Product.id == m.product_id).first()
        wh = db.query(Warehouse).filter(Warehouse.id == m.warehouse_id).first()
        loc = db.query(Location).filter(Location.id == m.location_id).first()
        actor = db.query(User).filter(User.id == m.actor_id).first() if m.actor_id else None

        results.append(StockMovementResponse(
            id=m.id,
            product_id=m.product_id,
            product_name=p.name if p else None,
            sku=p.sku if p else None,
            warehouse_id=m.warehouse_id,
            warehouse_name=wh.name if wh else None,
            location_id=m.location_id,
            location_name=loc.name if loc else None,
            movement_type=m.movement_type,
            quantity=m.quantity,
            previous_quantity=m.previous_quantity,
            resulting_quantity=m.resulting_quantity,
            reference_type=m.reference_type,
            reference_id=m.reference_id,
            transfer_link_id=m.transfer_link_id,
            reason=m.reason,
            actor_id=m.actor_id,
            actor_name=actor.full_name if actor else "System",
            created_at=m.created_at
        ))
    return results

@router.get("/timeline/{product_id}")
def get_product_movement_timeline(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    movements = db.query(StockMovement).filter(
        StockMovement.organization_id == current_user.organization_id,
        StockMovement.product_id == product_id
    ).order_by(StockMovement.created_at.asc()).all()

    timeline = []
    for m in movements:
        wh = db.query(Warehouse).filter(Warehouse.id == m.warehouse_id).first()
        loc = db.query(Location).filter(Location.id == m.location_id).first()
        timeline.append({
            "id": m.id,
            "timestamp": m.created_at,
            "type": m.movement_type,
            "signed_quantity": m.quantity,
            "resulting_balance": m.resulting_quantity,
            "warehouse": wh.name if wh else "N/A",
            "location": loc.name if loc else "N/A",
            "reference": m.reference_id,
            "reason": m.reason
        })
    return timeline
