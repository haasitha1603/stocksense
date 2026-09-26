import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  ScrollText,
  PackagePlus,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  BrainCircuit,
  FlaskConical,
  Warehouse,
  Bell,
  Sun,
  Moon,
  LogOut,
  Info,
  PhoneCall,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenCopilot: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile, onOpenCopilot }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white font-semibold shadow-sm'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={onCloseMobile}>
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
              S
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                StockSense
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold uppercase">
                  AI MVP
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Inventory Intelligence</div>
            </div>
          </NavLink>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Overview */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Overview
            </div>
            <nav className="space-y-1">
              <NavLink to="/" end className={navLinkClass} onClick={onCloseMobile}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
            </nav>
          </div>

          {/* Operations Hub */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Operations Hub
            </div>
            <nav className="space-y-1">
              <NavLink to="/operations/receipts" className={navLinkClass} onClick={onCloseMobile}>
                <PackagePlus className="h-4 w-4" />
                Receipts (Inbound)
              </NavLink>
              <NavLink to="/operations/deliveries" className={navLinkClass} onClick={onCloseMobile}>
                <Truck className="h-4 w-4" />
                Deliveries (Outbound)
              </NavLink>
              <NavLink to="/operations/transfers" className={navLinkClass} onClick={onCloseMobile}>
                <ArrowLeftRight className="h-4 w-4" />
                Internal Transfers
              </NavLink>
              <NavLink to="/operations/adjustments" className={navLinkClass} onClick={onCloseMobile}>
                <SlidersHorizontal className="h-4 w-4" />
                Physical Adjustments
              </NavLink>
            </nav>
          </div>

          {/* Inventory Catalog */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Inventory & Ledger
            </div>
            <nav className="space-y-1">
              <NavLink to="/products" className={navLinkClass} onClick={onCloseMobile}>
                <Boxes className="h-4 w-4" />
                Product Catalog
              </NavLink>
              <NavLink to="/inventory/stock-levels" className={navLinkClass} onClick={onCloseMobile}>
                <Layers className="h-4 w-4" />
                Location Matrix
              </NavLink>
              <NavLink to="/inventory/ledger" className={navLinkClass} onClick={onCloseMobile}>
                <ScrollText className="h-4 w-4" />
                Audit Stock Ledger
              </NavLink>
            </nav>
          </div>

          {/* Intelligence & Scenarios */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Predictive Intelligence</span>
              <span className="text-[10px] px-1 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-medium">
                Live
              </span>
            </div>
            <nav className="space-y-1">
              <NavLink to="/intelligence/scenarios" className={navLinkClass} onClick={onCloseMobile}>
                <FlaskConical className="h-4 w-4 text-purple-500" />
                What-If? Decision Lab
              </NavLink>
              <NavLink to="/intelligence/radar" className={navLinkClass} onClick={onCloseMobile}>
                <BrainCircuit className="h-4 w-4 text-amber-500" />
                Risk & Reorder Radar
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  onOpenCopilot();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer text-left"
              >
                <Bot className="h-4 w-4" />
                <span>Ask AI Copilot</span>
              </button>
            </nav>
          </div>

          {/* Management */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Management
            </div>
            <nav className="space-y-1">
              <NavLink to="/management/warehouses" className={navLinkClass} onClick={onCloseMobile}>
                <Warehouse className="h-4 w-4" />
                Warehouses & Zones
              </NavLink>
              <NavLink to="/management/alerts" className={navLinkClass} onClick={onCloseMobile}>
                <Bell className="h-4 w-4" />
                Alerts Center
              </NavLink>
            </nav>
          </div>

          {/* Trust & Company */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Platform & Trust
            </div>
            <nav className="space-y-1">
              <NavLink to="/about" className={navLinkClass} onClick={onCloseMobile}>
                <Info className="h-4 w-4" />
                About StockSense
              </NavLink>
              <NavLink to="/contact" className={navLinkClass} onClick={onCloseMobile}>
                <PhoneCall className="h-4 w-4" />
                Contact & Support
              </NavLink>
              <NavLink to="/privacy" className={navLinkClass} onClick={onCloseMobile}>
                <ShieldCheck className="h-4 w-4" />
                Privacy & Data Request
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Footer: User profile, Theme toggle & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 space-y-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.full_name || 'Stock Manager'}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">{user?.role || 'Operator'}</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
