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
  FlaskConical,
  Radio,
  Warehouse,
  Bell,
  Sun,
  Moon,
  LogOut,
  Info,
  PhoneCall,
  ShieldCheck,
  Bot,
  Compass,
  Mic,
  Home
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
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold shadow-xs'
        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-200 dark:border-zinc-800">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={onCloseMobile} title="View Public Landing Page">
            <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-base shadow-sm">
              S
            </div>
            <div>
              <div className="font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5 text-sm">
                StockSense
                <span className="text-[9px] px-1.5 py-0.2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono">
                  v2.0
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">Multi-Warehouse AI</div>
            </div>
          </NavLink>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Overview */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Overview & Help
            </div>
            <nav className="space-y-1">
              <NavLink to="/dashboard" className={navLinkClass} onClick={onCloseMobile}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink to="/guide" className={navLinkClass} onClick={onCloseMobile}>
                <Compass className="h-4 w-4 text-emerald-500" />
                <span className="flex-1">Where to View What</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                  Guide
                </span>
              </NavLink>
              <NavLink to="/" className={navLinkClass} onClick={onCloseMobile}>
                <Home className="h-4 w-4" />
                Public Home Page
              </NavLink>
            </nav>
          </div>

          {/* Operations Hub */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
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

          {/* Intelligence Engine */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Intelligence Engine
            </div>
            <nav className="space-y-1">
              <NavLink to="/intelligence/radar" className={navLinkClass} onClick={onCloseMobile}>
                <Radio className="h-4 w-4" />
                Risk & Reorder Radar
              </NavLink>
              <NavLink to="/intelligence/scenarios" className={navLinkClass} onClick={onCloseMobile}>
                <FlaskConical className="h-4 w-4" />
                What-If Decision Lab
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  onOpenCopilot();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Mic className="h-4 w-4 text-emerald-500" />
                  <span>AI Voice Copilot</span>
                </div>
                <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md text-zinc-500">
                  Voice
                </span>
              </button>
            </nav>
          </div>

          {/* Inventory & Ledger */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Inventory & Ledger
            </div>
            <nav className="space-y-1">
              <NavLink to="/products" className={navLinkClass} onClick={onCloseMobile}>
                <Boxes className="h-4 w-4" />
                Product Catalog
              </NavLink>
              <NavLink to="/inventory/stock-levels" className={navLinkClass} onClick={onCloseMobile}>
                <Layers className="h-4 w-4" />
                Stock Matrix
              </NavLink>
              <NavLink to="/inventory/ledger" className={navLinkClass} onClick={onCloseMobile}>
                <ScrollText className="h-4 w-4" />
                Audit Movement Ledger
              </NavLink>
            </nav>
          </div>

          {/* Management & Trust */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Management
            </div>
            <nav className="space-y-1">
              <NavLink to="/management/warehouses" className={navLinkClass} onClick={onCloseMobile}>
                <Warehouse className="h-4 w-4" />
                Warehouses & Bins
              </NavLink>
              <NavLink to="/management/alerts" className={navLinkClass} onClick={onCloseMobile}>
                <Bell className="h-4 w-4" />
                Alert Center
              </NavLink>
            </nav>
          </div>
        </div>

        {/* User Footer with Theme Toggle */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          {/* User profile card */}
          {user && (
            <div className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="truncate mr-2">
                <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-zinc-500 truncate font-mono">
                  {user.organization_name || user.email}
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Theme switcher button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{theme === 'dark' ? 'Light Appearance' : 'Dark High Contrast'}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 capitalize">{theme}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
