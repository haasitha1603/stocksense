import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { api } from '../services/api';
import { Product, Warehouse, ScenarioSimulationResponse } from '../types';

export const WhatIfLabPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [horizonDays, setHorizonDays] = useState<number>(30);

  // Scenario knobs
  const [demandChangePct, setDemandChangePct] = useState<number>(0);
  const [leadTimeDelay, setLeadTimeDelay] = useState<number>(0);
  const [proposedTransfer, setProposedTransfer] = useState<number>(40);

  const [simulation, setSimulation] = useState<ScenarioSimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [prods, whs] = await Promise.all([
          api.getProducts(),
          api.getWarehouses()
        ]);
        setProducts(prods);
        setWarehouses(whs);

        // Default to hero Steel Rods
        const steel = prods.find(p => p.sku === 'SKU-STL-001');
        if (steel) {
          setSelectedProductId(steel.id);
        } else if (prods.length > 0) {
          setSelectedProductId(prods[0].id);
        }
      } catch (err) {
        console.error('Failed to load catalog for simulation:', err);
      }
    };
    fetchCatalog();
  }, []);

  const runSimulation = async () => {
    if (!selectedProductId) return;
    setLoading(true);
    try {
      const res = await api.simulateScenario({
        product_id: selectedProductId,
        warehouse_id: selectedWarehouseId,
        horizon_days: horizonDays,
        demand_change_pct: demandChangePct,
        lead_time_delay_days: leadTimeDelay,
        proposed_transfer_units: proposedTransfer
      });
      setSimulation(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      runSimulation();
    }
  }, [selectedProductId, selectedWarehouseId, horizonDays, demandChangePct, leadTimeDelay, proposedTransfer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <FlaskConical className="h-7 w-7 text-purple-600" />
              <span>What-If? Inventory Decision Lab</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
              Read-Only Simulation
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulate operational adjustments before executing. Zero risk to live stock or ledger records.
          </p>
        </div>

        {/* Zero-mutation compliance pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Strict Invariant: Zero Mutation Guarantee</span>
        </div>
      </div>

      {/* Control Panel: Knobs and Inputs */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-purple-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - {p.business_criticality}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse Scope */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Location Filter
            </label>
            <select
              value={selectedWarehouseId || ''}
              onChange={e => setSelectedWarehouseId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Warehouses (Aggregate)</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Planning Horizon */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Simulation Horizon
            </label>
            <div className="flex gap-2">
              {[14, 30, 60].map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizonDays(h)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    horizonDays === h
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {h} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sliders for Simulation Scenarios */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Knob 1: Demand Shift */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Demand Surge / Drop</span>
              <span className={`font-bold ${demandChangePct > 0 ? 'text-rose-600' : demandChangePct < 0 ? 'text-blue-600' : 'text-slate-500'}`}>
                {demandChangePct > 0 ? `+${demandChangePct}%` : `${demandChangePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={demandChangePct}
              onChange={e => setDemandChangePct(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-50% (Slump)</span>
              <span>Baseline</span>
              <span>+100% (Surge)</span>
            </div>
          </div>

          {/* Knob 2: Supplier Lead Time Delay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Supplier Delay</span>
              <span className="font-bold text-amber-600">
                +{leadTimeDelay} Days
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="21"
              step="1"
              value={leadTimeDelay}
              onChange={e => setLeadTimeDelay(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>On-Time (0d)</span>
              <span>+7d</span>
              <span>+21d (Port Disruption)</span>
            </div>
          </div>

          {/* Knob 3: Proposed Transfer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Proposed Transfer Intake</span>
              <span className="font-bold text-emerald-600">
                +{proposedTransfer} Units
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="10"
              value={proposedTransfer}
              onChange={e => setProposedTransfer(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 Units</span>
              <span>+40 Units (Warehouse B)</span>
              <span>+120 Units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Metrics: Baseline vs Simulated */}
      {simulation && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Days of Cover */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Stock Coverage</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {simulation.simulated_days_cover ?? 'N/A'}d
              </span>
              <span className="text-xs text-slate-400">
                (Baseline: {simulation.baseline_days_cover ?? 'N/A'}d)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {simulation.simulated_days_cover && simulation.baseline_days_cover && simulation.simulated_days_cover > simulation.baseline_days_cover ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Extended by {(simulation.simulated_days_cover - simulation.baseline_days_cover).toFixed(1)} days
                </span>
              ) : (
                <span className="text-slate-400">Current run-rate cover</span>
              )}
            </div>
          </div>

          {/* Risk Score */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Composite Risk Score</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${
                simulation.simulated_risk_score >= 65 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {simulation.simulated_risk_score}
              </span>
              <span className="text-xs text-slate-400">
                (Baseline: {simulation.baseline_risk_score})
              </span>
            </div>
            <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-1">
              {simulation.impact_priority_delta}
            </div>
          </div>

          {/* Stockout Timeline */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Projected Stockout</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {simulation.simulated_stockout_day ? `Day ${simulation.simulated_stockout_day}` : 'None in window'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Lead time: {simulation.simulated_lead_time_days} days
            </div>
          </div>

          {/* Recommended Action Handoff */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                Simulation Handoff
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                Ready to commit this decision?
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/operations/transfers')}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Execute Normal Transfer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Trajectory Comparison Chart */}
      {simulation && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Projected Day-by-Day Stock Trajectory ({horizonDays}-Day Horizon)
              </h2>
              <p className="text-xs text-slate-500">
                Compares Baseline depletion (slate dashed) with Simulated scenario (purple solid) against Safety Reorder threshold (red dotted).
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulation.projected_stock_by_day}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: 'Days Ahead', position: 'insideBottom', offset: -5, fontSize: 11 }} />
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
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="baseline_projected"
                  stroke="#64748b"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Baseline Trajectory"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="simulated_projected"
                  stroke="#9333ea"
                  strokeWidth={3}
                  name="Simulated Scenario Trajectory"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="reorder_threshold"
                  stroke="#e11d48"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  name="Safety Reorder Threshold"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Assumptions Applied & Guidance */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Simulation Assumptions & Strategy Synthesis:
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              {simulation.assumptions_applied.map((asm, idx) => (
                <li key={idx}>{asm}</li>
              ))}
            </ul>
            <div className="pt-2 text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Info className="h-4 w-4 shrink-0" />
              <span>{simulation.decision_guidance}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
