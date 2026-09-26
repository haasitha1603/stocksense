from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Alert, Product, Warehouse, User
from app.schemas import AlertResponse
from app.api.deps import get_current_user, require_manager_or_admin

router = APIRouter(prefix="/alerts", tags=["Operational Alerts"])

@router.get("", response_model=List[AlertResponse])
def list_alerts(
    unacknowledged_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Alert).filter(Alert.organization_id == current_user.organization_id)
    if unacknowledged_only:
        query = query.filter(Alert.is_acknowledged == False)

    alerts = query.order_by(Alert.created_at.desc()).all()
    results = []

    for a in alerts:
        p = db.query(Product).filter(Product.id == a.product_id).first() if a.product_id else None
        wh = db.query(Warehouse).filter(Warehouse.id == a.warehouse_id).first() if a.warehouse_id else None

        results.append(AlertResponse(
            id=a.id,
            product_id=a.product_id,
            product_name=p.name if p else None,
            sku=p.sku if p else None,
            warehouse_id=a.warehouse_id,
            warehouse_name=wh.name if wh else None,
            alert_type=a.alert_type,
            severity=a.severity,
            title=a.title,
            message=a.message,
            evidence_json=a.evidence_json,
            is_acknowledged=a.is_acknowledged,
            created_at=a.created_at
        ))
    return results

@router.post("/{id}/acknowledge")
def acknowledge_alert(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    alert = db.query(Alert).filter(
        Alert.id == id,
        Alert.organization_id == current_user.organization_id
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_acknowledged = True
    db.commit()
    return {"message": f"Alert '{alert.title}' acknowledged."}
