import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, ArrowRight, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName,
        organization_name: orgName,
        email,
        password,
        role: 'admin'
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
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
        <div className="text-center space-y-2">
          <NavLink to="/" className="inline-flex h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black items-center justify-center font-black text-2xl shadow-md">
            S
          </NavLink>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Create Workspace
          </h1>
          <p className="text-xs text-zinc-500 font-light">
            Set up an isolated multi-warehouse tenant with pre-provisioned facilities.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block font-mono uppercase text-zinc-600 dark:text-zinc-400 mb-1">
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block font-mono uppercase text-zinc-600 dark:text-zinc-400 mb-1">
              Company / Workspace Name
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="e.g. Apex Industrial Works"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block font-mono uppercase text-zinc-600 dark:text-zinc-400 mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="elena@apexworks.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block font-mono uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                Confirm
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-700 dark:text-zinc-300">Auto-provisioned on signup:</div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Main Distribution Center + Regional Annex B</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Starter SKUs (Steel Rods, Circuit Boards) & live stock</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Initializing Workspace Facilities...' : (
              <>
                <span>Create Workspace & Enter</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500">
          Already registered?{' '}
          <NavLink to="/login" className="text-zinc-900 dark:text-white font-bold hover:underline">
            Sign In Instead
          </NavLink>
        </div>
      </div>
    </div>
  );
};
