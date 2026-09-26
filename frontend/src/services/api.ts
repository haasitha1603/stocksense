const API_BASE = '/api/v1';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('stocksense_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Clear invalid session tokens immediately
    localStorage.removeItem('stocksense_token');
    localStorage.removeItem('stocksense_user');

    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const publicPrefixes = ['/', '/guide', '/about', '/contact', '/privacy', '/login', '/register'];
    const isPublic = publicPrefixes.some(p => (p === '/' ? currentPath === '/' : currentPath.startsWith(p)));

    // Only redirect to /login if the user was navigating within a protected workspace route
    if (!isPublic) {
      window.location.href = '/login';
    }
    throw new Error('Authentication session expired or unauthorized.');
  }

  if (!response.ok) {
    let errorDetail = 'An unexpected server error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = await response.text() || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  resetPasswordRequest: (data: any) => request<any>('/auth/reset-password-request', { method: 'POST', body: JSON.stringify(data) }),
  resetPasswordConfirm: (data: any) => request<any>('/auth/reset-password-confirm', { method: 'POST', body: JSON.stringify(data) }),

  // Products & Catalog
  getProducts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/products${qs}`);
  },
  getProduct: (id: number) => request<any>(`/products/${id}`),
  createProduct: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archiveProduct: (id: number) => request<any>(`/products/${id}`, { method: 'DELETE' }),

  // Warehouses & Locations
  getWarehouses: () => request<any[]>('/warehouses'),
  createWarehouse: (data: any) => request<any>('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
  createLocation: (data: any) => request<any>('/warehouses/locations', { method: 'POST', body: JSON.stringify(data) }),
  getCategories: () => request<any[]>('/warehouses/categories'),
  createCategory: (data: any) => request<any>('/warehouses/categories', { method: 'POST', body: JSON.stringify(data) }),
  getSuppliers: () => request<any[]>('/warehouses/suppliers'),
  createSupplier: (data: any) => request<any>('/warehouses/suppliers', { method: 'POST', body: JSON.stringify(data) }),

  // Inventory & Stock
  getStockLevels: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/inventory/stock-levels${qs}`);
  },
  getStockMatrix: () => request<any>('/inventory/matrix'),

  // Receipts
  getReceipts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/receipts${qs}`);
  },
  createReceipt: (data: any) => request<any>('/receipts', { method: 'POST', body: JSON.stringify(data) }),
  validateReceipt: (id: number) => request<any>(`/receipts/${id}/validate`, { method: 'POST' }),

  // Deliveries
  getDeliveries: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/deliveries${qs}`);
  },
  createDelivery: (data: any) => request<any>('/deliveries', { method: 'POST', body: JSON.stringify(data) }),
  validateDelivery: (id: number) => request<any>(`/deliveries/${id}/validate`, { method: 'POST' }),

  // Transfers
  getTransfers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/transfers${qs}`);
  },
  createTransfer: (data: any) => request<any>('/transfers', { method: 'POST', body: JSON.stringify(data) }),
  validateTransfer: (id: number) => request<any>(`/transfers/${id}/validate`, { method: 'POST' }),

  // Adjustments
  getAdjustments: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/adjustments${qs}`);
  },
  createAdjustment: (data: any) => request<any>('/adjustments', { method: 'POST', body: JSON.stringify(data) }),

  // Ledger & Timeline
  getLedger: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/ledger${qs}`);
  },
  getProductTimeline: (productId: number) => request<any[]>(`/ledger/timeline/${productId}`),

  // Operational Alerts
  getAlerts: (unacknowledgedOnly: boolean = false) =>
    request<any[]>(`/alerts?unacknowledged_only=${unacknowledgedOnly}`),
  acknowledgeAlert: (id: number) => request<any>(`/alerts/${id}/acknowledge`, { method: 'POST' }),

  // Intelligence & Analytics
  getDashboardSummary: () => request<any>('/intelligence/dashboard-summary'),
  getDemandEstimate: (productId: number, lookbackDays: number = 30) =>
    request<any>(`/intelligence/demand/${productId}?lookback_days=${lookbackDays}`),
  getStockoutRisks: (warehouseId?: number) => {
    const qs = warehouseId ? `?warehouse_id=${warehouseId}` : '';
    return request<any[]>(`/intelligence/stockout-risks${qs}`);
  },
  getReorderRecommendation: (productId: number) =>
    request<any>(`/intelligence/reorder/${productId}`),
  getTransferRecommendations: () => request<any[]>('/intelligence/transfers'),

  // Scenarios Simulation
  simulateScenario: (data: any) =>
    request<any>('/scenarios/simulate', { method: 'POST', body: JSON.stringify(data) }),

  // Copilot
  queryCopilot: (data: { query: string; product_id?: number; warehouse_id?: number }) =>
    request<any>('/copilot/query', { method: 'POST', body: JSON.stringify(data) }),

  // Trust & Privacy
  submitContact: (data: any) =>
    request<any>('/trust/contact', { method: 'POST', body: JSON.stringify(data) }),
  submitDeletionRequest: (data: any) =>
    request<any>('/trust/privacy/deletion-request', { method: 'POST', body: JSON.stringify(data) }),
};
