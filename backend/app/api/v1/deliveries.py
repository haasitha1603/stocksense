from typing import List, Optional
from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Delivery, DeliveryLine, Product, Warehouse, Location, User, OperationStatus
from app.schemas import DeliveryCreate, DeliveryResponse, DeliveryLineResponse
from app.api.deps import get_current_user, require_manager_or_admin
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/deliveries", tags=["Delivery Orders (Outgoing Goods)"])

@router.get("", response_model=List[DeliveryResponse])
def list_deliveries(
    status_filter: Optional[str] = None,
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Delivery).filter(Delivery.organization_id == current_user.organization_id)
    if status_filter and status_filter != "All":
        query = query.filter(Delivery.status == status_filter)
    if warehouse_id:
        query = query.filter(Delivery.source_warehouse_id == warehouse_id)

    deliveries = query.order_by(Delivery.created_at.desc()).all()
    results = []

    for d in deliveries:
        wh = db.query(Warehouse).filter(Warehouse.id == d.source_warehouse_id).first()
        loc = db.query(Location).filter(Location.id == d.source_location_id).first()

        lines_resp = []
        for line in d.lines:
            p = db.query(Product).filter(Product.id == line.product_id).first()
            lines_resp.append(DeliveryLineResponse(
                id=line.id,
                product_id=line.product_id,
                product_name=p.name if p else "N/A",
                sku=p.sku if p else "N/A",
                quantity_requested=line.quantity_requested,
                quantity_delivered=line.quantity_delivered
            ))

        results.append(DeliveryResponse(
            id=d.id,
            delivery_number=d.delivery_number,
            customer_reference=d.customer_reference,
            source_warehouse_id=d.source_warehouse_id,
            source_warehouse_name=wh.name if wh else "N/A",
            source_location_id=d.source_location_id,
            source_location_name=loc.name if loc else "N/A",
            status=d.status,
            notes=d.notes,
            created_at=d.created_at,
            validated_at=d.validated_at,
            lines=lines_resp
        ))
    return results

@router.post("", response_model=DeliveryResponse, status_code=status.HTTP_201_CREATED)
def create_delivery(
    delivery_in: DeliveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    if not delivery_in.lines:
        raise HTTPException(status_code=400, detail="Delivery order must contain at least one line item.")

    deliv_num = f"DEL-{int(datetime.now().timestamp())}-{uuid.uuid4().hex[:4].upper()}"

    delivery = Delivery(
        organization_id=current_user.organization_id,
        delivery_number=deliv_num,
        customer_reference=delivery_in.customer_reference,
        source_warehouse_id=delivery_in.source_warehouse_id,
        source_location_id=delivery_in.source_location_id,
        status=OperationStatus.READY.value,
        notes=delivery_in.notes,
        created_by_id=current_user.id
    )
    db.add(delivery)
    db.flush()

    for line_in in delivery_in.lines:
        line = DeliveryLine(
            delivery_id=delivery.id,
            product_id=line_in.product_id,
            quantity_requested=line_in.quantity_requested,
            quantity_delivered=0.0
        )
        db.add(line)

    db.commit()
    db.refresh(delivery)

    return get_delivery(delivery.id, db, current_user)

@router.get("/{id}", response_model=DeliveryResponse)
def get_delivery(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    d = db.query(Delivery).filter(
        Delivery.id == id,
        Delivery.organization_id == current_user.organization_id
    ).first()
    if not d:
        raise HTTPException(status_code=404, detail="Delivery not found")

    wh = db.query(Warehouse).filter(Warehouse.id == d.source_warehouse_id).first()
    loc = db.query(Location).filter(Location.id == d.source_location_id).first()

    lines_resp = []
    for line in d.lines:
        p = db.query(Product).filter(Product.id == line.product_id).first()
        lines_resp.append(DeliveryLineResponse(
            id=line.id,
            product_id=line.product_id,
            product_name=p.name if p else "N/A",
            sku=p.sku if p else "N/A",
            quantity_requested=line.quantity_requested,
            quantity_delivered=line.quantity_delivered
        ))

    return DeliveryResponse(
        id=d.id,
        delivery_number=d.delivery_number,
        customer_reference=d.customer_reference,
        source_warehouse_id=d.source_warehouse_id,
        source_warehouse_name=wh.name if wh else "N/A",
        source_location_id=d.source_location_id,
        source_location_name=loc.name if loc else "N/A",
        status=d.status,
        notes=d.notes,
        created_at=d.created_at,
        validated_at=d.validated_at,
        lines=lines_resp
    )

@router.post("/{id}/validate", response_model=DeliveryResponse)
def validate_delivery(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    d = db.query(Delivery).filter(
        Delivery.id == id,
        Delivery.organization_id == current_user.organization_id
    ).first()
    if not d:
        raise HTTPException(status_code=404, detail="Delivery not found")

    InventoryService.validate_delivery(db, d, current_user)
    return get_delivery(id, db, current_user)
