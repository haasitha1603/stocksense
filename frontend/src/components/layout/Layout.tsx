import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CookieConsent } from './CookieConsent';
import { CopilotDrawer } from '../intelligence/CopilotDrawer';

export const Layout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenCopilot={() => setCopilotOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
          onOpenCopilot={() => setCopilotOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="py-6 px-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} StockSense IMS. Grounded Operational Intelligence Platform.
          </div>
          <div className="flex items-center gap-4">
            <a href="/about" className="hover:text-slate-700 dark:hover:text-slate-300">About</a>
            <a href="/contact" className="hover:text-slate-700 dark:hover:text-slate-300">Contact</a>
            <a href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300">Privacy & Ledger Compliance</a>
          </div>
        </footer>
      </div>

      {/* Copilot Drawer */}
      <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
};
