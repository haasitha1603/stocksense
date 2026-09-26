from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.core.database import get_db
from app.models import Product, Category, Supplier, StockLevel, Location, Warehouse, User, ProductStatus, MovementType, StockMovement
from app.schemas import ProductCreate, ProductUpdate, ProductResponse, CategoryResponse, SupplierResponse
from app.api.deps import get_current_user, require_manager_or_admin

router = APIRouter(prefix="/products", tags=["Product Catalog"])

@router.get("", response_model=List[ProductResponse])
def list_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    criticality: Optional[str] = None,
    status_filter: Optional[str] = "Active",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Product).filter(Product.organization_id == current_user.organization_id)
    
    if status_filter and status_filter != "All":
        query = query.filter(Product.status == status_filter)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if criticality and criticality != "All":
        query = query.filter(Product.business_criticality == criticality)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(or_(Product.name.ilike(search_fmt), Product.sku.ilike(search_fmt)))

    products = query.order_by(Product.name.asc()).all()
    results = []

    for p in products:
        stock_agg = db.query(
            func.sum(StockLevel.on_hand).label("on_hand"),
            func.sum(StockLevel.available).label("available")
        ).filter(
            StockLevel.product_id == p.id,
            StockLevel.organization_id == current_user.organization_id
        ).first()

        tot_on_hand = float(stock_agg.on_hand or 0.0)
        tot_avail = float(stock_agg.available or 0.0)

        # Stock status
        if tot_avail <= 0:
            stock_status = "Out of Stock"
        elif tot_avail <= p.reorder_level:
            stock_status = "Low Stock"
        else:
            stock_status = "In Stock"

        cat = db.query(Category).filter(Category.id == p.category_id).first()
        supp = db.query(Supplier).filter(Supplier.id == p.supplier_id).first()

        results.append(ProductResponse(
            id=p.id,
            organization_id=p.organization_id,
            name=p.name,
            sku=p.sku,
            description=p.description,
            unit_of_measure=p.unit_of_measure,
            category_id=p.category_id,
            category_name=cat.name if cat else None,
            supplier_id=p.supplier_id,
            supplier_name=supp.name if supp else None,
            reorder_level=p.reorder_level,
            reorder_quantity=p.reorder_quantity,
            unit_cost=p.unit_cost,
            lead_time_days=p.lead_time_days,
            business_criticality=p.business_criticality,
            status=p.status,
            total_on_hand=tot_on_hand,
            total_available=tot_avail,
            stock_status=stock_status,
            created_at=p.created_at,
            updated_at=p.updated_at
        ))
    return results

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    prod_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    # Check SKU uniqueness within organization
    existing = db.query(Product).filter(
        Product.organization_id == current_user.organization_id,
        Product.sku == prod_in.sku
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{prod_in.sku}' already exists in your workspace."
        )

    product = Product(
        organization_id=current_user.organization_id,
        name=prod_in.name,
        sku=prod_in.sku,
        description=prod_in.description,
        unit_of_measure=prod_in.unit_of_measure,
        category_id=prod_in.category_id,
        supplier_id=prod_in.supplier_id,
        reorder_level=prod_in.reorder_level,
        reorder_quantity=prod_in.reorder_quantity,
        unit_cost=prod_in.unit_cost,
        lead_time_days=prod_in.lead_time_days,
        business_criticality=prod_in.business_criticality,
        status="Active"
    )
    db.add(product)
    db.flush()

    # Optional initial stock
    tot_on_hand = 0.0
    if prod_in.initial_stock and prod_in.initial_stock > 0 and prod_in.initial_warehouse_id and prod_in.initial_location_id:
        stock = StockLevel(
            organization_id=current_user.organization_id,
            product_id=product.id,
            warehouse_id=prod_in.initial_warehouse_id,
            location_id=prod_in.initial_location_id,
            on_hand=prod_in.initial_stock,
            reserved=0.0,
            available=prod_in.initial_stock
        )
        db.add(stock)
        tot_on_hand = prod_in.initial_stock

        # Record in ledger
        movement = StockMovement(
            organization_id=current_user.organization_id,
            product_id=product.id,
            warehouse_id=prod_in.initial_warehouse_id,
            location_id=prod_in.initial_location_id,
            movement_type=MovementType.RECEIPT.value,
            quantity=prod_in.initial_stock,
            previous_quantity=0.0,
            resulting_quantity=prod_in.initial_stock,
            reference_type="initial_setup",
            reference_id=f"INIT-{product.sku}",
            reason="Initial stock baseline entry",
            actor_id=current_user.id
        )
        db.add(movement)

    db.commit()
    db.refresh(product)

    cat = db.query(Category).filter(Category.id == product.category_id).first()
    supp = db.query(Supplier).filter(Supplier.id == product.supplier_id).first()

    return ProductResponse(
        id=product.id,
        organization_id=product.organization_id,
        name=product.name,
        sku=product.sku,
        description=product.description,
        unit_of_measure=product.unit_of_measure,
        category_id=product.category_id,
        category_name=cat.name if cat else None,
        supplier_id=product.supplier_id,
        supplier_name=supp.name if supp else None,
        reorder_level=product.reorder_level,
        reorder_quantity=product.reorder_quantity,
        unit_cost=product.unit_cost,
        lead_time_days=product.lead_time_days,
        business_criticality=product.business_criticality,
        status=product.status,
        total_on_hand=tot_on_hand,
        total_available=tot_on_hand,
        stock_status="Low Stock" if tot_on_hand <= product.reorder_level else "In Stock",
        created_at=product.created_at,
        updated_at=product.updated_at
    )

@router.get("/{id}")
def get_product(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    p = db.query(Product).filter(
        Product.id == id,
        Product.organization_id == current_user.organization_id
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get per-location stock
    levels = db.query(StockLevel, Location, Warehouse).join(
        Location, StockLevel.location_id == Location.id
    ).join(
        Warehouse, StockLevel.warehouse_id == Warehouse.id
    ).filter(
        StockLevel.product_id == p.id,
        StockLevel.organization_id == current_user.organization_id
    ).all()

    stock_by_location = [
        {
            "warehouse_id": sl.warehouse_id,
            "warehouse_name": wh.name,
            "location_id": sl.location_id,
            "location_name": loc.name,
            "on_hand": sl.on_hand,
            "reserved": sl.reserved,
            "available": sl.available,
            "updated_at": sl.updated_at
        }
        for sl, loc, wh in levels
    ]

    cat = db.query(Category).filter(Category.id == p.category_id).first()
    supp = db.query(Supplier).filter(Supplier.id == p.supplier_id).first()
    tot_on_hand = sum(l["on_hand"] for l in stock_by_location)
    tot_available = sum(l["available"] for l in stock_by_location)

    return {
        "id": p.id,
        "organization_id": p.organization_id,
        "name": p.name,
        "sku": p.sku,
        "description": p.description,
        "unit_of_measure": p.unit_of_measure,
        "category_id": p.category_id,
        "category_name": cat.name if cat else None,
        "supplier_id": p.supplier_id,
        "supplier_name": supp.name if supp else None,
        "reorder_level": p.reorder_level,
        "reorder_quantity": p.reorder_quantity,
        "unit_cost": p.unit_cost,
        "lead_time_days": p.lead_time_days,
        "business_criticality": p.business_criticality,
        "status": p.status,
        "total_on_hand": tot_on_hand,
        "total_available": tot_available,
        "stock_by_location": stock_by_location,
        "created_at": p.created_at,
        "updated_at": p.updated_at
    }

@router.put("/{id}", response_model=ProductResponse)
def update_product(
    id: int,
    prod_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    product = db.query(Product).filter(
        Product.id == id,
        Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = prod_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)

    cat = db.query(Category).filter(Category.id == product.category_id).first()
    supp = db.query(Supplier).filter(Supplier.id == product.supplier_id).first()

    stock_agg = db.query(
        func.sum(StockLevel.on_hand).label("on_hand"),
        func.sum(StockLevel.available).label("available")
    ).filter(
        StockLevel.product_id == product.id,
        StockLevel.organization_id == current_user.organization_id
    ).first()

    tot_on_hand = float(stock_agg.on_hand or 0.0)
    tot_avail = float(stock_agg.available or 0.0)

    return ProductResponse(
        id=product.id,
        organization_id=product.organization_id,
        name=product.name,
        sku=product.sku,
        description=product.description,
        unit_of_measure=product.unit_of_measure,
        category_id=product.category_id,
        category_name=cat.name if cat else None,
        supplier_id=product.supplier_id,
        supplier_name=supp.name if supp else None,
        reorder_level=product.reorder_level,
        reorder_quantity=product.reorder_quantity,
        unit_cost=product.unit_cost,
        lead_time_days=product.lead_time_days,
        business_criticality=product.business_criticality,
        status=product.status,
        total_on_hand=tot_on_hand,
        total_available=tot_avail,
        stock_status="Low Stock" if tot_avail <= product.reorder_level else "In Stock",
        created_at=product.created_at,
        updated_at=product.updated_at
    )

@router.delete("/{id}")
def archive_product(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    product = db.query(Product).filter(
        Product.id == id,
        Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Soft-delete to preserve audit ledger referential integrity
    product.status = ProductStatus.ARCHIVED.value
    db.commit()
    return {"message": f"Product '{product.name}' (SKU: {product.sku}) has been successfully archived."}
