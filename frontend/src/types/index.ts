export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'viewer';
  organization_id: number;
  organization_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  product_count?: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact_email?: string;
  phone?: string;
  lead_time_days: number;
  created_at: string;
}

export interface Location {
  id: number;
  warehouse_id: number;
  warehouse_name?: string;
  name: string;
  code: string;
  location_type: string;
  is_active: boolean;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address?: string;
  is_active: boolean;
  locations: Location[];
}

export interface Product {
  id: number;
  organization_id: number;
  name: string;
  sku: string;
  description?: string;
  unit_of_measure: string;
  category_id?: number;
  category_name?: string;
  supplier_id?: number;
  supplier_name?: string;
  reorder_level: number;
  reorder_quantity: number;
  unit_cost: number;
  lead_time_days: number;
  business_criticality: 'Critical' | 'Standard' | 'Low';
  status: 'Active' | 'Archived';
  total_on_hand: number;
  total_available: number;
  stock_status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Dead Stock';
  created_at: string;
  updated_at: string;
}

export interface StockLevel {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  warehouse_id: number;
  warehouse_name: string;
  location_id: number;
  location_name: string;
  on_hand: number;
  reserved: number;
  available: number;
  unit_of_measure: string;
  updated_at: string;
}

export interface ReceiptLine {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity_expected: number;
  quantity_received: number;
}

export interface Receipt {
  id: number;
  receipt_number: string;
  supplier_id?: number;
  supplier_name?: string;
  destination_warehouse_id: number;
  destination_warehouse_name: string;
  destination_location_id: number;
  destination_location_name: string;
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled';
  notes?: string;
  created_at: string;
  validated_at?: string;
  lines: ReceiptLine[];
}

export interface DeliveryLine {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity_requested: number;
  quantity_delivered: number;
}

export interface Delivery {
  id: number;
  delivery_number: string;
  customer_reference?: string;
  source_warehouse_id: number;
  source_warehouse_name: string;
  source_location_id: number;
  source_location_name: string;
  status: 'Draft' | 'Picking' | 'Packed' | 'Done' | 'Cancelled';
  notes?: string;
  created_at: string;
  validated_at?: string;
  lines: DeliveryLine[];
}

export interface TransferLine {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
}

export interface Transfer {
  id: number;
  transfer_number: string;
  source_warehouse_id: number;
  source_warehouse_name: string;
  source_location_id: number;
  source_location_name: string;
  destination_warehouse_id: number;
  destination_warehouse_name: string;
  destination_location_id: number;
  destination_location_name: string;
  status: 'Draft' | 'Ready' | 'Done' | 'Cancelled';
  notes?: string;
  created_at: string;
  validated_at?: string;
  lines: TransferLine[];
}

export interface Adjustment {
  id: number;
  adjustment_number: string;
  warehouse_id: number;
  warehouse_name: string;
  location_id: number;
  location_name: string;
  product_id: number;
  product_name: string;
  sku: string;
  system_quantity: number;
  physical_count: number;
  delta_quantity: number;
  reason: string;
  notes?: string;
  created_at: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  sku?: string;
  warehouse_id: number;
  warehouse_name?: string;
  location_id: number;
  location_name?: string;
  movement_type: 'RECEIPT' | 'DELIVERY' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'ADJUSTMENT';
  quantity: number;
  previous_quantity: number;
  resulting_quantity: number;
  reference_type: string;
  reference_id: string;
  transfer_link_id?: string;
  reason?: string;
  actor_id?: number;
  actor_name?: string;
  created_at: string;
}

export interface Alert {
  id: number;
  product_id?: number;
  product_name?: string;
  sku?: string;
  warehouse_id?: number;
  warehouse_name?: string;
  alert_type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  evidence_json?: string;
  is_acknowledged: boolean;
  created_at: string;
}

export interface DashboardKPIs {
  total_inventory_value: number;
  products_in_stock: number;
  low_stock_items: number;
  out_of_stock_items: number;
  pending_receipts: number;
  pending_deliveries: number;
  internal_transfers_count: number;
  inventory_health: 'Healthy' | 'At Risk' | 'Critical';
  health_score: number;
}

export interface DemandEstimate {
  product_id: number;
  product_name: string;
  sku: string;
  lookback_days: number;
  outbound_events_count: number;
  total_outbound_units: number;
  daily_demand_rate: number;
  forecast_7d: number;
  forecast_30d: number;
  has_sufficient_data: boolean;
  explanation: string;
}

export interface StockoutRiskItem {
  product_id: number;
  product_name: string;
  sku: string;
  warehouse_id?: number;
  warehouse_name?: string;
  available_stock: number;
  daily_demand_rate: number;
  days_of_cover?: number;
  reorder_level: number;
  lead_time_days: number;
  risk_level: 'critical' | 'warning' | 'healthy';
  risk_score: number;
  business_criticality: 'Critical' | 'Standard' | 'Low';
  impact_priority: 'High' | 'Medium' | 'Low';
  evidence: string;
}

export interface ReorderRecommendation {
  product_id: number;
  product_name: string;
  sku: string;
  current_usable_stock: number;
  confirmed_incoming: number;
  daily_demand_rate: number;
  supplier_lead_time_days: number;
  demand_during_lead_time: number;
  safety_stock: number;
  target_cycle_coverage: number;
  recommended_order_quantity: number;
  formula_used: string;
  assumptions: string[];
  business_criticality: string;
  urgency: 'Immediate' | 'Upcoming' | 'Adequate';
}

export interface TransferRecommendation {
  product_id: number;
  product_name: string;
  sku: string;
  destination_warehouse_id: number;
  destination_warehouse_name: string;
  destination_location_id: number;
  destination_location_name: string;
  destination_shortage: number;
  destination_days_cover: number;
  source_warehouse_id: number;
  source_warehouse_name: string;
  source_location_id: number;
  source_location_name: string;
  source_surplus: number;
  source_safe_buffer: number;
  recommended_transfer_quantity: number;
  evidence: string;
  impact_priority: string;
}

export interface ScenarioSimulationRequest {
  product_id: number;
  warehouse_id?: number;
  horizon_days: number;
  demand_change_pct: number;
  lead_time_delay_days: number;
  proposed_transfer_units: number;
  source_warehouse_id?: number;
}

export interface ScenarioSimulationResponse {
  product_id: number;
  product_name: string;
  sku: string;
  business_criticality: string;
  horizon_days: number;
  baseline_stock: number;
  baseline_demand_rate: number;
  baseline_days_cover?: number;
  baseline_risk_score: number;
  baseline_stockout_day?: number;
  simulated_demand_rate: number;
  simulated_lead_time_days: number;
  simulated_available_stock: number;
  projected_stock_by_day: Array<{
    day: number;
    baseline_projected: number;
    simulated_projected: number;
    reorder_threshold: number;
  }>;
  simulated_days_cover?: number;
  simulated_stockout_day?: number;
  simulated_risk_score: number;
  simulated_risk_level: string;
  impact_priority_delta: string;
  assumptions_applied: string[];
  decision_guidance: string;
  is_mutation_performed: boolean;
}

export interface CopilotResponse {
  answer: string;
  grounded_evidence: Record<string, any>;
  cited_products: string[];
  suggested_actions?: Array<{
    type: string;
    label: string;
    target: string;
  }>;
  recommended_action?: {
    action_type: string;
    target_sku: string;
    target_name: string;
  };
  model_used: string;
  is_fallback?: boolean;
}
