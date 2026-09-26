import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Check } from 'lucide-react';
import { api } from '../services/api';
import { Alert } from '../types';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);

  const fetchAlerts = async () => {
    try {
      const res = await api.getAlerts();
      setAlerts(res);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id: number) => {
    setAcknowledgingId(id);
    try {
      await api.acknowledgeAlert(id);
      fetchAlerts();
    } catch (err) {
      console.error('Acknowledge error:', err);
    } finally {
      setAcknowledgingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Bell className="h-7 w-7 text-rose-600" />
          <span>Operational Alert Center</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time threshold alerts for imminent stockouts, dead stock capital, and discrepancies.
        </p>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            No active alerts at this time.
          </div>
        ) : (
          alerts.map(a => (
            <div
              key={a.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                a.is_acknowledged
                  ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : a.severity === 'critical'
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                  : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  a.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {a.severity === 'critical' ? <ShieldAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {a.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {a.alert_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {a.message}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(a.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {a.is_acknowledged ? (
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Check className="h-3.5 w-3.5" /> Acknowledged
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={acknowledgingId === a.id}
                    onClick={() => handleAcknowledge(a.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {acknowledgingId === a.id ? 'Saving...' : 'Acknowledge'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
