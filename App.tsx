import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import MaterialsPage from './pages/MaterialsPage';
import BudgetsPage from './pages/BudgetsPage';
import NewBudgetPage from './pages/NewBudgetPage';
import DashboardPage from './pages/DashboardPage';
import CalculatorPage from './pages/CalculatorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import ChecklistPage from './pages/ChecklistPage';
import MeasurementsPage from './pages/MeasurementsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import UsersPage from './pages/UsersPage';
import UpdateManager from './components/UpdateManager';
import { AppProvider, useApp } from './context';

// Wrapper for protected routes
const ProtectedRoute = () => {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/materiais" element={<MaterialsPage />} />
        <Route path="/orcamentos" element={<BudgetsPage />} />
        <Route path="/orcamentos/novo" element={<NewBudgetPage />} />
        <Route path="/orcamentos/editar/:id" element={<NewBudgetPage />} />
        <Route path="/medicoes" element={<MeasurementsPage />} />
        <Route path="/calculadora" element={<CalculatorPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/integracoes" element={<IntegrationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/usuarios" element={<UsersPage />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <UpdateManager />
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;