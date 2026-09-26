from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models import StockLevel, Product, Location, Warehouse, User
from app.schemas import StockLevelResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/inventory", tags=["Stock & Inventory"])

@router.get("/stock-levels", response_model=List[StockLevelResponse])
def get_stock_levels(
    product_id: Optional[int] = None,
    warehouse_id: Optional[int] = None,
    location_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(StockLevel, Product, Location, Warehouse).join(
        Product, StockLevel.product_id == Product.id
    ).join(
        Location, StockLevel.location_id == Location.id
    ).join(
        Warehouse, StockLevel.warehouse_id == Warehouse.id
    ).filter(
        StockLevel.organization_id == current_user.organization_id,
        Product.status == "Active"
    )

    if product_id:
        query = query.filter(StockLevel.product_id == product_id)
    if warehouse_id:
        query = query.filter(StockLevel.warehouse_id == warehouse_id)
    if location_id:
        query = query.filter(StockLevel.location_id == location_id)

    results = []
    for sl, prod, loc, wh in query.order_by(Product.name.asc(), Warehouse.name.asc()).all():
        results.append(StockLevelResponse(
            id=sl.id,
            product_id=prod.id,
            product_name=prod.name,
            sku=prod.sku,
            warehouse_id=wh.id,
            warehouse_name=wh.name,
            location_id=loc.id,
            location_name=loc.name,
            on_hand=sl.on_hand,
            reserved=sl.reserved,
            available=sl.available,
            unit_of_measure=prod.unit_of_measure,
            updated_at=sl.updated_at
        ))
    return results

@router.get("/matrix")
def get_stock_matrix(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    warehouses = db.query(Warehouse).filter(
        Warehouse.organization_id == current_user.organization_id,
        Warehouse.is_active == True
    ).all()
    products = db.query(Product).filter(
        Product.organization_id == current_user.organization_id,
        Product.status == "Active"
    ).all()

    matrix_rows = []
    for p in products:
        row = {
            "product_id": p.id,
            "sku": p.sku,
            "name": p.name,
            "unit": p.unit_of_measure,
            "criticality": p.business_criticality,
            "reorder_level": p.reorder_level,
            "warehouse_stocks": {},
            "total_available": 0.0
        }
        total_avail = 0.0
        for w in warehouses:
            avail = db.query(func.sum(StockLevel.available)).filter(
                StockLevel.organization_id == current_user.organization_id,
                StockLevel.product_id == p.id,
                StockLevel.warehouse_id == w.id
            ).scalar() or 0.0
            row["warehouse_stocks"][w.name] = float(avail)
            total_avail += float(avail)
        row["total_available"] = total_avail
        matrix_rows.append(row)

    return {
        "warehouses": [w.name for w in warehouses],
        "rows": matrix_rows
    }
