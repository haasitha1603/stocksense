import React from 'react';
import { Menu, Bot, Bell, Search, Sparkles, Mic, Sun, Moon, Compass } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-8 transition-colors">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden cursor-pointer"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500">
          <NavLink to="/dashboard" className="font-bold text-zinc-900 dark:text-white hover:underline">
            StockSense
          </NavLink>
          <span>/</span>
          <span className="text-zinc-600 dark:text-zinc-400">Inventory Operations & Intelligence</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* App Guide / Query Directory Link */}
        <NavLink
          to="/guide"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
          title="App Guide & Query Navigator (Where to view what)"
        >
          <Compass className="h-3.5 w-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Where to View What</span>
          <span className="sm:hidden">Guide</span>
        </NavLink>

        {/* AI Voice Copilot button */}
        <button
          type="button"
          onClick={onOpenCopilot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <Mic className="h-3.5 w-3.5" />
          <span>Ask AI Voice</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Alerts Link */}
        <NavLink
          to="/management/alerts"
          className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Operational Alerts"
          aria-label="View alerts"
        >
          <Bell className="h-4 w-4" />
          {unacknowledgedAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-black" />
          )}
        </NavLink>
      </div>
    </header>
  );
};
