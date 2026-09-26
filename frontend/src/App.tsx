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

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing Home Page */}
              <Route path="/" element={<HomePage />} />

              {/* Public Auth & Information Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

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
                <Route path="/guide" element={<AppGuidePage />} />
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
