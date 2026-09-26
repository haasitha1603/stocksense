from typing import List, Optional
from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Transfer, TransferLine, Product, Warehouse, Location, User, OperationStatus
from app.schemas import TransferCreate, TransferResponse, TransferLineResponse
from app.api.deps import get_current_user, require_manager_or_admin
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/transfers", tags=["Internal Transfers"])

@router.get("", response_model=List[TransferResponse])
def list_transfers(
    status_filter: Optional[str] = None,
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transfer).filter(Transfer.organization_id == current_user.organization_id)
    if status_filter and status_filter != "All":
        query = query.filter(Transfer.status == status_filter)
    if warehouse_id:
        query = query.filter(
            (Transfer.source_warehouse_id == warehouse_id) | (Transfer.destination_warehouse_id == warehouse_id)
        )

    transfers = query.order_by(Transfer.created_at.desc()).all()
    results = []

    for t in transfers:
        src_wh = db.query(Warehouse).filter(Warehouse.id == t.source_warehouse_id).first()
        src_loc = db.query(Location).filter(Location.id == t.source_location_id).first()
        dst_wh = db.query(Warehouse).filter(Warehouse.id == t.destination_warehouse_id).first()
        dst_loc = db.query(Location).filter(Location.id == t.destination_location_id).first()

        lines_resp = []
        for line in t.lines:
            p = db.query(Product).filter(Product.id == line.product_id).first()
            lines_resp.append(TransferLineResponse(
                id=line.id,
                product_id=line.product_id,
                product_name=p.name if p else "N/A",
                sku=p.sku if p else "N/A",
                quantity=line.quantity
            ))

        results.append(TransferResponse(
            id=t.id,
            transfer_number=t.transfer_number,
            source_warehouse_id=t.source_warehouse_id,
            source_warehouse_name=src_wh.name if src_wh else "N/A",
            source_location_id=t.source_location_id,
            source_location_name=src_loc.name if src_loc else "N/A",
            destination_warehouse_id=t.destination_warehouse_id,
            destination_warehouse_name=dst_wh.name if dst_wh else "N/A",
            destination_location_id=t.destination_location_id,
            destination_location_name=dst_loc.name if dst_loc else "N/A",
            status=t.status,
            notes=t.notes,
            created_at=t.created_at,
            validated_at=t.validated_at,
            lines=lines_resp
        ))
    return results

@router.post("", response_model=TransferResponse, status_code=status.HTTP_201_CREATED)
def create_transfer(
    transfer_in: TransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    if transfer_in.source_location_id == transfer_in.destination_location_id:
        raise HTTPException(
            status_code=400,
            detail="Source and destination location must be distinct for an internal transfer."
        )

    if not transfer_in.lines:
        raise HTTPException(status_code=400, detail="Transfer order must contain at least one line item.")

    trf_num = f"TRF-{int(datetime.now().timestamp())}-{uuid.uuid4().hex[:4].upper()}"

    transfer = Transfer(
        organization_id=current_user.organization_id,
        transfer_number=trf_num,
        source_warehouse_id=transfer_in.source_warehouse_id,
        source_location_id=transfer_in.source_location_id,
        destination_warehouse_id=transfer_in.destination_warehouse_id,
        destination_location_id=transfer_in.destination_location_id,
        status=OperationStatus.READY.value,
        notes=transfer_in.notes,
        created_by_id=current_user.id
    )
    db.add(transfer)
    db.flush()

    for line_in in transfer_in.lines:
        line = TransferLine(
            transfer_id=transfer.id,
            product_id=line_in.product_id,
            quantity=line_in.quantity
        )
        db.add(line)

    db.commit()
    db.refresh(transfer)

    return get_transfer(transfer.id, db, current_user)

@router.get("/{id}", response_model=TransferResponse)
def get_transfer(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    t = db.query(Transfer).filter(
        Transfer.id == id,
        Transfer.organization_id == current_user.organization_id
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transfer not found")

    src_wh = db.query(Warehouse).filter(Warehouse.id == t.source_warehouse_id).first()
    src_loc = db.query(Location).filter(Location.id == t.source_location_id).first()
    dst_wh = db.query(Warehouse).filter(Warehouse.id == t.destination_warehouse_id).first()
    dst_loc = db.query(Location).filter(Location.id == t.destination_location_id).first()

    lines_resp = []
    for line in t.lines:
        p = db.query(Product).filter(Product.id == line.product_id).first()
        lines_resp.append(TransferLineResponse(
            id=line.id,
            product_id=line.product_id,
            product_name=p.name if p else "N/A",
            sku=p.sku if p else "N/A",
            quantity=line.quantity
        ))

    return TransferResponse(
        id=t.id,
        transfer_number=t.transfer_number,
        source_warehouse_id=t.source_warehouse_id,
        source_warehouse_name=src_wh.name if src_wh else "N/A",
        source_location_id=t.source_location_id,
        source_location_name=src_loc.name if src_loc else "N/A",
        destination_warehouse_id=t.destination_warehouse_id,
        destination_warehouse_name=dst_wh.name if dst_wh else "N/A",
        destination_location_id=t.destination_location_id,
        destination_location_name=dst_loc.name if dst_loc else "N/A",
        status=t.status,
        notes=t.notes,
        created_at=t.created_at,
        validated_at=t.validated_at,
        lines=lines_resp
    )

@router.post("/{id}/validate", response_model=TransferResponse)
def validate_transfer(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    t = db.query(Transfer).filter(
        Transfer.id == id,
        Transfer.organization_id == current_user.organization_id
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transfer not found")

    InventoryService.validate_transfer(db, t, current_user)
    return get_transfer(id, db, current_user)
