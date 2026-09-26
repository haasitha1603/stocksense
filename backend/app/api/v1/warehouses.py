from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Warehouse, Location, Category, Supplier, User
from app.schemas import (
    WarehouseCreate, WarehouseResponse, LocationCreate, LocationResponse,
    CategoryCreate, CategoryResponse, SupplierCreate, SupplierResponse
)
from app.api.deps import get_current_user, require_manager_or_admin

router = APIRouter(prefix="/warehouses", tags=["Warehouses & Locations"])

@router.get("", response_model=List[WarehouseResponse])
def list_warehouses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    whs = db.query(Warehouse).filter(
        Warehouse.organization_id == current_user.organization_id,
        Warehouse.is_active == True
    ).all()
    
    results = []
    for w in whs:
        locs = db.query(Location).filter(
            Location.warehouse_id == w.id,
            Location.is_active == True
        ).all()
        loc_responses = [
            LocationResponse(
                id=loc.id,
                warehouse_id=loc.warehouse_id,
                warehouse_name=w.name,
                name=loc.name,
                code=loc.code,
                location_type=loc.location_type,
                is_active=loc.is_active
            )
            for loc in locs
        ]
        results.append(WarehouseResponse(
            id=w.id,
            name=w.name,
            code=w.code,
            address=w.address,
            is_active=w.is_active,
            locations=loc_responses
        ))
    return results

@router.post("", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    wh_in: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    existing = db.query(Warehouse).filter(
        Warehouse.organization_id == current_user.organization_id,
        Warehouse.code == wh_in.code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Warehouse code '{wh_in.code}' already exists.")

    wh = Warehouse(
        organization_id=current_user.organization_id,
        name=wh_in.name,
        code=wh_in.code,
        address=wh_in.address,
        is_active=True
    )
    db.add(wh)
    db.flush()

    # Automatically create a default Storage Location
    default_loc = Location(
        organization_id=current_user.organization_id,
        warehouse_id=wh.id,
        name="General Storage",
        code=f"{wh.code}-GEN",
        location_type="Storage",
        is_active=True
    )
    db.add(default_loc)
    db.commit()
    db.refresh(wh)

    return WarehouseResponse(
        id=wh.id,
        name=wh.name,
        code=wh.code,
        address=wh.address,
        is_active=wh.is_active,
        locations=[
            LocationResponse(
                id=default_loc.id,
                warehouse_id=wh.id,
                warehouse_name=wh.name,
                name=default_loc.name,
                code=default_loc.code,
                location_type=default_loc.location_type,
                is_active=True
            )
        ]
    )

@router.post("/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(
    loc_in: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    wh = db.query(Warehouse).filter(
        Warehouse.id == loc_in.warehouse_id,
        Warehouse.organization_id == current_user.organization_id
    ).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found.")

    existing = db.query(Location).filter(
        Location.warehouse_id == loc_in.warehouse_id,
        Location.code == loc_in.code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Location code '{loc_in.code}' already exists in this warehouse.")

    loc = Location(
        organization_id=current_user.organization_id,
        warehouse_id=loc_in.warehouse_id,
        name=loc_in.name,
        code=loc_in.code,
        location_type=loc_in.location_type,
        is_active=True
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)

    return LocationResponse(
        id=loc.id,
        warehouse_id=loc.warehouse_id,
        warehouse_name=wh.name,
        name=loc.name,
        code=loc.code,
        location_type=loc.location_type,
        is_active=loc.is_active
    )

# Categories and Suppliers endpoints
@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Category).filter(Category.organization_id == current_user.organization_id).all()

@router.post("/categories", response_model=CategoryResponse)
def create_category(cat_in: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(require_manager_or_admin)):
    cat = Category(organization_id=current_user.organization_id, name=cat_in.name, description=cat_in.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.get("/suppliers", response_model=List[SupplierResponse])
def list_suppliers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Supplier).filter(Supplier.organization_id == current_user.organization_id).all()

@router.post("/suppliers", response_model=SupplierResponse)
def create_supplier(supp_in: SupplierCreate, db: Session = Depends(get_db), current_user: User = Depends(require_manager_or_admin)):
    supp = Supplier(
        organization_id=current_user.organization_id,
        name=supp_in.name,
        contact_email=supp_in.contact_email,
        phone=supp_in.phone,
        lead_time_days=supp_in.lead_time_days
    )
    db.add(supp)
    db.commit()
    db.refresh(supp)
    return supp
