import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  Plus,
  CheckCircle2,
  Clock,
  Warehouse as WarehouseIcon,
  AlertCircle,
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { Receipt, Product, Warehouse, Supplier, Location } from '../types';



export const ReceiptsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [destWarehouseId, setDestWarehouseId] = useState<number>(0);
  const [destLocationId, setDestLocationId] = useState<number>(0);
  const [supplierId, setSupplierId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Array<{ product_id: number; quantity_expected: number }>>([
    { product_id: 0, quantity_expected: 20 }
  ]);

  const loadData = async () => {
    try {
      const [recRes, prodRes, whRes, suppRes] = await Promise.all([
        api.getReceipts(),
        api.getProducts(),
        api.getWarehouses(),
        api.getSuppliers()
      ]);
      setReceipts(recRes);
      setProducts(prodRes);
      setWarehouses(whRes);
      setSuppliers(suppRes);

      if (whRes.length > 0 && !destWarehouseId) {
        setDestWarehouseId(whRes[0].id);
        if (whRes[0].locations.length > 0) {
          setDestLocationId(whRes[0].locations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load receipts data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWarehouseChange = (whId: number) => {
    setDestWarehouseId(whId);
    const wh = warehouses.find(w => w.id === whId);
    if (wh && wh.locations.length > 0) {
      setDestLocationId(wh.locations[0].id);
    }
  };

  const handleValidate = async (id: number) => {
    setValidatingId(id);
    setFeedbackMsg('');
    setErrorMsg('');
    try {
      await api.validateReceipt(id);
      setFeedbackMsg('Receipt validated successfully! Quantities added to stock and recorded in audit ledger.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Validation failed');
    } finally {
      setValidatingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.createReceipt({
        destination_warehouse_id: destWarehouseId,
        destination_location_id: destLocationId,
        supplier_id: supplierId,
        notes,
        lines: lines.filter(l => l.product_id > 0 && l.quantity_expected > 0)
      });
      setIsModalOpen(false);
      setFeedbackMsg('Inbound receipt draft created.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create receipt');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <PackagePlus className="h-7 w-7 text-emerald-600" />
            <span>Receipts (Inbound Goods)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Vendor deliveries and dock check-ins. Atomic validation atomically increments stock and ledger.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Receipt</span>
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

      {/* Receipts Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Destination Dock</th>
                <th className="py-3 px-4">Items / Expected</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Validation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No receipts recorded yet.
                  </td>
                </tr>
              ) : (
                receipts.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-xs text-blue-600 dark:text-blue-400">
                      {r.receipt_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium text-xs">
                      {r.supplier_name || 'Direct Transfer / Unspecified'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">
                      {r.destination_warehouse_name} ({r.destination_location_name})
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {r.lines.map((l, idx) => (
                        <div key={idx} className="font-semibold text-slate-800 dark:text-slate-200">
                          {l.quantity_expected} × {l.product_name}
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        r.status === 'Done'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {r.status === 'Done' ? (
                        <span className="text-emerald-600 text-xs font-semibold inline-flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Stock Updated
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={validatingId === r.id}
                          onClick={() => handleValidate(r.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {validatingId === r.id ? 'Validating...' : 'Validate Receipt'}
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
                Create Inbound Receipt
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Destination Warehouse *
                  </label>
                  <select
                    value={destWarehouseId}
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
                    Receiving Dock Location *
                  </label>
                  <select
                    value={destLocationId}
                    onChange={e => setDestLocationId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {warehouses
                      .find(w => w.id === destWarehouseId)
                      ?.locations.map((loc: Location) => (
                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Supplier (Optional)
                </label>
                <select
                  value={supplierId || ''}
                  onChange={e => setSupplierId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="">Select Supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.lead_time_days}d lead)</option>
                  ))}
                </select>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                  Items to Receive
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
                      value={line.quantity_expected}
                      onChange={e => {
                        const newLines = [...lines];
                        newLines[idx].quantity_expected = Number(e.target.value);
                        setLines(newLines);
                      }}
                      className="w-24 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Notes / PO Reference
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. PO-8832 vendor delivery"
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
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Receipt Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
