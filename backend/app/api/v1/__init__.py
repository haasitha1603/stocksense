from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.products import router as products_router
from app.api.v1.warehouses import router as warehouses_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.receipts import router as receipts_router
from app.api.v1.deliveries import router as deliveries_router
from app.api.v1.transfers import router as transfers_router
from app.api.v1.adjustments import router as adjustments_router
from app.api.v1.ledger import router as ledger_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.intelligence import router as intelligence_router
from app.api.v1.scenarios import router as scenarios_router
from app.api.v1.copilot import router as copilot_router
from app.api.v1.trust import router as trust_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(warehouses_router)
api_router.include_router(inventory_router)
api_router.include_router(receipts_router)
api_router.include_router(deliveries_router)
api_router.include_router(transfers_router)
api_router.include_router(adjustments_router)
api_router.include_router(ledger_router)
api_router.include_router(alerts_router)
api_router.include_router(intelligence_router)
api_router.include_router(scenarios_router)
api_router.include_router(copilot_router)
api_router.include_router(trust_router)
