import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, BrainCircuit, ArrowLeftRight, ScrollText, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          About StockSense
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          AI-powered multi-warehouse inventory optimization and deterministic intelligence platform designed for modern logistics teams.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          The StockSense Mission
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Traditional inventory management platforms only answer: <em>“What stock do I have?”</em> StockSense was built to answer: <strong>“What do I have, what is likely to happen next, and what should I do about it?”</strong>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          By combining strict ACID operational workflows (receipts, deliveries, transfers, physical cycle counts) with explainable predictive forecasting, managers can identify stockout risks weeks before work halts, simulate corrective decisions in the What-If? Lab, and verify outcomes in an append-only immutable ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-fit">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Grounded AI & Statistics</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All forecasts and reorder recommendations are mathematically calculated from real customer deliveries—zero hallucinated numbers.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 w-fit">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">What-If? Decision Lab</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Simulate demand surges, port disruptions, or warehouse transfers side-by-side with guaranteed zero mutation side effects.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit">
            <ScrollText className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Immutable Audit Trail</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every balance mutation writes a signed ledger event. Stock balances reconcile to history with zero silent database edits.
          </p>
        </div>
      </div>
    </div>
  );
};
