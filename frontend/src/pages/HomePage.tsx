import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  ArrowLeftRight,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Sun,
  Moon,
  Layers,
  Database,
  BarChart3,
  Bot,
  Activity,
  Sliders,
  Compass,
  Mic,
  Code
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Interactive UI Components
import { AIVoice } from '../components/ui/AIVoice';
import { CardFlip } from '../components/ui/CardFlip';
import { WarehouseTransferCard } from '../components/ui/WarehouseTransferCard';

export const HomePage: React.FC = () => {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Interactive Live Demo Simulator State
  const [activeTab, setActiveTab] = useState<'simulation' | 'transfer' | 'voice' | 'radar' | 'ledger'>('simulation');
  const [isTransferApplied, setIsTransferApplied] = useState(false);
  const [demandMultiplier, setDemandMultiplier] = useState(1.0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Compute live simulated values for Steel Rods (Hero SKU)
  const baseMainStock = 85;
  const baseAnnexStock = 160;
  const transferUnits = 40;
  const dailyBurn = 14 * demandMultiplier;

  const currentMainStock = isTransferApplied ? baseMainStock + transferUnits : baseMainStock;
  const currentAnnexStock = isTransferApplied ? baseAnnexStock - transferUnits : baseAnnexStock;
  const daysCover = (currentMainStock / dailyBurn).toFixed(1);
  const isStockoutAverted = Number(daysCover) > 8.0;

  // Demo auto-login handler
  const handleLaunchDemo = async () => {
    setIsSimulating(true);
    try {
      await login({ email: 'admin@stocksense.io', password: 'password123' });
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      navigate('/login');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-x-hidden font-sans transition-colors duration-300">
      {/* Subtle tech background grid (clean, no annoying mouse spotlight) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP PUBLIC NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-xl flex items-center justify-center tracking-tighter shadow-md group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                StockSense
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono">
                  v2.0
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono tracking-wide">
                MULTI-WAREHOUSE INTELLIGENCE
              </div>
            </div>
          </NavLink>

          {/* Quick Anchor Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            <NavLink to="/guide" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
              <Compass className="h-3.5 w-3.5 text-emerald-500" />
              <span>Where to View What</span>
            </NavLink>
            <a href="#operational-loop" className="hover:text-black dark:hover:text-white transition-colors">
              30s Loop
            </a>
            <a href="#interactive-lab" className="hover:text-black dark:hover:text-white transition-colors">
              Live Sandbox
            </a>
            <a href="#architecture" className="hover:text-black dark:hover:text-white transition-colors">
              Invariants
            </a>
            <NavLink to="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
              Privacy & GDPR
            </NavLink>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Dark/Light Theme Switch Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <NavLink
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md"
              >
                <span>Workspace ({user.organization_name || 'Active'})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="px-3.5 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  Sign In
                </NavLink>

                <button
                  type="button"
                  onClick={handleLaunchDemo}
                  disabled={isSimulating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>{isSimulating ? 'Connecting...' : 'Launch Demo'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CLASSIC FULL-WIDTH HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-20 pb-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs font-mono text-zinc-700 dark:text-zinc-300"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Odoo-Grade Inventory Invariants + Gemini 3.8 Flash</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.08]"
          >
            Autonomous Multi-Warehouse <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400 dark:from-white dark:via-zinc-300 dark:to-zinc-500">
              Inventory Intelligence.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Know what you have. See what could go wrong. Know what to do next — and verify the updated stock and auditable ledger in under 30 seconds.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
          >
            <button
              type="button"
              onClick={handleLaunchDemo}
              disabled={isSimulating}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black font-bold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>Launch Live Preloaded Demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <NavLink
              to="/register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Create Isolated Workspace</span>
            </NavLink>

            <NavLink
              to="/guide"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
            >
              <Compass className="h-4 w-4 text-emerald-500" />
              <span>Where to View What</span>
            </NavLink>
          </motion.div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <div className="text-[10px] font-mono text-zinc-400">OPERATIONAL LOOP</div>
              <div className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">&lt; 30 Seconds</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <div className="text-[10px] font-mono text-zinc-400">DOUBLE ENTRY</div>
              <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">100% Conserved</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <div className="text-[10px] font-mono text-zinc-400">WHAT-IF ENGINE</div>
              <div className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">Zero-Mutation</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <div className="text-[10px] font-mono text-zinc-400">AI COPILOT</div>
              <div className="text-lg font-extrabold text-zinc-700 dark:text-zinc-200 tracking-tight">Gemini 3.8 Flash</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. LIVE INTERACTIVE SANDBOX WIDGET */}
        {/* ========================================================================= */}
        <div id="interactive-lab" className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-neutral-950 shadow-2xl overflow-hidden p-6 sm:p-8">
            {/* Header with Navigation Pills using LayoutId */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-bold">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    Hero Scenario: Steel Rods Stockout Risk
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono">
                      CRITICAL RISK
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    SKU-STL-001 • Main Warehouse vs Regional Annex B
                  </div>
                </div>
              </div>

              {/* Shared Element LayoutId Pills */}
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                {(['simulation', 'transfer', 'voice', 'radar', 'ledger'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                      activeTab === tab ? 'text-black dark:text-white font-bold' : 'text-zinc-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeSandboxTabPill"
                        className="absolute inset-0 bg-white dark:bg-black rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Contents with Framer Motion AnimatePresence & layout */}
            <AnimatePresence mode="wait">
              {activeTab === 'simulation' && (
                <motion.div
                  key="sim"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="pt-6 space-y-6"
                >
                  {/* Interactive Knobs Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <div className="flex justify-between text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-2">
                        <span>DEMAND ACCELERATION SHIFT</span>
                        <span className="font-bold">{Math.round(demandMultiplier * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.6"
                        step="0.1"
                        value={demandMultiplier}
                        onChange={e => setDemandMultiplier(Number(e.target.value))}
                        className="w-full accent-black dark:accent-white cursor-pointer"
                      />
                      <div className="text-[11px] text-zinc-500 mt-1 font-light">
                        Simulate rapid outbound consumption from customer deliveries.
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:border-l md:border-zinc-200 dark:md:border-zinc-800 md:pl-6">
                      <div>
                        <div className="text-xs font-mono text-zinc-700 dark:text-zinc-300">INTER-WAREHOUSE TRANSFER</div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5">
                          {isTransferApplied ? '40 Units Transferred from Annex B' : 'No Transfer Planned (Baseline)'}
                        </div>
                      </div>
                      <motion.button
                        layout
                        type="button"
                        onClick={() => setIsTransferApplied(!isTransferApplied)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isTransferApplied
                            ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                            : 'bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200'
                        }`}
                      >
                        {isTransferApplied ? '✓ Revert Action' : 'Simulate Transfer'}
                      </motion.button>
                    </div>
                  </div>

                  {/* Stock Level Real-Time Visualization */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Main Warehouse Stock */}
                    <motion.div
                      layout
                      className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col justify-between"
                    >
                      <div className="text-xs font-mono text-zinc-500 uppercase">Main Warehouse (Target)</div>
                      <div className="my-3 flex items-baseline gap-2">
                        <motion.span layout className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                          {currentMainStock}
                        </motion.span>
                        <span className="text-xs text-zinc-500">Units on-hand</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <motion.div
                          layout
                          className={`h-full ${isStockoutAverted ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, (currentMainStock / 150) * 100)}%` }}
                        />
                      </div>
                    </motion.div>

                    {/* Regional Annex B Surplus */}
                    <motion.div
                      layout
                      className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col justify-between"
                    >
                      <div className="text-xs font-mono text-zinc-500 uppercase">Regional Annex B (Surplus)</div>
                      <div className="my-3 flex items-baseline gap-2">
                        <motion.span layout className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                          {currentAnnexStock}
                        </motion.span>
                        <span className="text-xs text-zinc-500">Units available</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <motion.div
                          layout
                          className="h-full bg-zinc-500"
                          style={{ width: `${Math.min(100, (currentAnnexStock / 200) * 100)}%` }}
                        />
                      </div>
                    </motion.div>

                    {/* Projected Days of Cover */}
                    <motion.div
                      layout
                      className={`p-5 rounded-2xl border flex flex-col justify-between ${
                        isStockoutAverted
                          ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20'
                      }`}
                    >
                      <div className="text-xs font-mono text-zinc-500 uppercase">Days of Cover Remaining</div>
                      <div className="my-3 flex items-baseline gap-2">
                        <motion.span
                          layout
                          className={`text-3xl font-extrabold ${
                            isStockoutAverted ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {daysCover} Days
                        </motion.span>
                      </div>
                      <div className="text-xs font-medium">
                        {isStockoutAverted ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            Stockout averted! Replenishment cover secured.
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                            Stockout in {daysCover}d (Supplier Lead: 10d)
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Transfer Card Tab */}
              {activeTab === 'transfer' && (
                <motion.div
                  key="transfer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="pt-6 flex justify-center"
                >
                  <WarehouseTransferCard
                    onConfirm={() => setIsTransferApplied(true)}
                  />
                </motion.div>
              )}

              {/* AI Voice Tab */}
              {activeTab === 'voice' && (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="pt-6 text-center space-y-4"
                >
                  <AIVoice />
                  <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    Try asking: &quot;What products are at stockout risk this week?&quot; or &quot;Show me recommended warehouse transfers.&quot;
                  </div>
                </motion.div>
              )}

              {/* Radar Formula Tab */}
              {activeTab === 'radar' && (
                <motion.div
                  key="radar"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="pt-6 space-y-3 font-mono text-xs text-zinc-600 dark:text-zinc-400"
                >
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="text-zinc-900 dark:text-white font-bold flex items-center justify-between">
                      <span>FORMULA: DETERMINISTIC STOCKOUT RISK CALCULATION</span>
                      <span className="text-emerald-500">EXPLAINABLE</span>
                    </div>
                    <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Daily Demand = (Outbound Delivered Units past 30 days) / 30 = ~14.0 units/day.
                      <br />
                      Days of Cover = Current Stock (85) / Daily Demand (14.0) = 6.07 Days.
                      <br />
                      Supplier Lead Time = 10.0 Days &gt; 6.07 Days → Guaranteed Stockout unless inter-warehouse transfer is authorized.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Ledger Tab */}
              {activeTab === 'ledger' && (
                <motion.div
                  key="ledger"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="pt-6 space-y-3 font-mono text-xs text-zinc-600 dark:text-zinc-400"
                >
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="text-zinc-900 dark:text-white font-bold">DOUBLE-ENTRY ATOMIC AUDIT TRAIL</div>
                    <div className="space-y-1.5 text-zinc-500 dark:text-zinc-400 text-xs">
                      <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 py-1.5">
                        <span className="text-rose-500">-40 Units (TRANSFER_OUT)</span>
                        <span>Location: WH-ANNEX/STOCK</span>
                        <span className="text-zinc-400">Ref: TRF-2026-001</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-emerald-500">+40 Units (TRANSFER_IN)</span>
                        <span>Location: MWH/STOCK</span>
                        <span className="text-zinc-400">Link ID: #8847</span>
                      </div>
                    </div>
                    <div className="pt-2 text-zinc-700 dark:text-zinc-300 font-sans text-xs">
                      Total company balance is strictly conserved with net delta = 0.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE 30-SECOND OPERATIONAL LOOP */}
      {/* ========================================================================= */}
      <section id="operational-loop" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            RAPID RESOLUTION
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            The 30-Second Operational Loop
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            From risk detection to auditable ledger verification in five unambiguous steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Current State', desc: 'Monitor multi-warehouse physical balances & location splits.' },
            { step: '02', title: 'Spot Risk', desc: 'Deterministic daily velocity detects stockout in 6.1 days.' },
            { step: '03', title: 'What-If Lab', desc: 'Simulate transfer or supplier delay without modifying real DB.' },
            { step: '04', title: 'Human Action', desc: 'Authorize transfer with single-click atomic transaction.' },
            { step: '05', title: 'Verify Ledger', desc: 'Immediate ledger audit trail with immutable reference link.' }
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="text-xs font-mono text-zinc-400 mb-2">{item.step}</div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">{item.desc}</p>
              </div>
              <div className="pt-4 text-zinc-400">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ARCHITECTURAL INVARIANTS & 3D CARDS */}
      {/* ========================================================================= */}
      <section id="architecture" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            ENGINEERING PRINCIPLES
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Built on Rigorous Invariants.
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light">
            Hover over each module to inspect the mathematical and operational safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          <CardFlip
            title="Double-Entry Conservation"
            subtitle="Immutable Audit Ledger"
            description="Stock never disappears into thin air. Every internal transfer atomically debits and credits locations with paired movement link IDs."
            features={["Conservation of Mass", "Paired Link ID: #8847", "Zero Balance Leakage", "Append-Only History"]}
            ctaText="Inspect Ledger"
            onCtaClick={() => navigate('/inventory/ledger')}
          />

          <CardFlip
            title="Deterministic Risk Radar"
            subtitle="Transparent Reorder Formulas"
            description="Calculates daily consumption velocity exclusively from verified outbound deliveries over 30 days. No opaque estimations."
            features={["Outbound Velocity Only", "Lead Time Buffers", "MOQ Compliance", "Criticality Multipliers"]}
            ctaText="Open Risk Radar"
            onCtaClick={() => navigate('/intelligence/radar')}
          />

          <CardFlip
            title="Zero-Mutation What-If Lab"
            subtitle="Ephemeral Decision Simulation"
            description="Stress-test supply disruptions, lead time delays, and demand spikes without risking operational database records."
            features={["is_mutation_performed: false", "Read-Only Memory Projections", "Demand Shift Simulation", "Transfer Pre-Testing"]}
            ctaText="Launch What-If Lab"
            onCtaClick={() => navigate('/intelligence/scenarios')}
          />
        </div>

        {/* PostgreSQL Schema Code Block */}
        <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 font-mono text-xs shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-[11px]">
            <span>stocksense_db_schema.sql</span>
            <span>PostgreSQL 18 Atomic Storage</span>
          </div>
          <pre className="pt-4 overflow-x-auto text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            <span className="text-zinc-400">-- Immutable Double-Entry Ledger Invariant</span>{'\n'}
            <span className="text-purple-600 dark:text-purple-400 font-bold">CREATE TABLE</span> stock_movements ({'\n'}
            {'  '}id <span className="text-blue-600 dark:text-blue-400">SERIAL PRIMARY KEY</span>,{'\n'}
            {'  '}product_id <span className="text-blue-600 dark:text-blue-400">INTEGER NOT NULL</span>,{'\n'}
            {'  '}movement_type <span className="text-blue-600 dark:text-blue-400">VARCHAR(50) NOT NULL</span>,{'\n'}
            {'  '}quantity <span className="text-blue-600 dark:text-blue-400">DOUBLE PRECISION NOT NULL</span>,{'\n'}
            {'  '}transfer_link_id <span className="text-blue-600 dark:text-blue-400">INTEGER</span>,{'\n'}
            {'  '}created_at <span className="text-blue-600 dark:text-blue-400">TIMESTAMPTZ DEFAULT NOW()</span>{'\n'}
            );{'\n\n'}
            <span className="text-emerald-600 dark:text-emerald-400">✓ Invariant: Net balance delta strictly equals 0.0</span>{'\n'}
            <span className="text-emerald-600 dark:text-emerald-400">✓ Grounding: Real DB state fed to gemini-3.8-flash</span>
          </pre>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 7. TRUST & FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-black flex items-center justify-center text-sm">
              S
            </div>
            <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">StockSense</span>
            <span className="text-xs text-zinc-400 font-mono">© 2026</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-500 font-mono">
            <NavLink to="/guide" className="hover:text-black dark:hover:text-white transition-colors">
              App Guide
            </NavLink>
            <NavLink to="/about" className="hover:text-black dark:hover:text-white transition-colors">
              About
            </NavLink>
            <NavLink to="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
              Privacy & GDPR
            </NavLink>
            <NavLink to="/contact" className="hover:text-black dark:hover:text-white transition-colors">
              Contact
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
