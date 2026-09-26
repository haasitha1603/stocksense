import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  CheckCircle2,
  AlertCircle,
  Warehouse as WarehouseIcon,
  Check,
  Package
} from 'lucide-react';
import { api } from '../services/api';
import { Delivery, Product, Warehouse, Location } from '../types';

export const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [sourceWarehouseId, setSourceWarehouseId] = useState<number>(0);
  const [sourceLocationId, setSourceLocationId] = useState<number>(0);
  const [customerRef, setCustomerRef] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Array<{ product_id: number; quantity_requested: number }>>([
    { product_id: 0, quantity_requested: 10 }
  ]);

  const loadData = async () => {
    try {
      const [delivRes, prodRes, whRes] = await Promise.all([
        api.getDeliveries(),
        api.getProducts(),
        api.getWarehouses()
      ]);
      setDeliveries(delivRes);
      setProducts(prodRes);
      setWarehouses(whRes);

      if (whRes.length > 0 && !sourceWarehouseId) {
        setSourceWarehouseId(whRes[0].id);
        if (whRes[0].locations.length > 0) {
          setSourceLocationId(whRes[0].locations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load deliveries data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWarehouseChange = (whId: number) => {
    setSourceWarehouseId(whId);
    const wh = warehouses.find(w => w.id === whId);
    if (wh && wh.locations.length > 0) {
      setSourceLocationId(wh.locations[0].id);
    }
  };

  const handleValidate = async (id: number) => {
    setValidatingId(id);
    setFeedbackMsg('');
    setErrorMsg('');
    try {
      await api.validateDelivery(id);
      setFeedbackMsg('Delivery dispatched! Stock decremented and customer outbound movement recorded.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Validation failed. Check available stock.');
    } finally {
      setValidatingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.createDelivery({
        source_warehouse_id: sourceWarehouseId,
        source_location_id: sourceLocationId,
        customer_reference: customerRef,
        notes,
        lines: lines.filter(l => l.product_id > 0 && l.quantity_requested > 0)
      });
      setIsModalOpen(false);
      setFeedbackMsg('Delivery order created and ready for validation.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create delivery');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Truck className="h-7 w-7 text-blue-600" />
            <span>Deliveries (Outgoing Customer Orders)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pick, pack, and validate customer shipments. Strict atomic validation prevents negative inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Delivery Order</span>
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

      {/* Deliveries Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Delivery #</th>
                <th className="py-3 px-4">Customer Reference</th>
                <th className="py-3 px-4">Dispatch Source</th>
                <th className="py-3 px-4">Requested Lines</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No delivery records found.
                  </td>
                </tr>
              ) : (
                deliveries.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-xs text-blue-600 dark:text-blue-400">
                      {d.delivery_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium text-xs">
                      {d.customer_reference || 'Standard Dispatch'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">
                      {d.source_warehouse_name} ({d.source_location_name})
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {d.lines.map((l, idx) => (
                        <div key={idx} className="font-semibold text-slate-800 dark:text-slate-200">
                          {l.quantity_requested} × {l.product_name}
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        d.status === 'Done'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {d.status === 'Done' ? (
                        <span className="text-blue-600 text-xs font-semibold inline-flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Dispatched
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={validatingId === d.id}
                          onClick={() => handleValidate(d.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {validatingId === d.id ? 'Validating...' : 'Validate & Dispatch'}
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

      {/* Create Delivery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Create Customer Delivery Order
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Source Warehouse *
                  </label>
                  <select
                    value={sourceWarehouseId}
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
                    Pick Location *
                  </label>
                  <select
                    value={sourceLocationId}
                    onChange={e => setSourceLocationId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {warehouses
                      .find(w => w.id === sourceWarehouseId)
                      ?.locations.map((loc: Location) => (
                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Customer / Sales Order Reference
                </label>
                <input
                  type="text"
                  required
                  value={customerRef}
                  onChange={e => setCustomerRef(e.target.value)}
                  placeholder="e.g. Apex Industrial Works (SO-9921)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Line items */}
              <div className="space-y-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                  Items to Deliver
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
                      <option value={0}>Select Product to Pick...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - {p.total_available} avail
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Qty"
                      value={line.quantity_requested}
                      onChange={e => {
                        const newLines = [...lines];
                        newLines[idx].quantity_requested = Number(e.target.value);
                        setLines(newLines);
                      }}
                      className="w-24 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                ))}
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
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Create Delivery Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
