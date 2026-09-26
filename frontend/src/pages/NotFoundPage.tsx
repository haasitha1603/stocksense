import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeft, PackageSearch } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-5">
        <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
          <PackageSearch className="h-10 w-10" />
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">404</h1>
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 mt-1">
            Warehouse Location Not Found
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The page or operational route you requested does not exist or has been relocated to another warehouse bin.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <NavLink
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
