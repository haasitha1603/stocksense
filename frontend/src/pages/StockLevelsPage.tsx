import React, { useState, useEffect } from 'react';
import { Layers, Warehouse, Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import { StockLevel, Warehouse as WarehouseType } from '../types';

export const StockLevelsPage: React.FC = () => {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [matrix, setMatrix] = useState<{ warehouses: string[]; rows: any[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'list'>('matrix');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelsRes, matrixRes] = await Promise.all([
          api.getStockLevels(),
          api.getStockMatrix()
        ]);
        setStockLevels(levelsRes);
        setMatrix(matrixRes);
      } catch (err) {
        console.error('Failed to load stock levels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMatrixRows = matrix?.rows.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.sku.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="h-7 w-7 text-blue-600" />
            <span>Stock Availability Matrix</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time on-hand, reserved, and available stock distributed across all warehouse facilities.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'matrix'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Multi-Warehouse Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'list'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Detailed Location List
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Filter by product name or SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400"
        />
      </div>

      {/* View: Multi-Warehouse Matrix */}
      {activeTab === 'matrix' && matrix && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">SKU / Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Criticality</th>
                  {matrix.warehouses.map((wh, idx) => (
                    <th key={idx} className="py-3 px-4 text-right">
                      {wh}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                    Total Available
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMatrixRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-xs text-blue-600 dark:text-blue-400">
                      {row.sku}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {row.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        row.criticality === 'Critical'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {row.criticality}
                      </span>
                    </td>
                    {matrix.warehouses.map((wh, whIdx) => (
                      <td key={whIdx} className="py-3 px-4 text-right text-xs">
                        <span className={`font-semibold ${
                          (row.warehouse_stocks[wh] || 0) <= 0
                            ? 'text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {row.warehouse_stocks[wh] || 0}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400">{row.unit}</span>
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white text-sm">
                      {row.total_available} <span className="text-xs text-slate-400 font-normal">{row.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View: Detailed Location List */}
      {activeTab === 'list' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Specific Location</th>
                  <th className="py-3 px-4 text-right">On-Hand</th>
                  <th className="py-3 px-4 text-right">Reserved</th>
                  <th className="py-3 px-4 text-right">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockLevels.map(sl => (
                  <tr key={sl.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {sl.product_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                      {sl.sku}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs">
                      {sl.warehouse_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      {sl.location_name}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white">
                      {sl.on_hand}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {sl.reserved}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {sl.available} {sl.unit_of_measure}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
