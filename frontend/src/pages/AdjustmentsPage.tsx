import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Warehouse as WarehouseIcon,
  History
} from 'lucide-react';
import { api } from '../services/api';
import { Adjustment, Product, Warehouse, Location } from '../types';

export const AdjustmentsPage: React.FC = () => {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [warehouseId, setWarehouseId] = useState<number>(0);
  const [locationId, setLocationId] = useState<number>(0);
  const [productId, setProductId] = useState<number>(0);
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reason, setReason] = useState<string>('count_error');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    try {
      const [adjRes, prodRes, whRes] = await Promise.all([
        api.getAdjustments(),
        api.getProducts(),
        api.getWarehouses()
      ]);
      setAdjustments(adjRes);
      setProducts(prodRes);
      setWarehouses(whRes);

      if (whRes.length > 0 && !warehouseId) {
        setWarehouseId(whRes[0].id);
        if (whRes[0].locations.length > 0) {
          setLocationId(whRes[0].locations[0].id);
        }
      }
      if (prodRes.length > 0 && !productId) {
        setProductId(prodRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load adjustments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWarehouseChange = (whId: number) => {
    setWarehouseId(whId);
    const wh = warehouses.find(w => w.id === whId);
    if (wh && wh.locations.length > 0) {
      setLocationId(wh.locations[0].id);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const adj = await api.createAdjustment({
        warehouse_id: warehouseId,
        location_id: locationId,
        product_id: productId,
        physical_count: physicalCount,
        reason,
        notes
      });
      setIsModalOpen(false);
      setFeedbackMsg(`Physical count adjustment ${adj.adjustment_number} completed. Balance updated to ${adj.physical_count} units (Signed Delta: ${adj.delta_quantity > 0 ? '+' : ''}${adj.delta_quantity}).`);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Adjustment failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <SlidersHorizontal className="h-7 w-7 text-amber-600" />
            <span>Physical Stock Adjustments</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reconcile physical cycle counts with system records. Signed delta movements are permanently logged.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Stock Count Adjustment</span>
        </button>
      </div>

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

      {/* Adjustments Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Adjustment #</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Warehouse & Location</th>
                <th className="py-3 px-4 text-right">System Qty</th>
                <th className="py-3 px-4 text-right">Physical Count</th>
                <th className="py-3 px-4 text-right">Signed Variance</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No physical count adjustments recorded yet.
                  </td>
                </tr>
              ) : (
                adjustments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-xs text-amber-600 dark:text-amber-400">
                      {a.adjustment_number}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white text-xs">
                      {a.product_name} <span className="font-mono text-slate-400 font-normal">({a.sku})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">
                      {a.warehouse_name} ({a.location_name})
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 text-xs">
                      {a.system_quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white text-xs">
                      {a.physical_count}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-xs">
                      <span className={`inline-block px-2 py-0.5 rounded-full ${
                        a.delta_quantity > 0
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : a.delta_quantity < 0
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}>
                        {a.delta_quantity > 0 ? `+${a.delta_quantity}` : a.delta_quantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs capitalize text-slate-700 dark:text-slate-300">
                      {a.reason.replace('_', ' ')}
                      {a.notes && <span className="text-[10px] text-slate-400 block truncate">{a.notes}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 text-xs">
                      {new Date(a.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Physical Inventory Count Adjustment
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Product *
                </label>
                <select
                  value={productId}
                  onChange={e => setProductId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Warehouse *
                  </label>
                  <select
                    value={warehouseId}
                    onChange={e => handleWarehouseChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Location *
                  </label>
                  <select
                    value={locationId}
                    onChange={e => setLocationId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {warehouses
                      .find(w => w.id === warehouseId)
                      ?.locations.map((loc: Location) => (
                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Physical Counted Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={physicalCount}
                    onChange={e => setPhysicalCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Mandatory Reason *
                  </label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="count_error">Physical Count Error</option>
                    <option value="damage">Damaged Goods</option>
                    <option value="missing">Unexplained Shrinkage / Missing</option>
                    <option value="expired">Expired / Obsolete</option>
                    <option value="other">Other Operational Discrepancy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Investigation Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Recount confirmed by shift lead"
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
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs"
                >
                  Confirm Physical Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
