import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogIn, KeyRound, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock OTP modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillAdmin = () => {
    setEmail('admin@stocksense.io');
    setPassword('password123');
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.resetPasswordRequest({ email: resetEmail });
      setResetMsg(res.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.resetPasswordConfirm({
        email: resetEmail,
        otp: resetOtp,
        new_password: newPassword
      });
      setResetMsg(res.message);
      setTimeout(() => setShowResetModal(false), 2000);
    } catch (err: any) {
      setResetMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 text-white items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/25">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome to StockSense
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your inventory telemetry and risk radar.
          </p>
        </div>

        {/* Demo Fast-Track Pill */}
        <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-blue-900 dark:text-blue-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Judging Demo Fast-Track
            </span>
            <span className="text-[10px] uppercase bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">Quick Test</span>
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-400">
            One-click autofill pre-seeded demonstration credentials:
          </p>
          <button
            type="button"
            onClick={handleAutofillAdmin}
            className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Autofill Operations Director Credentials
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@stocksense.io"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have a workspace yet?{' '}
          <NavLink to="/register" className="text-blue-600 hover:underline font-semibold">
            Create an Account
          </NavLink>
        </div>
      </div>

      {/* Mock OTP Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-bold text-slate-900 dark:text-white">Reset Account Password</h2>
              <button onClick={() => setShowResetModal(false)}>✕</button>
            </div>

            <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px]">
              Note: This is a clearly marked mock development OTP flow for testing.
            </div>

            {resetMsg && (
              <div className="p-2 rounded bg-blue-50 text-blue-700 text-xs font-mono">
                {resetMsg}
              </div>
            )}

            {!resetMsg.includes('Use OTP') ? (
              <form onSubmit={handleResetRequest} className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-semibold">
                  Request Mock OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetConfirm} className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Enter OTP (e.g. 123456)</label>
                  <input
                    type="text"
                    required
                    value={resetOtp}
                    onChange={e => setResetOtp(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded font-semibold">
                  Update Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
