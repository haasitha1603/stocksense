import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CookieConsent } from './CookieConsent';
import { CopilotDrawer } from '../intelligence/CopilotDrawer';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white flex selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300 font-sans">
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
          {children || <Outlet />}
        </main>

        {/* Global Footer */}
        <footer className="py-6 px-8 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} StockSense IMS. Grounded Operational Intelligence Platform.
          </div>
          <div className="flex items-center gap-4">
            <a href="/about" className="hover:text-black dark:hover:text-white transition-colors">About</a>
            <a href="/contact" className="hover:text-black dark:hover:text-white transition-colors">Contact</a>
            <a href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy & Ledger Compliance</a>
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
