from typing import List, Optional
from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Receipt, ReceiptLine, Product, Supplier, Warehouse, Location, User, OperationStatus
from app.schemas import ReceiptCreate, ReceiptResponse, ReceiptLineResponse
from app.api.deps import get_current_user, require_manager_or_admin
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/receipts", tags=["Receipts (Incoming Goods)"])

@router.get("", response_model=List[ReceiptResponse])
def list_receipts(
    status_filter: Optional[str] = None,
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Receipt).filter(Receipt.organization_id == current_user.organization_id)
    if status_filter and status_filter != "All":
        query = query.filter(Receipt.status == status_filter)
    if warehouse_id:
        query = query.filter(Receipt.destination_warehouse_id == warehouse_id)

    receipts = query.order_by(Receipt.created_at.desc()).all()
    results = []

    for r in receipts:
        supp = db.query(Supplier).filter(Supplier.id == r.supplier_id).first() if r.supplier_id else None
        wh = db.query(Warehouse).filter(Warehouse.id == r.destination_warehouse_id).first()
        loc = db.query(Location).filter(Location.id == r.destination_location_id).first()

        lines_resp = []
        for line in r.lines:
            p = db.query(Product).filter(Product.id == line.product_id).first()
            lines_resp.append(ReceiptLineResponse(
                id=line.id,
                product_id=line.product_id,
                product_name=p.name if p else "N/A",
                sku=p.sku if p else "N/A",
                quantity_expected=line.quantity_expected,
                quantity_received=line.quantity_received
            ))

        results.append(ReceiptResponse(
            id=r.id,
            receipt_number=r.receipt_number,
            supplier_id=r.supplier_id,
            supplier_name=supp.name if supp else None,
            destination_warehouse_id=r.destination_warehouse_id,
            destination_warehouse_name=wh.name if wh else "N/A",
            destination_location_id=r.destination_location_id,
            destination_location_name=loc.name if loc else "N/A",
            status=r.status,
            notes=r.notes,
            created_at=r.created_at,
            validated_at=r.validated_at,
            lines=lines_resp
        ))
    return results

@router.post("", response_model=ReceiptResponse, status_code=status.HTTP_201_CREATED)
def create_receipt(
    receipt_in: ReceiptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    if not receipt_in.lines:
        raise HTTPException(status_code=400, detail="Receipt must contain at least one line item.")

    receipt_num = f"REC-{int(datetime.now().timestamp())}-{uuid.uuid4().hex[:4].upper()}"

    receipt = Receipt(
        organization_id=current_user.organization_id,
        receipt_number=receipt_num,
        supplier_id=receipt_in.supplier_id,
        destination_warehouse_id=receipt_in.destination_warehouse_id,
        destination_location_id=receipt_in.destination_location_id,
        status=OperationStatus.READY.value,
        notes=receipt_in.notes,
        created_by_id=current_user.id
    )
    db.add(receipt)
    db.flush()

    for line_in in receipt_in.lines:
        line = ReceiptLine(
            receipt_id=receipt.id,
            product_id=line_in.product_id,
            quantity_expected=line_in.quantity_expected,
            quantity_received=0.0
        )
        db.add(line)

    db.commit()
    db.refresh(receipt)

    return get_receipt(receipt.id, db, current_user)

@router.get("/{id}", response_model=ReceiptResponse)
def get_receipt(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    r = db.query(Receipt).filter(
        Receipt.id == id,
        Receipt.organization_id == current_user.organization_id
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Receipt not found")

    supp = db.query(Supplier).filter(Supplier.id == r.supplier_id).first() if r.supplier_id else None
    wh = db.query(Warehouse).filter(Warehouse.id == r.destination_warehouse_id).first()
    loc = db.query(Location).filter(Location.id == r.destination_location_id).first()

    lines_resp = []
    for line in r.lines:
        p = db.query(Product).filter(Product.id == line.product_id).first()
        lines_resp.append(ReceiptLineResponse(
            id=line.id,
            product_id=line.product_id,
            product_name=p.name if p else "N/A",
            sku=p.sku if p else "N/A",
            quantity_expected=line.quantity_expected,
            quantity_received=line.quantity_received
        ))

    return ReceiptResponse(
        id=r.id,
        receipt_number=r.receipt_number,
        supplier_id=r.supplier_id,
        supplier_name=supp.name if supp else None,
        destination_warehouse_id=r.destination_warehouse_id,
        destination_warehouse_name=wh.name if wh else "N/A",
        destination_location_id=r.destination_location_id,
        destination_location_name=loc.name if loc else "N/A",
        status=r.status,
        notes=r.notes,
        created_at=r.created_at,
        validated_at=r.validated_at,
        lines=lines_resp
    )

@router.post("/{id}/validate", response_model=ReceiptResponse)
def validate_receipt(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    r = db.query(Receipt).filter(
        Receipt.id == id,
        Receipt.organization_id == current_user.organization_id
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Receipt not found")

    InventoryService.validate_receipt(db, r, current_user)
    return get_receipt(id, db, current_user)
