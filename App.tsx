import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MaterialsPage from './pages/MaterialsPage';
import BudgetsPage from './pages/BudgetsPage';
import NewBudgetPage from './pages/NewBudgetPage';
import DashboardPage from './pages/DashboardPage';
import CalculatorPage from './pages/CalculatorPage';
import { AppProvider } from './context';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/materiais" element={<MaterialsPage />} />
            <Route path="/orcamentos" element={<BudgetsPage />} />
            <Route path="/orcamentos/novo" element={<NewBudgetPage />} />
            <Route path="/orcamentos/editar/:id" element={<NewBudgetPage />} />
            <Route path="/calculadora" element={<CalculatorPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;