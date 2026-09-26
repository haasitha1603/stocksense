from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User
from app.schemas import CopilotQueryRequest, CopilotQueryResponse
from app.api.deps import get_current_user
from app.services.copilot_service import CopilotService

router = APIRouter(prefix="/copilot", tags=["Inventory Copilot"])

@router.post("/query", response_model=CopilotQueryResponse)
def query_copilot(
    req: CopilotQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CopilotService.query(
        db=db,
        organization_id=current_user.organization_id,
        req=req
    )
