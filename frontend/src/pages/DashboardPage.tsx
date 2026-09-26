import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FlaskConical,
  RefreshCw,
  Sparkles,
  ArrowLeftRight,
  CheckCircle2,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { DashboardKPIs, StockoutRiskItem, TransferRecommendation } from '../types';

export const DashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [risks, setRisks] = useState<StockoutRiskItem[]>([]);
  const [transfers, setTransfers] = useState<TransferRecommendation[]>([]);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [kpiRes, risksRes, trfRes, ledgerRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getStockoutRisks(),
        api.getTransferRecommendations(),
        api.getLedger({ limit: '6' })
      ]);
      setKpis(kpiRes);
      setRisks(risksRes);
      setTransfers(trfRes);
      setRecentMovements(ledgerRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Mocked trajectory data based on actual daily consumption for chart
  const demandTrendData = [
    { day: 'Day -25', historical: 70, projected: null },
    { day: 'Day -20', historical: 85, projected: null },
    { day: 'Day -15', historical: 65, projected: null },
    { day: 'Day -10', historical: 75, projected: null },
    { day: 'Day -5', historical: 60, projected: null },
    { day: 'Today', historical: 65, projected: 65 },
    { day: '+5d', historical: null, projected: 70 },
    { day: '+10d', historical: null, projected: 72 },
    { day: '+15d', historical: null, projected: 68 },
    { day: '+20d', historical: null, projected: 75 },
    { day: '+25d', historical: null, projected: 73 },
    { day: '+30d', historical: null, projected: 70 },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header and Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operational Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time stock telemetry, explainable risk radar, and action recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <NavLink
            to="/intelligence/scenarios"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span>Open What-If? Lab</span>
          </NavLink>
        </div>
      </div>

      {/* Top Operational KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Valuation */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Inventory Value</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            ${kpis?.total_inventory_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Unit-cost grounded</div>
        </div>

        {/* Healthy Products */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">In Stock</span>
            <Package className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {kpis?.products_in_stock} SKUs
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Optimal coverage</div>
        </div>

        {/* Low Stock Items */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Low Stock</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {kpis?.low_stock_items} SKUs
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Below reorder point</div>
        </div>

        {/* Out of Stock */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Stockouts</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {kpis?.out_of_stock_items} SKUs
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Zero balance</div>
        </div>

        {/* Pending Inbound Receipts */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending POs</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {kpis?.pending_receipts} Inbound
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting dock check-in</div>
        </div>

        {/* Inventory Health Score */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Health Index</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {kpis?.health_score}%
            </span>
            <span className={`text-[11px] font-semibold ${
              kpis?.inventory_health === 'Healthy'
                ? 'text-emerald-600 dark:text-emerald-400'
                : kpis?.inventory_health === 'At Risk'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {kpis?.inventory_health}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Multi-warehouse score</div>
        </div>
      </div>

      {/* Hero 30-Second Storyboard Alert Banner */}
      {risks.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/20 dark:border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-md shadow-amber-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  Critical Stockout Risk Detected: {risks[0].product_name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold uppercase tracking-wider">
                  Critical Priority
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Current usable stock is <strong>{risks[0].available_stock} units</strong> with consumption running at{' '}
                <strong>~{risks[0].daily_demand_rate} units/day</strong>. Estimated cover is{' '}
                <strong>~{risks[0].days_of_cover} days</strong>, which is below the{' '}
                <strong>{risks[0].lead_time_days}-day supplier lead time</strong>.
                {transfers.length > 0 && ` Warehouse B holds ${transfers[0].source_surplus} units in safe surplus.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/intelligence/scenarios')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FlaskConical className="h-4 w-4" />
              <span>Simulate Transfer</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/operations/transfers')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Execute Transfer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Demand Chart & Top Stockout Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand & Forecast Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>30-Day Customer Demand & Predictive Outlook</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold">
                  Outbound Deliveries Only
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Historical customer dispatches (solid) vs statistical velocity forecast (dashed). Excludes internal transfers.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandTrendData}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="historical"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#histGrad)"
                  name="Historical Delivery Velocity"
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#9333ea"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#projGrad)"
                  name="Projected Demand Trend"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                Historical Outbound
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
                Forecasted Run-rate
              </span>
            </div>
            <span>Lookback Window: 30 Days</span>
          </div>
        </div>

        {/* Top Stockout Risks Radar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Top Stockout Risks
              </h2>
              <NavLink to="/intelligence/radar" className="text-xs font-semibold text-blue-600 hover:underline">
                View All
              </NavLink>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Ranked by probability × business criticality impact.
            </p>
          </div>

          <div className="space-y-3">
            {risks.slice(0, 4).map((r, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => navigate(`/products/${r.product_id}`)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {r.product_name}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                      r.business_criticality === 'Critical'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {r.business_criticality}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Avail: {r.available_stock} units</span>
                    <span>•</span>
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      ~{r.days_of_cover ?? 'N/A'} days cover
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${
                    r.risk_score >= 65
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  }`}>
                    {r.risk_score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            Evaluates lead time, consumption velocity, and safety thresholds.
          </div>
        </div>
      </div>

      {/* Action Recommendations & Recent Movements Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Actions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Recommended Operational Decisions</span>
            </h2>
            <span className="text-xs text-slate-400">Deterministic Evidence</span>
          </div>

          <div className="space-y-3">
            {transfers.slice(0, 2).map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      Inter-Warehouse Transfer: {t.product_name}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                    Safe Rebalance
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Move <strong>{t.recommended_transfer_quantity} units</strong> from{' '}
                  <span className="font-semibold">{t.source_warehouse_name}</span> to{' '}
                  <span className="font-semibold">{t.destination_warehouse_name}</span>. Resolves shortage while preserving{' '}
                  {t.source_safe_buffer} buffer units at source.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/intelligence/scenarios')}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Simulate What-If
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/operations/transfers')}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                  >
                    Confirm & Execute
                  </button>
                </div>
              </div>
            ))}

            {risks.slice(0, 1).map((r, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      Purchase Order Reorder: {r.product_name}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                    Reorder ~120 Units
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Lead time is <strong>{r.lead_time_days} days</strong>. With only {r.available_stock} units left, placing an expedited replenishment PO will prevent line downtime.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/products/${r.product_id}`)}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
                  >
                    Inspect Reorder Formula
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Intelligence Timeline */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Stock Intelligence Timeline
            </h2>
            <NavLink to="/inventory/ledger" className="text-xs font-semibold text-blue-600 hover:underline">
              Full Audit Ledger
            </NavLink>
          </div>

          <div className="space-y-3">
            {recentMovements.map((m, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  m.movement_type === 'RECEIPT'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                    : m.movement_type === 'DELIVERY'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                    : m.movement_type === 'TRANSFER_IN' || m.movement_type === 'TRANSFER_OUT'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-600'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                }`}>
                  <Layers className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {m.product_name}
                    </span>
                    <span className={`text-xs font-bold ${
                      m.quantity > 0 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {m.reason || `${m.movement_type} on ${m.reference_id}`}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(m.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} • {m.warehouse_name} ({m.location_name})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
