import React from 'react';
import { Menu, Bot, Bell, Search, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  onOpenCopilot: () => void;
  unacknowledgedAlertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  onOpenCopilot,
  unacknowledgedAlertsCount = 0
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-900 dark:text-white">StockSense</span>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-400">Inventory Operations & Intelligence</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ask AI Copilot button */}
        <button
          type="button"
          onClick={onOpenCopilot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask Copilot</span>
        </button>

        {/* Alerts Link */}
        <NavLink
          to="/management/alerts"
          className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Operational Alerts"
          aria-label="View alerts"
        >
          <Bell className="h-5 w-5" />
          {unacknowledgedAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </NavLink>
      </div>
    </header>
  );
};
