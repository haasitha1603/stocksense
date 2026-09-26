import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';

// Public Landing & Query Pages
import { HomePage } from './pages/HomePage';
import { AppGuidePage } from './pages/AppGuidePage';

// Workspace Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { StockLevelsPage } from './pages/StockLevelsPage';
import { LedgerPage } from './pages/LedgerPage';
import { ReceiptsPage } from './pages/ReceiptsPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { TransfersPage } from './pages/TransfersPage';
import { AdjustmentsPage } from './pages/AdjustmentsPage';
import { WhatIfLabPage } from './pages/WhatIfLabPage';
import { RadarPage } from './pages/RadarPage';
import { WarehousesPage } from './pages/WarehousesPage';
import { AlertsPage } from './pages/AlertsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black text-zinc-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-zinc-900 dark:border-white border-t-transparent animate-spin" />
          <div className="text-xs font-mono font-semibold">Loading StockSense Workspace...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const GuideRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black text-zinc-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-zinc-900 dark:border-white border-t-transparent animate-spin" />
          <div className="text-xs font-mono font-semibold">Loading App Guide...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Layout>
        <AppGuidePage />
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white transition-colors selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col justify-between">
      <div>
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-8 py-3.5 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-black flex items-center justify-center text-sm">
                  S
                </div>
                <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">StockSense</span>
              </a>
              <span className="text-xs font-mono text-zinc-400 border-l border-zinc-200 dark:border-zinc-800 pl-3 hidden sm:inline">
                App Guide & Query Directory
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <a href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                ← Back to Home
              </a>
              <a href="/login" className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm hover:opacity-90 transition-opacity">
                Sign In
              </a>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <AppGuidePage />
        </main>
      </div>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 lg:px-8 max-w-7xl mx-auto w-full text-xs text-zinc-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© 2026 StockSense. Grounded Operational Inventory Platform.</div>
        <div className="flex items-center gap-4">
          <a href="/guide" className="hover:text-black dark:hover:text-white">Guide</a>
          <a href="/about" className="hover:text-black dark:hover:text-white">About</a>
          <a href="/privacy" className="hover:text-black dark:hover:text-white">Privacy</a>
          <a href="/contact" className="hover:text-black dark:hover:text-white">Contact</a>
        </div>
      </footer>
    </div>
  );
};

const PublicPageLayout: React.FC<{ children: React.ReactNode; pageTitle?: string }> = ({ children, pageTitle }) => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white transition-colors selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col justify-between">
      <div>
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-8 py-3.5 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-black flex items-center justify-center text-sm">
                  S
                </div>
                <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">StockSense</span>
              </a>
              {pageTitle && (
                <span className="text-xs font-mono text-zinc-400 border-l border-zinc-200 dark:border-zinc-800 pl-3 hidden sm:inline">
                  {pageTitle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <a href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                ← Back to Home
              </a>
              <a href="/guide" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                App Guide
              </a>
              <a href="/login" className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm hover:opacity-90 transition-opacity">
                Sign In
              </a>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 lg:px-8 max-w-7xl mx-auto w-full text-xs text-zinc-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© 2026 StockSense. Grounded Operational Inventory Platform.</div>
        <div className="flex items-center gap-4">
          <a href="/guide" className="hover:text-black dark:hover:text-white">Guide</a>
          <a href="/about" className="hover:text-black dark:hover:text-white">About</a>
          <a href="/privacy" className="hover:text-black dark:hover:text-white">Privacy</a>
          <a href="/contact" className="hover:text-black dark:hover:text-white">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing Home Page */}
              <Route path="/" element={<HomePage />} />

              {/* Public Guide / Query Directory Route */}
              <Route path="/guide" element={<GuideRoute />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Public Information Pages */}
              <Route path="/about" element={<PublicPageLayout pageTitle="About"><AboutPage /></PublicPageLayout>} />
              <Route path="/contact" element={<PublicPageLayout pageTitle="Contact & Support"><ContactPage /></PublicPageLayout>} />
              <Route path="/privacy" element={<PublicPageLayout pageTitle="Privacy & Compliance"><PrivacyPage /></PublicPageLayout>} />

              {/* Convenience redirect */}
              <Route path="/app" element={<Navigate to="/dashboard" replace />} />

              {/* Protected Workspace Routes (wrapped in Layout) */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/inventory/stock-levels" element={<StockLevelsPage />} />
                <Route path="/inventory/ledger" element={<LedgerPage />} />
                <Route path="/operations/receipts" element={<ReceiptsPage />} />
                <Route path="/operations/deliveries" element={<DeliveriesPage />} />
                <Route path="/operations/transfers" element={<TransfersPage />} />
                <Route path="/operations/adjustments" element={<AdjustmentsPage />} />
                <Route path="/intelligence/scenarios" element={<WhatIfLabPage />} />
                <Route path="/intelligence/radar" element={<RadarPage />} />
                <Route path="/management/warehouses" element={<WarehousesPage />} />
                <Route path="/management/alerts" element={<AlertsPage />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
