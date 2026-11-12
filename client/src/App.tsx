import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { LandingPage } from './features/landing/LandingPage';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { InvoiceBuilderPage } from './features/invoices/InvoiceBuilderPage';
import { InvoiceListPage } from './features/invoices/InvoiceListPage';
import { CustomerListPage } from './features/customers/CustomerListPage';
import { ProductListPage } from './features/products/ProductListPage';
import { PaymentListPage } from './features/payments/PaymentListPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { ActivityLogsPage } from './features/activity/ActivityLogsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { AboutPage } from './features/about/AboutPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Software Landing Page */}
            <Route path="/landing" element={<LandingPage />} />

            {/* Manager Sign-In */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated Application Shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="invoices/new" element={<InvoiceBuilderPage />} />
              <Route path="invoices" element={<InvoiceListPage />} />
              <Route path="customers" element={<CustomerListPage />} />
              <Route path="products" element={<ProductListPage />} />
              <Route path="payments" element={<PaymentListPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="activity" element={<ActivityLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="about" element={<AboutPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
