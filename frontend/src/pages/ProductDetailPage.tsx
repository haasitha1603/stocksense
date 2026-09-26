import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  Boxes,
  ArrowLeft,
  Warehouse,
  TrendingUp,
  Package,
  Calendar,
  Sparkles,
  FlaskConical,
  Clock,
  Layers,
  ShieldCheck,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { DemandEstimate, ReorderRecommendation } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [demand, setDemand] = useState<DemandEstimate | null>(null);
  const [reorder, setReorder] = useState<ReorderRecommendation | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    if (!id) return;
    try {
      const numId = Number(id);
      const [prodRes, demandRes, reorderRes, timeRes] = await Promise.all([
        api.getProduct(numId),
        api.getDemandEstimate(numId),
        api.getReorderRecommendation(numId),
        api.getProductTimeline(numId)
      ]);
      setProduct(prodRes);
      setDemand(demandRes);
      setReorder(reorderRes);
      setTimeline(timeRes);
    } catch (err) {
      console.error('Failed to load product intelligence profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading AI Product Intelligence Profile...</div>;
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-lg font-bold text-slate-900 dark:text-white">Product not found</div>
        <button
          onClick={() => navigate('/products')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {product.name}
              </h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                product.business_criticality === 'Critical'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
              }`}>
                {product.business_criticality} Priority
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
              SKU: {product.sku} • Category: {product.category_name || 'General'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/intelligence/scenarios')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <FlaskConical className="h-4 w-4" />
          <span>Simulate in What-If? Lab</span>
        </button>
      </div>

      {/* Stock Summary Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Company Total Available</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {product.total_available} <span className="text-xs text-slate-400 font-normal">{product.unit_of_measure}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">On-hand across all sites</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Daily Run Rate</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {demand?.daily_demand_rate ?? 0} <span className="text-xs text-slate-400 font-normal">{product.unit_of_measure}/d</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">30-day outbound velocity</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Stockout Runway</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {demand && demand.daily_demand_rate > 0 ? `~${(product.total_available / demand.daily_demand_rate).toFixed(1)}d` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Supplier lead time: {product.lead_time_days}d</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Unit Valuation</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${product.unit_cost?.toFixed(2) ?? '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total asset: ${(product.total_on_hand * (product.unit_cost || 0)).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Warehouses & Locations Breakdown */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-blue-600" />
          <span>Warehouse & Location Balances</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {product.stock_by_location?.map((loc: any, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white">{loc.warehouse_name}</span>
                <span className="text-slate-400 font-mono text-[10px]">{loc.location_name}</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {loc.available} {product.unit_of_measure}
                </span>
                <span className="text-[11px] text-slate-400">Available</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intelligence & Reorder Formula Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reorder Recommendation Box */}
        {reorder && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Deterministic Reorder Analysis</span>
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                reorder.urgency === 'Immediate'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}>
                {reorder.urgency} Action
              </span>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="text-xs font-semibold text-purple-900 dark:text-purple-300">
                Recommended Purchase Order Lot:
              </div>
              <div className="text-3xl font-extrabold text-purple-700 dark:text-purple-300">
                {reorder.recommended_order_quantity.toFixed(0)} <span className="text-sm font-normal">{product.unit_of_measure}</span>
              </div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-purple-200 dark:border-purple-800/60">
                {reorder.formula_used}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Traceable Inputs & Assumptions:</div>
              <ul className="list-disc list-inside space-y-1">
                {reorder.assumptions.map((asm, idx) => (
                  <li key={idx}>{asm}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Demand Evidence */}
        {demand && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>Statistical Demand Estimation</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">7-Day Projected Outbound:</span>
                <span className="font-bold text-slate-900 dark:text-white">{demand.forecast_7d} {product.unit_of_measure}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">30-Day Projected Outbound:</span>
                <span className="font-bold text-slate-900 dark:text-white">{demand.forecast_30d} {product.unit_of_measure}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Outbound Delivery Events:</span>
                <span className="font-bold text-slate-900 dark:text-white">{demand.outbound_events_count} completed</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {demand.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Product Movement History Timeline */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          SKU Audit Movement Ledger
        </h2>

        <div className="space-y-2">
          {timeline.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No historical movements recorded yet for this product.
            </div>
          ) : (
            timeline.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    m.type === 'RECEIPT' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700' :
                    m.type === 'DELIVERY' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700' :
                    'bg-purple-100 dark:bg-purple-950 text-purple-700'
                  }`}>
                    {m.type}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{m.reason}</div>
                    <div className="text-[10px] text-slate-400">{m.warehouse} ({m.location}) • Ref: {m.reference}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-bold ${m.signed_quantity > 0 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                    {m.signed_quantity > 0 ? `+${m.signed_quantity}` : m.signed_quantity}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    Bal: {m.resulting_balance}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
