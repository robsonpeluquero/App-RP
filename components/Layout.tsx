import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Package, FileText, LayoutDashboard, Menu, X, BarChart2, Calculator, LogOut, User, Settings, ClipboardCheck, Ruler, Blocks, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, toast, hideToast, confirmDialog, closeConfirmation } = useApp();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <BarChart2 size={20} /> },
    { to: '/orcamentos', label: 'Orçamentos', icon: <FileText size={20} /> },
    { to: '/materiais', label: 'Materiais', icon: <Package size={20} /> },
    { to: '/medicoes', label: 'Medições e Aditivos', icon: <Ruler size={20} /> },
    { to: '/calculadora', label: 'Calculadora', icon: <Calculator size={20} /> },
    { to: '/checklist', label: 'Checklist', icon: <ClipboardCheck size={20} /> },
    { to: '/integracoes', label: 'Integrações', icon: <Blocks size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      
      {/* --- UI Feedback Components --- */}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60] animate-in fade-in slide-in-from-right duration-300 max-w-sm w-full">
          <div className={`bg-white rounded-lg shadow-lg border-l-4 p-4 flex items-start gap-3 ${
            toast.type === 'success' ? 'border-green-500' : 
            toast.type === 'error' ? 'border-red-500' : 'border-blue-500'
          }`}>
            <div className="shrink-0 pt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="text-green-500" size={20} />}
              {toast.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
              {toast.type === 'info' && <Info className="text-blue-500" size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900">{toast.title}</h4>
              {toast.message && <p className="text-sm text-gray-600 mt-1">{toast.message}</p>}
            </div>
            <button onClick={hideToast} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  confirmDialog.variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{confirmDialog.title}</h3>
              </div>
              <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={closeConfirmation}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                  {confirmDialog.cancelLabel || 'Cancelar'}
                </button>
                <button 
                  onClick={() => {
                    confirmDialog.onConfirm();
                    closeConfirmation();
                  }}
                  className={`px-4 py-2 text-white rounded-md font-medium shadow-sm transition-colors ${
                    confirmDialog.variant === 'danger' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-accent hover:bg-blue-700'
                  }`}
                >
                  {confirmDialog.confirmLabel || 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Main App Layout --- */}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <LayoutDashboard className="text-accent" />
            <span>Obra360</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-accent'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <NavLink 
            to="/profile"
            className="flex items-center gap-3 mb-4 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-accent transition-colors">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Settings size={16} className="text-gray-400 group-hover:text-accent" />
          </NavLink>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center h-16 px-4 bg-white border-b border-gray-200 flex-shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-lg text-gray-900">Obra360</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;