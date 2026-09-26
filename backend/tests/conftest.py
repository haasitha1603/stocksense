import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import SessionLocal
from app.models import User, Organization
from app.core.security import create_access_token

@pytest.fixture(scope="session")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="session")
def admin_headers(db_session: Session):
    admin = db_session.query(User).filter(User.email == "admin@stocksense.io").first()
    token = create_access_token(admin.id)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="session")
def manager_headers(db_session: Session):
    manager = db_session.query(User).filter(User.email == "manager@stocksense.io").first()
    token = create_access_token(manager.id)
    return {"Authorization": f"Bearer {token}"}
