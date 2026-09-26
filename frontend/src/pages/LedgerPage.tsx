import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  SlidersHorizontal,
  Download,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { StockMovement, Warehouse } from '../types';

export const LedgerPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('All');

  const loadData = async () => {
    try {
      const [moves, whs] = await Promise.all([
        api.getLedger({
          ...(search ? { search } : {}),
          ...(selectedType !== 'All' ? { movement_type: selectedType } : {}),
          ...(selectedWarehouse !== 'All' ? { warehouse_id: selectedWarehouse } : {})
        }),
        api.getWarehouses()
      ]);
      setMovements(moves);
      setWarehouses(whs);
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedType, selectedWarehouse]);

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Product', 'SKU', 'Movement Type', 'Quantity', 'Previous Qty', 'Resulting Qty', 'Warehouse', 'Location', 'Reference ID', 'Transfer Link', 'Reason', 'Actor'];
    const rows = movements.map(m => [
      m.id,
      m.created_at,
      `"${m.product_name || ''}"`,
      m.sku || '',
      m.movement_type,
      m.quantity,
      m.previous_quantity,
      m.resulting_quantity,
      `"${m.warehouse_name || ''}"`,
      `"${m.location_name || ''}"`,
      m.reference_id,
      m.transfer_link_id || '',
      `"${m.reason || ''}"`,
      m.actor_name || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ScrollText className="h-7 w-7 text-indigo-600" />
            <span>Stock Movement Audit Ledger</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable, append-only operational journal of every quantity change across all facilities.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reference ID (PO, DEL, TRF, ADJ) or reason..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Movement Types</option>
            <option value="RECEIPT">Inbound Receipts</option>
            <option value="DELIVERY">Outbound Deliveries</option>
            <option value="TRANSFER_OUT">Transfer Out</option>
            <option value="TRANSFER_IN">Transfer In</option>
            <option value="ADJUSTMENT">Physical Adjustments</option>
          </select>

          <select
            value={selectedWarehouse}
            onChange={e => setSelectedWarehouse(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4">Warehouse & Location</th>
                <th className="py-3 px-4 text-right">Signed Delta</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4">Reference / Link</th>
                <th className="py-3 px-4">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    No ledger movements match the current filter.
                  </td>
                </tr>
              ) : (
                movements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] inline-flex items-center gap-1 ${
                        m.movement_type === 'RECEIPT' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700' :
                        m.movement_type === 'DELIVERY' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700' :
                        m.movement_type === 'TRANSFER_OUT' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700' :
                        m.movement_type === 'TRANSFER_IN' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700' :
                        'bg-amber-100 dark:bg-amber-950 text-amber-700'
                      }`}>
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                      {m.product_name} <span className="font-mono text-slate-400 font-normal">({m.sku})</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300">
                      {m.warehouse_name} <span className="text-slate-400 font-mono">({m.location_name})</span>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${
                      m.quantity > 0 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {m.previous_quantity} → <strong className="text-slate-900 dark:text-white">{m.resulting_quantity}</strong>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700 dark:text-slate-300">{m.reference_id}</div>
                      {m.transfer_link_id && (
                        <div className="text-[10px] text-purple-600 dark:text-purple-400 font-sans">
                          Linked: {m.transfer_link_id}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500">
                      {m.actor_name || 'System'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
