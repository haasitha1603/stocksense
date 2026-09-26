import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  FlaskConical,
  Filter,
  CheckCircle2,
  Package
} from 'lucide-react';
import { api } from '../services/api';
import { StockoutRiskItem } from '../types';

export const RadarPage: React.FC = () => {
  const [risks, setRisks] = useState<StockoutRiskItem[]>([]);
  const [criticalityFilter, setCriticalityFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const res = await api.getStockoutRisks();
        setRisks(res);
      } catch (err) {
        console.error('Failed to load risk radar:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, []);

  const filteredRisks = risks.filter(r =>
    criticalityFilter === 'All' ? true : r.business_criticality === criticalityFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BrainCircuit className="h-7 w-7 text-amber-500" />
            <span>Risk & Reorder Radar</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explainable stockout risk rankings weighted by probability × product business criticality.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={criticalityFilter}
            onChange={e => setCriticalityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">All Criticality Tiers</option>
            <option value="Critical">Critical Priority Only</option>
            <option value="Standard">Standard Only</option>
            <option value="Low">Low Only</option>
          </select>
        </div>
      </div>

      {/* Hero Explainer Card */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-amber-600 shrink-0" />
        <div>
          <strong>Transparent Impact-Weighted Scoring Policy:</strong> Risk scores are calculated deterministically from run-rate demand velocity and days of cover, then weighted by Business Criticality. A lower-probability shortage on a <em>Critical</em> component outranks an imminent shortage on a <em>Low-criticality</em> item to safeguard production uptime.
        </div>
      </div>

      {/* Risk Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRisks.map((r, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {r.product_name}
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    SKU: {r.sku} • Lead Time: {r.lead_time_days} days
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    r.business_criticality === 'Critical'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {r.business_criticality} Tier
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-extrabold ${
                    r.risk_score >= 65
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  }`}>
                    {r.risk_score} pts
                  </span>
                </div>
              </div>

              {/* Metrics pills */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Available Stock</span>
                  <span className="font-bold text-slate-900 dark:text-white">{r.available_stock} units</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Daily Demand</span>
                  <span className="font-bold text-blue-600">{r.daily_demand_rate}/d</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Coverage Runway</span>
                  <span className={`font-bold ${r.days_of_cover && r.days_of_cover <= r.lead_time_days ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                    ~{r.days_of_cover ?? 'N/A'} days
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {r.evidence}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigate('/intelligence/scenarios')}
                className="px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                <span>Simulate</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/products/${r.product_id}`)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <span>Reorder Analysis</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
