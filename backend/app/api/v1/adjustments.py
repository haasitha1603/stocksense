from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Adjustment, Product, Warehouse, Location, User
from app.schemas import AdjustmentCreate, AdjustmentResponse
from app.api.deps import get_current_user, require_manager_or_admin
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/adjustments", tags=["Stock Adjustments"])

@router.get("", response_model=List[AdjustmentResponse])
def list_adjustments(
    warehouse_id: Optional[int] = None,
    product_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Adjustment).filter(Adjustment.organization_id == current_user.organization_id)
    if warehouse_id:
        query = query.filter(Adjustment.warehouse_id == warehouse_id)
    if product_id:
        query = query.filter(Adjustment.product_id == product_id)

    adjustments = query.order_by(Adjustment.created_at.desc()).all()
    results = []

    for a in adjustments:
        p = db.query(Product).filter(Product.id == a.product_id).first()
        wh = db.query(Warehouse).filter(Warehouse.id == a.warehouse_id).first()
        loc = db.query(Location).filter(Location.id == a.location_id).first()

        results.append(AdjustmentResponse(
            id=a.id,
            adjustment_number=a.adjustment_number,
            warehouse_id=a.warehouse_id,
            warehouse_name=wh.name if wh else "N/A",
            location_id=a.location_id,
            location_name=loc.name if loc else "N/A",
            product_id=a.product_id,
            product_name=p.name if p else "N/A",
            sku=p.sku if p else "N/A",
            system_quantity=a.system_quantity,
            physical_count=a.physical_count,
            delta_quantity=a.delta_quantity,
            reason=a.reason,
            notes=a.notes,
            created_at=a.created_at
        ))
    return results

@router.post("", response_model=AdjustmentResponse, status_code=status.HTTP_201_CREATED)
def create_adjustment(
    adj_in: AdjustmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    if not adj_in.reason or not adj_in.reason.strip():
        raise HTTPException(
            status_code=400,
            detail="A specific mandatory reason (e.g. damage, missing, count_error, expired) is required for physical inventory adjustments."
        )

    adjustment = InventoryService.execute_adjustment(
        db=db,
        organization_id=current_user.organization_id,
        warehouse_id=adj_in.warehouse_id,
        location_id=adj_in.location_id,
        product_id=adj_in.product_id,
        physical_count=adj_in.physical_count,
        reason=adj_in.reason,
        notes=adj_in.notes,
        actor=current_user
    )

    p = db.query(Product).filter(Product.id == adjustment.product_id).first()
    wh = db.query(Warehouse).filter(Warehouse.id == adjustment.warehouse_id).first()
    loc = db.query(Location).filter(Location.id == adjustment.location_id).first()

    return AdjustmentResponse(
        id=adjustment.id,
        adjustment_number=adjustment.adjustment_number,
        warehouse_id=adjustment.warehouse_id,
        warehouse_name=wh.name if wh else "N/A",
        location_id=adjustment.location_id,
        location_name=loc.name if loc else "N/A",
        product_id=adjustment.product_id,
        product_name=p.name if p else "N/A",
        sku=p.sku if p else "N/A",
        system_quantity=adjustment.system_quantity,
        physical_count=adjustment.physical_count,
        delta_quantity=adjustment.delta_quantity,
        reason=adjustment.reason,
        notes=adjustment.notes,
        created_at=adjustment.created_at
    )
