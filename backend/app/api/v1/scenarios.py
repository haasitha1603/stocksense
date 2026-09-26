from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User
from app.schemas import ScenarioSimulationRequest, ScenarioSimulationResponse
from app.api.deps import get_current_user
from app.services.scenario_service import ScenarioService

router = APIRouter(prefix="/scenarios", tags=["What-If Decision Lab"])

@router.post("/simulate", response_model=ScenarioSimulationResponse)
def simulate_scenario(
    req: ScenarioSimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return ScenarioService.simulate_scenario(
            db=db,
            organization_id=current_user.organization_id,
            req=req
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
