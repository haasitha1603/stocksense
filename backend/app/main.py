from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import api_router
import app.models # ensure all models are registered

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all tables are created in PostgreSQL
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="StockSense AI-Powered Inventory Intelligence & Optimization Platform API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    import json
    try:
        origins = json.loads(origins)
    except Exception:
        origins = [origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException

FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="frontend_assets")

    @app.get("/", tags=["Frontend"])
    def root_frontend():
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_frontend(full_path: str):
        if (
            full_path.startswith("api")
            or full_path.startswith("docs")
            or full_path.startswith("redoc")
            or full_path.startswith("openapi.json")
            or full_path == "health"
        ):
            raise HTTPException(status_code=404, detail="Not Found")

        file_candidate = FRONTEND_DIST / full_path
        if file_candidate.is_file():
            return FileResponse(file_candidate)

        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": "Welcome to StockSense API. Refer to /docs for interactive OpenAPI documentation."
        }
