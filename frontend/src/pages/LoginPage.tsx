import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogIn, KeyRound, Sparkles, AlertCircle, ArrowRight, Sun, Moon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white flex items-center justify-center p-4 font-sans transition-colors">
      {/* Top right theme toggle */}
      <div className="fixed top-4 right-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-neutral-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer shadow-sm"
          title="Toggle appearance"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-neutral-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <NavLink to="/" className="inline-flex h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black items-center justify-center font-black text-2xl shadow-md">
            S
          </NavLink>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Welcome to StockSense
          </h1>
          <p className="text-xs text-zinc-500 font-light">
            Sign in to access your inventory telemetry and risk radar.
          </p>
        </div>

        {/* Demo Fast-Track Pill */}
        <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-white">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              Demo Fast-Track
            </span>
            <span className="text-[10px] font-mono uppercase bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
              1-Click
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            Click below to autofill pre-seeded demonstration credentials:
          </p>
          <button
            type="button"
            onClick={handleAutofillAdmin}
            className="w-full py-2 px-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Autofill Demo Admin Credentials
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block font-mono uppercase text-zinc-600 dark:text-zinc-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@stocksense.io"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-mono uppercase text-zinc-600 dark:text-zinc-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to StockSense</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500">
          Need a workspace?{' '}
          <NavLink to="/register" className="text-zinc-900 dark:text-white font-bold hover:underline">
            Create New Workspace
          </NavLink>
        </div>
      </div>

      {/* Mock Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Reset Password (Demo OTP)
            </h3>
            <p className="text-xs text-zinc-500">
              Enter your email to request the demo OTP verification code:
            </p>

            {resetMsg && (
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-mono">
                {resetMsg}
              </div>
            )}

            <form onSubmit={handleResetRequest} className="space-y-3">
              <input
                type="email"
                required
                placeholder="your.email@company.com"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs"
              >
                Send Mock OTP
              </button>
            </form>

            <form onSubmit={handleResetConfirm} className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <input
                type="text"
                placeholder="OTP Code (123456)"
                value={resetOtp}
                onChange={e => setResetOtp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
              />
              <input
                type="password"
                placeholder="New Password (min 6 chars)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
