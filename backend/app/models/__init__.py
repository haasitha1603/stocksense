import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Numeric, Boolean, DateTime,
    ForeignKey, Text, Enum, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    VIEWER = "viewer"

class BusinessCriticality(str, enum.Enum):
    CRITICAL = "Critical"
    STANDARD = "Standard"
    LOW = "Low"

class ProductStatus(str, enum.Enum):
    ACTIVE = "Active"
    ARCHIVED = "Archived"

class OperationStatus(str, enum.Enum):
    DRAFT = "Draft"
    WAITING = "Waiting"
    READY = "Ready"
    DONE = "Done"
    CANCELLED = "Cancelled"

class MovementType(str, enum.Enum):
    RECEIPT = "RECEIPT"
    DELIVERY = "DELIVERY"
    TRANSFER_OUT = "TRANSFER_OUT"
    TRANSFER_IN = "TRANSFER_IN"
    ADJUSTMENT = "ADJUSTMENT"

class AlertSeverity(str, enum.Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="organization", cascade="all, delete-orphan")
    warehouses = relationship("Warehouse", back_populates="organization", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.MANAGER.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    organization = relationship("Organization", back_populates="users")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    products = relationship("Product", back_populates="category")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    lead_time_days = Column(Integer, default=7, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    products = relationship("Product", back_populates="supplier")

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False)
    address = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    organization = relationship("Organization", back_populates="warehouses")
    locations = relationship("Location", back_populates="warehouse", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_org_warehouse_code"),
    )

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False)
    location_type = Column(String(50), default="Storage", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    warehouse = relationship("Warehouse", back_populates="locations")
    stock_levels = relationship("StockLevel", back_populates="location", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("warehouse_id", "code", name="uq_warehouse_location_code"),
    )

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    
    name = Column(String(255), nullable=False, index=True)
    sku = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    unit_of_measure = Column(String(50), default="Units", nullable=False)
    
    reorder_level = Column(Float, default=10.0, nullable=False)
    reorder_quantity = Column(Float, default=50.0, nullable=False)
    unit_cost = Column(Float, default=0.0, nullable=False)
    lead_time_days = Column(Integer, default=7, nullable=False)
    
    business_criticality = Column(String(50), default=BusinessCriticality.STANDARD.value, nullable=False)
    status = Column(String(50), default=ProductStatus.ACTIVE.value, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    organization = relationship("Organization", back_populates="products")
    category = relationship("Category", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    stock_levels = relationship("StockLevel", back_populates="product", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("organization_id", "sku", name="uq_org_product_sku"),
        Index("idx_product_org_status", "organization_id", "status"),
    )

class StockLevel(Base):
    __tablename__ = "stock_levels"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True)

    on_hand = Column(Float, default=0.0, nullable=False)
    reserved = Column(Float, default=0.0, nullable=False)
    available = Column(Float, default=0.0, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    product = relationship("Product", back_populates="stock_levels")
    location = relationship("Location", back_populates="stock_levels")

    __table_args__ = (
        UniqueConstraint("product_id", "location_id", name="uq_product_location_stock"),
        Index("idx_stock_org_wh_prod", "organization_id", "warehouse_id", "product_id"),
    )

class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    receipt_number = Column(String(100), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True)
    destination_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False)
    destination_location_id = Column(Integer, ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    status = Column(String(50), default=OperationStatus.DRAFT.value, nullable=False)
    notes = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    validated_at = Column(DateTime(timezone=True), nullable=True)

    lines = relationship("ReceiptLine", back_populates="receipt", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("organization_id", "receipt_number", name="uq_org_receipt_number"),
    )

class ReceiptLine(Base):
    __tablename__ = "receipt_lines"

    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(Integer, ForeignKey("receipts.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    quantity_expected = Column(Float, nullable=False)
    quantity_received = Column(Float, default=0.0, nullable=False)

    receipt = relationship("Receipt", back_populates="lines")
    product = relationship("Product")

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    delivery_number = Column(String(100), nullable=False)
    customer_reference = Column(String(255), nullable=True)
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False)
    source_location_id = Column(Integer, ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    status = Column(String(50), default=OperationStatus.DRAFT.value, nullable=False)
    notes = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    validated_at = Column(DateTime(timezone=True), nullable=True)

    lines = relationship("DeliveryLine", back_populates="delivery", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("organization_id", "delivery_number", name="uq_org_delivery_number"),
    )

class DeliveryLine(Base):
    __tablename__ = "delivery_lines"

    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    quantity_requested = Column(Float, nullable=False)
    quantity_delivered = Column(Float, default=0.0, nullable=False)

    delivery = relationship("Delivery", back_populates="lines")
    product = relationship("Product")

class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    transfer_number = Column(String(100), nullable=False)
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False)
    source_location_id = Column(Integer, ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    destination_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False)
    destination_location_id = Column(Integer, ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    status = Column(String(50), default=OperationStatus.DRAFT.value, nullable=False)
    notes = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    validated_at = Column(DateTime(timezone=True), nullable=True)

    lines = relationship("TransferLine", back_populates="transfer", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("organization_id", "transfer_number", name="uq_org_transfer_number"),
    )

class TransferLine(Base):
    __tablename__ = "transfer_lines"

    id = Column(Integer, primary_key=True, index=True)
    transfer_id = Column(Integer, ForeignKey("transfers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    quantity = Column(Float, nullable=False)

    transfer = relationship("Transfer", back_populates="lines")
    product = relationship("Product")

class Adjustment(Base):
    __tablename__ = "adjustments"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    adjustment_number = Column(String(100), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    system_quantity = Column(Float, nullable=False)
    physical_count = Column(Float, nullable=False)
    delta_quantity = Column(Float, nullable=False)
    reason = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    product = relationship("Product")

    __table_args__ = (
        UniqueConstraint("organization_id", "adjustment_number", name="uq_org_adjustment_number"),
    )

class StockMovement(Base):
    """
    Append-only immutable stock ledger.
    Every balance mutation is paired with a record here.
    """
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    movement_type = Column(String(50), nullable=False, index=True) # RECEIPT, DELIVERY, TRANSFER_OUT, TRANSFER_IN, ADJUSTMENT
    quantity = Column(Float, nullable=False) # Signed (+ for inbound, - for outbound)
    previous_quantity = Column(Float, nullable=False)
    resulting_quantity = Column(Float, nullable=False)
    
    reference_type = Column(String(50), nullable=False) # receipt, delivery, transfer, adjustment
    reference_id = Column(String(100), nullable=False, index=True)
    transfer_link_id = Column(String(100), nullable=True, index=True) # Shared ID for paired transfer records
    
    reason = Column(String(255), nullable=True)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)

    product = relationship("Product")
    warehouse = relationship("Warehouse")
    location = relationship("Location")
    actor = relationship("User")

    __table_args__ = (
        Index("idx_movement_org_prod_date", "organization_id", "product_id", "created_at"),
        Index("idx_movement_ref", "reference_type", "reference_id"),
    )

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True)
    
    alert_type = Column(String(50), nullable=False) # critical_stockout, below_reorder, recommended_transfer, slow_stock
    severity = Column(String(50), default="warning", nullable=False) # critical, warning, info
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    evidence_json = Column(Text, nullable=True)
    is_acknowledged = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)

    product = relationship("Product")
    warehouse = relationship("Warehouse")
