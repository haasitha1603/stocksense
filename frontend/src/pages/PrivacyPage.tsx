import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const PrivacyPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setErrorMsg('You must acknowledge the statutory retention of stock ledger audit records.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.submitDeletionRequest({
        email,
        reason,
        confirm_audit_retention: confirmed
      });
      setStatusMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <ShieldCheck className="h-7 w-7 text-blue-600" />
          <span>Privacy & Statutory Ledger Retention Policy</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          How StockSense protects your organization's operational data while adhering to financial inventory audit compliance.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Data Governance & Regulatory Boundaries
        </h2>
        <p>
          StockSense strictly segregates each organization's data across isolated tenancy scopes. 
          Under no circumstances does our predictive engine share demand velocities, product costs, or warehouse location data with third parties.
        </p>

        <h3 className="font-bold text-slate-900 dark:text-white pt-2">
          Statutory Audit Trail Retention (Why Ledger Records Cannot Be Deleted)
        </h3>
        <p>
          In compliance with GAAP, SOX, and international inventory accounting standards, all physical stock movements (Receipts, Outbound Deliveries, Transfers, and Adjustments) are written to an <strong>append-only, immutable Stock Movement Ledger</strong>.
        </p>
        <p>
          Account deletion requests will permanently purge user credentials, contact information, and personal identifiers. However, signed inventory transaction movement balances remain pseudonymized to ensure that facility reconciliation audits remain mathematically valid.
        </p>
      </div>

      {/* Deletion / GDPR Request Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Initiate Account Data Deletion Request
        </h2>

        {statusMsg ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Account Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="account@company.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Reason for Request (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Facility decommissioning or account closure"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-blue-600"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                I understand and acknowledge that while my user credentials and personal identifiers will be purged, statutory stock ledger movement records will be retained in pseudonymized form for operational reconciliation.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit GDPR / Deletion Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
