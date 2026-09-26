from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.core.config import settings
from app.models import User, Organization
from app.schemas import (
    Token, UserLogin, UserCreate, UserResponse,
    PasswordResetRequest, PasswordResetConfirm
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

import re
import uuid
from app.models import (
    User, Organization, Warehouse, Location, Category, Supplier,
    Product, StockLevel, BusinessCriticality, ProductStatus
)

def _provision_starter_workspace(db: Session, org_id: int):
    # 1. Categories
    cat_raw = Category(organization_id=org_id, name="Raw Materials", description="Metals, alloys, and structural elements")
    cat_elec = Category(organization_id=org_id, name="Electronic Components", description="Circuits, sensors, and controllers")
    cat_comp = Category(organization_id=org_id, name="Machined Components", description="Hydraulics, valves, and precision parts")
    db.add_all([cat_raw, cat_elec, cat_comp])
    db.flush()

    # 2. Supplier
    supplier = Supplier(
        organization_id=org_id,
        name="Apex Industrial Logistics",
        contact_email="supply@apexindustrial.example",
        phone="+1-800-555-0199",
        lead_time_days=10
    )
    db.add(supplier)
    db.flush()

    # 3. Warehouses & Locations
    wh_main = Warehouse(
        organization_id=org_id,
        name="Main Distribution Center",
        code="WH-MAIN",
        address="100 Logistics Way, Bay 1",
        is_active=True
    )
    wh_annex = Warehouse(
        organization_id=org_id,
        name="Regional Annex B",
        code="WH-ANNEX",
        address="240 Terminal Road, Bay 4",
        is_active=True
    )
    db.add_all([wh_main, wh_annex])
    db.flush()

    loc_main_stock = Location(
        organization_id=org_id,
        warehouse_id=wh_main.id,
        name="Internal Storage",
        code="WH-MAIN/STOCK",
        location_type="Internal",
        is_active=True
    )
    loc_main_input = Location(
        organization_id=org_id,
        warehouse_id=wh_main.id,
        name="Inbound Dock",
        code="WH-MAIN/INPUT",
        location_type="Input",
        is_active=True
    )
    loc_main_output = Location(
        organization_id=org_id,
        warehouse_id=wh_main.id,
        name="Outbound Staging",
        code="WH-MAIN/OUTPUT",
        location_type="Output",
        is_active=True
    )

    loc_annex_stock = Location(
        organization_id=org_id,
        warehouse_id=wh_annex.id,
        name="Storage Floor",
        code="WH-ANNEX/STOCK",
        location_type="Internal",
        is_active=True
    )
    db.add_all([loc_main_stock, loc_main_input, loc_main_output, loc_annex_stock])
    db.flush()

    # 4. Starter Products with Stock Levels
    p_steel = Product(
        organization_id=org_id,
        category_id=cat_raw.id,
        supplier_id=supplier.id,
        name="High-Tensile Steel Rods",
        sku="SKU-STL-001",
        description="Grade-A industrial steel rods (12mm diameter)",
        unit_of_measure="Units",
        unit_cost=42.50,
        reorder_level=50.0,
        reorder_quantity=100.0,
        lead_time_days=10,
        business_criticality=BusinessCriticality.CRITICAL.value,
        status=ProductStatus.ACTIVE.value
    )
    p_pcb = Product(
        organization_id=org_id,
        category_id=cat_elec.id,
        supplier_id=supplier.id,
        name="Programmable Logic Boards",
        sku="SKU-PCB-002",
        description="High-density multi-layer controller boards",
        unit_of_measure="Units",
        unit_cost=115.00,
        reorder_level=80.0,
        reorder_quantity=50.0,
        lead_time_days=14,
        business_criticality=BusinessCriticality.STANDARD.value,
        status=ProductStatus.ACTIVE.value
    )
    db.add_all([p_steel, p_pcb])
    db.flush()

    # Stock levels
    db.add_all([
        StockLevel(organization_id=org_id, product_id=p_steel.id, warehouse_id=wh_main.id, location_id=loc_main_stock.id, on_hand=85.0, reserved=0.0, available=85.0),
        StockLevel(organization_id=org_id, product_id=p_steel.id, warehouse_id=wh_annex.id, location_id=loc_annex_stock.id, on_hand=160.0, reserved=0.0, available=160.0),
        StockLevel(organization_id=org_id, product_id=p_pcb.id, warehouse_id=wh_main.id, location_id=loc_main_stock.id, on_hand=210.0, reserved=0.0, available=210.0)
    ])
    db.flush()

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if len(user_in.password.strip()) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email.strip().lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in instead."
        )

    # Create Organization with unique code
    raw_name = user_in.organization_name.strip() if user_in.organization_name else "Acme Logistics"
    slug = re.sub(r'[^a-zA-Z0-9]', '-', raw_name.lower())[:15] or "org"
    org_code = f"{slug}-{uuid.uuid4().hex[:6]}"

    org = Organization(
        name=raw_name,
        code=org_code
    )
    db.add(org)
    db.flush()

    # Provision starter facilities and inventory
    try:
        _provision_starter_workspace(db, org.id)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize workspace facilities: {str(e)}"
        )

    user = User(
        organization_id=org.id,
        email=user_in.email.strip().lower(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name.strip(),
        role="admin",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization_id": org.id,
            "organization_name": org.name
        }
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization_id": user.organization_id,
            "organization_name": org.name if org else "Default Workspace"
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "organization_id": current_user.organization_id,
        "organization_name": org.name if org else "Default Workspace",
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }

@router.post("/reset-password-request")
def reset_password_request(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    # Mock OTP flow labeled clearly as non-production development demo
    return {
        "message": "Development Mock OTP: Use OTP '123456' to reset password for demonstration purposes.",
        "email": req.email,
        "is_mock": True
    }

@router.post("/reset-password-confirm")
def reset_password_confirm(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    if req.otp != "123456":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code."
        )
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    user.hashed_password = hash_password(req.new_password)
    db.commit()
    return {"message": "Password updated successfully. You can now log in with your new password."}
