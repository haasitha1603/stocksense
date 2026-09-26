import React, { useState, useEffect, useMemo } from 'react';
import { Layers, Warehouse, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '../services/api';
import { StockLevel, Warehouse as WarehouseType } from '../types';

type ListSortKey = 'product_name' | 'sku' | 'warehouse_name' | 'location_name' | 'on_hand' | 'reserved' | 'available';
type MatrixSortKey = 'sku' | 'name' | 'criticality' | 'total_available';
type SortDirection = 'asc' | 'desc';

export const StockLevelsPage: React.FC = () => {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [matrix, setMatrix] = useState<{ warehouses: string[]; rows: any[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'list'>('matrix');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Sorting state for Detailed Location List
  const [listSortKey, setListSortKey] = useState<ListSortKey>('product_name');
  const [listSortDirection, setListSortDirection] = useState<SortDirection>('asc');

  // Sorting state for Multi-Warehouse Matrix
  const [matrixSortKey, setMatrixSortKey] = useState<MatrixSortKey>('name');
  const [matrixSortDirection, setMatrixSortDirection] = useState<SortDirection>('asc');

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

  const handleListSort = (key: ListSortKey) => {
    if (listSortKey === key) {
      setListSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setListSortKey(key);
      setListSortDirection('asc');
    }
  };

  const handleMatrixSort = (key: MatrixSortKey) => {
    if (matrixSortKey === key) {
      setMatrixSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setMatrixSortKey(key);
      setMatrixSortDirection('asc');
    }
  };

  const sortedMatrixRows = useMemo(() => {
    const rows = matrix?.rows || [];
    const filtered = rows.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.sku.toLowerCase().includes(search.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const valA = a[matrixSortKey];
      const valB = b[matrixSortKey];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return matrixSortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA ?? '').toLowerCase();
      const strB = String(valB ?? '').toLowerCase();
      return matrixSortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [matrix, search, matrixSortKey, matrixSortDirection]);

  const sortedStockLevels = useMemo(() => {
    const filtered = stockLevels.filter(sl =>
      sl.product_name.toLowerCase().includes(search.toLowerCase()) ||
      sl.sku.toLowerCase().includes(search.toLowerCase()) ||
      sl.warehouse_name.toLowerCase().includes(search.toLowerCase()) ||
      sl.location_name.toLowerCase().includes(search.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const valA = a[listSortKey];
      const valB = b[listSortKey];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return listSortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA ?? '').toLowerCase();
      const strB = String(valB ?? '').toLowerCase();
      return listSortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [stockLevels, search, listSortKey, listSortDirection]);

  const renderSortIcon = (currentKey: string, activeKey: string, direction: SortDirection) => {
    if (currentKey !== activeKey) {
      return (
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
      );
    }
    return direction === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
    );
  };

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
                  <th
                    className="py-3 px-4 cursor-pointer select-none group hover:text-slate-900 dark:hover:text-white transition-colors"
                    onClick={() => handleMatrixSort('sku')}
                    title="Sort by SKU"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>SKU / Code</span>
                      {renderSortIcon('sku', matrixSortKey, matrixSortDirection)}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer select-none group hover:text-slate-900 dark:hover:text-white transition-colors"
                    onClick={() => handleMatrixSort('name')}
                    title="Sort by Product Name"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Product Name</span>
                      {renderSortIcon('name', matrixSortKey, matrixSortDirection)}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer select-none group hover:text-slate-900 dark:hover:text-white transition-colors"
                    onClick={() => handleMatrixSort('criticality')}
                    title="Sort by Criticality"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Criticality</span>
                      {renderSortIcon('criticality', matrixSortKey, matrixSortDirection)}
                    </div>
                  </th>
                  {matrix.warehouses.map((wh, idx) => (
                    <th key={idx} className="py-3 px-4 text-right">
                      {wh}
                    </th>
                  ))}
                  <th
                    className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white cursor-pointer select-none group hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => handleMatrixSort('total_available')}
                    title="Sort by Total Available"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Total Available</span>
                      {renderSortIcon('total_available', matrixSortKey, matrixSortDirection)}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedMatrixRows.length === 0 ? (
                  <tr>
                    <td colSpan={4 + matrix.warehouses.length} className="py-8 text-center text-sm text-slate-400">
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  sortedMatrixRows.map((row, idx) => (
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
                  ))
                )}
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
                  <th
                    className="py-3 px-4 cursor-pointer select-none group hover:text-slate-900 dark:hover:text-white transition-colors"
                    onClick={() => handleListSort('product_name')}
                    title="Sort by Product Name"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Product Name</span>
                      {renderSortIcon('product_name', listSortKey, listSortDirection)}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer select-none group hover:text-slate-900 dark:hover:text-white transition-colors"
                    onClick={() => handleListSort('sku')}
                    title="Sort by SKU"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>SKU</span>
                      {renderSortIcon('sku', listSortKey, listSortDirection)}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer select-none group hover:text-slate-900 dark:hover:text-white transition-colors"
                    onClick={() => handleListSort('warehouse_name')}
                    title="Sort by Warehouse"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Warehouse</span>
                      {renderSortIcon('warehouse_name', listSortKey, listSortDirection)}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer select-none group hover:text-slate-900 dark:hover:text-white transition-colors"
                    onClick={() => handleListSort('location_name')}
                    title="Sort by Specific Location"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Specific Location</span>
                      {renderSortIcon('location_name', listSortKey, listSortDirection)}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer select-none group hover:text-slate-900 dark:hover:text-white transition-colors"
                    onClick={() => handleListSort('on_hand')}
                    title="Sort by On-Hand"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>On-Hand</span>
                      {renderSortIcon('on_hand', listSortKey, listSortDirection)}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer select-none group hover:text-slate-900 dark:hover:text-white transition-colors"
                    onClick={() => handleListSort('reserved')}
                    title="Sort by Reserved"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Reserved</span>
                      {renderSortIcon('reserved', listSortKey, listSortDirection)}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer select-none group hover:text-slate-900 dark:hover:text-white transition-colors"
                    onClick={() => handleListSort('available')}
                    title="Sort by Available"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Available</span>
                      {renderSortIcon('available', listSortKey, listSortDirection)}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedStockLevels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-slate-400">
                      No matching stock level records found.
                    </td>
                  </tr>
                ) : (
                  sortedStockLevels.map(sl => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
