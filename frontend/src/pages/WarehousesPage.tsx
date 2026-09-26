import React, { useState, useEffect } from 'react';
import { Warehouse, Plus, Layers, MapPin, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Warehouse as WarehouseType } from '../types';

export const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [selectedWhId, setSelectedWhId] = useState<number>(0);

  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locType, setLocType] = useState('Storage');

  const fetchWarehouses = async () => {
    try {
      const res = await api.getWarehouses();
      setWarehouses(res);
      if (res.length > 0 && !selectedWhId) setSelectedWhId(res[0].id);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleCreateWh = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWarehouse({ name: whName, code: whCode.toUpperCase(), address: whAddress });
      setIsWhModalOpen(false);
      setWhName('');
      setWhCode('');
      setWhAddress('');
      fetchWarehouses();
    } catch (err) {
      console.error('Failed to create warehouse:', err);
    }
  };

  const handleCreateLoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLocation({
        warehouse_id: selectedWhId,
        name: locName,
        code: locCode.toUpperCase(),
        location_type: locType
      });
      setIsLocModalOpen(false);
      setLocName('');
      setLocCode('');
      fetchWarehouses();
    } catch (err) {
      console.error('Failed to create location:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Warehouse className="h-7 w-7 text-blue-600" />
            <span>Warehouses & Locations</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Physical multi-warehouse layout, storage bays, and dock check-in areas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLocModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            <span>Add Location</span>
          </button>
          <button
            type="button"
            onClick={() => setIsWhModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Warehouse</span>
          </button>
        </div>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map(w => (
          <div
            key={w.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{w.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-semibold">
                    {w.code}
                  </span>
                </div>
                {w.address && (
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{w.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Operating Zones & Locations ({w.locations.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {w.locations.map(loc => (
                  <div
                    key={loc.id}
                    className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{loc.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{loc.code}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 font-medium">
                      {loc.location_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warehouse Modal */}
      {isWhModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Create New Warehouse</h2>
            <form onSubmit={handleCreateWh} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  value={whName}
                  onChange={e => setWhName(e.target.value)}
                  placeholder="e.g. South Logistics Depot"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Facility Code *</label>
                <input
                  type="text"
                  required
                  value={whCode}
                  onChange={e => setWhCode(e.target.value.toUpperCase())}
                  placeholder="SLD"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Physical Address</label>
                <input
                  type="text"
                  value={whAddress}
                  onChange={e => setWhAddress(e.target.value)}
                  placeholder="Street, City, State"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsWhModalOpen(false)} className="px-3 py-1.5 rounded-lg border text-xs">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">Save Warehouse</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isLocModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Location to Warehouse</h2>
            <form onSubmit={handleCreateLoc} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Target Warehouse *</label>
                <select
                  value={selectedWhId}
                  onChange={e => setSelectedWhId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={e => setLocName(e.target.value)}
                  placeholder="e.g. Aisle 3 / Rack 2"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Location Code *</label>
                <input
                  type="text"
                  required
                  value={locCode}
                  onChange={e => setLocCode(e.target.value.toUpperCase())}
                  placeholder="A3-R2"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Type</label>
                <select
                  value={locType}
                  onChange={e => setLocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Storage">General Storage</option>
                  <option value="Receiving">Inbound Receiving Dock</option>
                  <option value="Production">Production Floor Rack</option>
                  <option value="Shipping">Outbound Shipping Bay</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsLocModalOpen(false)} className="px-3 py-1.5 rounded-lg border text-xs">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
