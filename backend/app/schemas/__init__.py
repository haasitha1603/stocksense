from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth Schemas -----------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenData(BaseModel):
    sub: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "manager"
    organization_name: Optional[str] = "Acme Operations"

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    organization_id: int
    organization_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# ----------------- Catalog Schemas -----------------
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    product_count: Optional[int] = 0

    class Config:
        from_attributes = True

class SupplierCreate(BaseModel):
    name: str
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    lead_time_days: int = 7

class SupplierResponse(BaseModel):
    id: int
    name: str
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    lead_time_days: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    unit_of_measure: str = "Units"
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    reorder_level: float = 10.0
    reorder_quantity: float = 50.0
    unit_cost: float = 0.0
    lead_time_days: int = 7
    business_criticality: str = "Standard" # Critical, Standard, Low
    status: str = "Active"

class ProductCreate(ProductBase):
    initial_stock: Optional[float] = 0.0
    initial_warehouse_id: Optional[int] = None
    initial_location_id: Optional[int] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit_of_measure: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    reorder_level: Optional[float] = None
    reorder_quantity: Optional[float] = None
    unit_cost: Optional[float] = None
    lead_time_days: Optional[int] = None
    business_criticality: Optional[str] = None
    status: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    organization_id: int
    category_name: Optional[str] = None
    supplier_name: Optional[str] = None
    total_on_hand: float = 0.0
    total_available: float = 0.0
    stock_status: Optional[str] = "Normal" # In Stock, Low Stock, Out of Stock, Dead Stock
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Warehouse & Location Schemas -----------------
class LocationBase(BaseModel):
    name: str
    code: str
    location_type: str = "Storage"

class LocationCreate(LocationBase):
    warehouse_id: int

class LocationResponse(LocationBase):
    id: int
    warehouse_id: int
    warehouse_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class WarehouseBase(BaseModel):
    name: str
    code: str
    address: Optional[str] = None

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseResponse(WarehouseBase):
    id: int
    is_active: bool
    locations: List[LocationResponse] = []

    class Config:
        from_attributes = True

# ----------------- Stock Level Schemas -----------------
class StockLevelResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    warehouse_id: int
    warehouse_name: str
    location_id: int
    location_name: str
    on_hand: float
    reserved: float
    available: float
    unit_of_measure: str
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Operations Schemas -----------------
class ReceiptLineCreate(BaseModel):
    product_id: int
    quantity_expected: float = Field(..., gt=0)

class ReceiptCreate(BaseModel):
    supplier_id: Optional[int] = None
    destination_warehouse_id: int
    destination_location_id: int
    notes: Optional[str] = None
    lines: List[ReceiptLineCreate]

class ReceiptLineResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    quantity_expected: float
    quantity_received: float

    class Config:
        from_attributes = True

class ReceiptResponse(BaseModel):
    id: int
    receipt_number: str
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    destination_warehouse_id: int
    destination_warehouse_name: Optional[str] = None
    destination_location_id: int
    destination_location_name: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    validated_at: Optional[datetime] = None
    lines: List[ReceiptLineResponse] = []

    class Config:
        from_attributes = True

class DeliveryLineCreate(BaseModel):
    product_id: int
    quantity_requested: float = Field(..., gt=0)

class DeliveryCreate(BaseModel):
    customer_reference: Optional[str] = None
    source_warehouse_id: int
    source_location_id: int
    notes: Optional[str] = None
    lines: List[DeliveryLineCreate]

class DeliveryLineResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    quantity_requested: float
    quantity_delivered: float

    class Config:
        from_attributes = True

class DeliveryResponse(BaseModel):
    id: int
    delivery_number: str
    customer_reference: Optional[str] = None
    source_warehouse_id: int
    source_warehouse_name: Optional[str] = None
    source_location_id: int
    source_location_name: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    validated_at: Optional[datetime] = None
    lines: List[DeliveryLineResponse] = []

    class Config:
        from_attributes = True

class TransferLineCreate(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)

class TransferCreate(BaseModel):
    source_warehouse_id: int
    source_location_id: int
    destination_warehouse_id: int
    destination_location_id: int
    notes: Optional[str] = None
    lines: List[TransferLineCreate]

class TransferLineResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    quantity: float

    class Config:
        from_attributes = True

class TransferResponse(BaseModel):
    id: int
    transfer_number: str
    source_warehouse_id: int
    source_warehouse_name: Optional[str] = None
    source_location_id: int
    source_location_name: Optional[str] = None
    destination_warehouse_id: int
    destination_warehouse_name: Optional[str] = None
    destination_location_id: int
    destination_location_name: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    validated_at: Optional[datetime] = None
    lines: List[TransferLineResponse] = []

    class Config:
        from_attributes = True

class AdjustmentCreate(BaseModel):
    warehouse_id: int
    location_id: int
    product_id: int
    physical_count: float = Field(..., ge=0)
    reason: str # damage, missing, count_error, expired, other
    notes: Optional[str] = None

class AdjustmentResponse(BaseModel):
    id: int
    adjustment_number: str
    warehouse_id: int
    warehouse_name: Optional[str] = None
    location_id: int
    location_name: Optional[str] = None
    product_id: int
    product_name: Optional[str] = None
    sku: Optional[str] = None
    system_quantity: float
    physical_count: float
    delta_quantity: float
    reason: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Ledger Schemas -----------------
class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    sku: Optional[str] = None
    warehouse_id: int
    warehouse_name: Optional[str] = None
    location_id: int
    location_name: Optional[str] = None
    movement_type: str
    quantity: float
    previous_quantity: float
    resulting_quantity: float
    reference_type: str
    reference_id: str
    transfer_link_id: Optional[str] = None
    reason: Optional[str] = None
    actor_id: Optional[int] = None
    actor_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Intelligence & Simulation Schemas -----------------
class DemandEstimate(BaseModel):
    product_id: int
    product_name: str
    sku: str
    lookback_days: int
    outbound_events_count: int
    total_outbound_units: float
    daily_demand_rate: float
    forecast_7d: float
    forecast_30d: float
    has_sufficient_data: bool
    explanation: str

class StockoutRiskItem(BaseModel):
    product_id: int
    product_name: str
    sku: str
    warehouse_id: Optional[int] = None
    warehouse_name: Optional[str] = None
    available_stock: float
    daily_demand_rate: float
    days_of_cover: Optional[float] = None
    reorder_level: float
    lead_time_days: int
    risk_level: str # critical, warning, healthy
    risk_score: float # 0 - 100
    business_criticality: str # Critical, Standard, Low
    impact_priority: str # High, Medium, Low
    evidence: str

class ReorderRecommendation(BaseModel):
    product_id: int
    product_name: str
    sku: str
    current_usable_stock: float
    confirmed_incoming: float
    daily_demand_rate: float
    supplier_lead_time_days: int
    demand_during_lead_time: float
    safety_stock: float
    target_cycle_coverage: float
    recommended_order_quantity: float
    formula_used: str
    assumptions: List[str]
    business_criticality: str
    urgency: str # Immediate, Upcoming, Adequate

class TransferRecommendation(BaseModel):
    product_id: int
    product_name: str
    sku: str
    destination_warehouse_id: int
    destination_warehouse_name: str
    destination_location_id: int
    destination_location_name: str
    destination_shortage: float
    destination_days_cover: float
    source_warehouse_id: int
    source_warehouse_name: str
    source_location_id: int
    source_location_name: str
    source_surplus: float
    source_safe_buffer: float
    recommended_transfer_quantity: float
    evidence: str
    impact_priority: str

class ScenarioSimulationRequest(BaseModel):
    product_id: int
    warehouse_id: Optional[int] = None
    horizon_days: int = 30
    demand_change_pct: float = 0.0 # e.g. +20.0, -30.0
    lead_time_delay_days: int = 0  # e.g. +7
    proposed_transfer_units: float = 0.0
    source_warehouse_id: Optional[int] = None

class ScenarioSimulationResponse(BaseModel):
    product_id: int
    product_name: str
    sku: str
    business_criticality: str
    horizon_days: int
    baseline_stock: float
    baseline_demand_rate: float
    baseline_days_cover: Optional[float]
    baseline_risk_score: float
    baseline_stockout_day: Optional[int]
    
    simulated_demand_rate: float
    simulated_lead_time_days: int
    simulated_available_stock: float
    projected_stock_by_day: List[Dict[str, Any]]
    simulated_days_cover: Optional[float]
    simulated_stockout_day: Optional[int]
    simulated_risk_score: float
    simulated_risk_level: str
    impact_priority_delta: str
    assumptions_applied: List[str]
    decision_guidance: str
    is_mutation_performed: bool = False # Always False to guarantee zero mutations

class CopilotQueryRequest(BaseModel):
    query: str
    product_id: Optional[int] = None
    warehouse_id: Optional[int] = None

class CopilotQueryResponse(BaseModel):
    answer: str
    grounded_evidence: Dict[str, Any]
    cited_products: List[str]
    suggested_actions: List[Dict[str, str]]
    model_used: str

# ----------------- Alert Schemas -----------------
class AlertResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    sku: Optional[str] = None
    warehouse_id: Optional[int] = None
    warehouse_name: Optional[str] = None
    alert_type: str
    severity: str
    title: str
    message: str
    evidence_json: Optional[str] = None
    is_acknowledged: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Dashboard & Trust Schemas -----------------
class DashboardKPISummary(BaseModel):
    total_inventory_value: float
    products_in_stock: int
    low_stock_items: int
    out_of_stock_items: int
    pending_receipts: int
    pending_deliveries: int
    internal_transfers_count: int
    inventory_health: str # Healthy, At Risk, Critical
    health_score: float # 0 - 100

class ContactSubmission(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class DataDeletionRequest(BaseModel):
    email: EmailStr
    reason: Optional[str] = None
    confirm_audit_retention: bool = Field(..., description="Must acknowledge that statutory ledger movements remain permanently auditable.")
