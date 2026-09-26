import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  Warehouse as WarehouseIcon,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Transfer, Product, Warehouse, TransferRecommendation, Location } from '../types';


export const TransfersPage: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [recommendations, setRecommendations] = useState<TransferRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [sourceWarehouseId, setSourceWarehouseId] = useState<number>(0);
  const [sourceLocationId, setSourceLocationId] = useState<number>(0);
  const [destWarehouseId, setDestWarehouseId] = useState<number>(0);
  const [destLocationId, setDestLocationId] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Array<{ product_id: number; quantity: number }>>([
    { product_id: 0, quantity: 40 }
  ]);

  const loadData = async () => {
    try {
      const [trfRes, prodRes, whRes, recRes] = await Promise.all([
        api.getTransfers(),
        api.getProducts(),
        api.getWarehouses(),
        api.getTransferRecommendations()
      ]);
      setTransfers(trfRes);
      setProducts(prodRes);
      setWarehouses(whRes);
      setRecommendations(recRes);

      if (whRes.length >= 2) {
        // Warehouse B to Main Warehouse default
        const whB = whRes.find(w => w.code === 'WHB') || whRes[1];
        const whMain = whRes.find(w => w.code === 'MWH') || whRes[0];

        setSourceWarehouseId(whB.id);
        if (whB.locations.length > 0) setSourceLocationId(whB.locations[0].id);

        setDestWarehouseId(whMain.id);
        if (whMain.locations.length > 0) setDestLocationId(whMain.locations[0].id);
      }

      // Default line item to Steel Rods
      const steel = prodRes.find(p => p.sku === 'SKU-STL-001');
      if (steel) {
        setLines([{ product_id: steel.id, quantity: 40 }]);
      }
    } catch (err) {
      console.error('Failed to load transfers data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyRecommendation = (rec: TransferRecommendation) => {
    setSourceWarehouseId(rec.source_warehouse_id);
    setSourceLocationId(rec.source_location_id);
    setDestWarehouseId(rec.destination_warehouse_id);
    setDestLocationId(rec.destination_location_id);
    setLines([{ product_id: rec.product_id, quantity: rec.recommended_transfer_quantity }]);
    setNotes(`Rebalancing stock based on AI transfer intelligence: ${rec.evidence}`);
    setIsModalOpen(true);
  };

  const handleValidate = async (id: number) => {
    setValidatingId(id);
    setFeedbackMsg('');
    setErrorMsg('');
    try {
      await api.validateTransfer(id);
      setFeedbackMsg('Transfer executed! Atomically updated source and destination stocks. Paired TRANSFER_OUT and TRANSFER_IN entries created with zero company-wide balance drift.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Transfer failed');
    } finally {
      setValidatingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (sourceLocationId === destLocationId) {
      setErrorMsg('Source location and destination location must be distinct.');
      return;
    }

    try {
      const created = await api.createTransfer({
        source_warehouse_id: sourceWarehouseId,
        source_location_id: sourceLocationId,
        destination_warehouse_id: destWarehouseId,
        destination_location_id: destLocationId,
        notes,
        lines: lines.filter(l => l.product_id > 0 && l.quantity > 0)
      });
      setIsModalOpen(false);
      setFeedbackMsg(`Transfer order ${created.transfer_number} created.`);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create transfer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <ArrowLeftRight className="h-7 w-7 text-purple-600" />
              <span>Internal Transfers</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Company Invariant Preserved
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Rebalance stock across locations. Creates paired TRANSFER_OUT and TRANSFER_IN ledger records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Transfer</span>
        </button>
      </div>

      {/* AI Recommendation Quick Action Pill */}
      {recommendations.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 border border-purple-200 dark:border-purple-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Live Rebalance Recommendation: Transfer {recommendations[0].recommended_transfer_quantity} Units of {recommendations[0].product_name}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                From <strong>{recommendations[0].source_warehouse_name}</strong> ({recommendations[0].source_surplus} surplus units) to{' '}
                <strong>{recommendations[0].destination_warehouse_name}</strong> (facing shortage). Preserves source safety buffer.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleApplyRecommendation(recommendations[0])}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shrink-0 shadow-xs transition-colors cursor-pointer"
          >
            Prefill & Review Transfer
          </button>
        </div>
      )}

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Transfers Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Transfer #</th>
                <th className="py-3 px-4">Origin (Source)</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Transfer Items</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Execution Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transfers logged yet.
                  </td>
                </tr>
              ) : (
                transfers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-xs text-purple-600 dark:text-purple-400">
                      {t.transfer_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 text-xs">
                      {t.source_warehouse_name} ({t.source_location_name})
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 text-xs">
                      {t.destination_warehouse_name} ({t.destination_location_name})
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 dark:text-white">
                      {t.lines.map((l, idx) => (
                        <div key={idx}>
                          {l.quantity} × {l.product_name}
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        t.status === 'Done'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {t.status === 'Done' ? (
                        <span className="text-purple-600 text-xs font-semibold inline-flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Paired In/Out Logged
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={validatingId === t.id}
                          onClick={() => handleValidate(t.id)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {validatingId === t.id ? 'Validating...' : 'Validate & Execute'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Initiate Inter-Warehouse Transfer
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                {/* Source */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Source Warehouse *
                  </label>
                  <select
                    value={sourceWarehouseId}
                    onChange={e => {
                      const id = Number(e.target.value);
                      setSourceWarehouseId(id);
                      const wh = warehouses.find(w => w.id === id);
                      if (wh && wh.locations.length > 0) setSourceLocationId(wh.locations[0].id);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>

                  <select
                    value={sourceLocationId}
                    onChange={e => setSourceLocationId(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    {warehouses
                      .find(w => w.id === sourceWarehouseId)
                      ?.locations.map((loc: Location) => (
                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                      ))}
                  </select>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Destination Warehouse *
                  </label>
                  <select
                    value={destWarehouseId}
                    onChange={e => {
                      const id = Number(e.target.value);
                      setDestWarehouseId(id);
                      const wh = warehouses.find(w => w.id === id);
                      if (wh && wh.locations.length > 0) setDestLocationId(wh.locations[0].id);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>

                  <select
                    value={destLocationId}
                    onChange={e => setDestLocationId(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    {warehouses
                      .find(w => w.id === destWarehouseId)
                      ?.locations.map((loc: Location) => (
                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Items to transfer */}
              <div className="space-y-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                  Product & Units to Transfer
                </label>
                {lines.map((line, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      value={line.product_id}
                      onChange={e => {
                        const newLines = [...lines];
                        newLines[idx].product_id = Number(e.target.value);
                        setLines(newLines);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option value={0}>Select Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={e => {
                        const newLines = [...lines];
                        newLines[idx].quantity = Number(e.target.value);
                        setLines(newLines);
                      }}
                      className="w-24 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Reason / Operational Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Stock balancing to prevent line stockout"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
                >
                  Create Transfer Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
