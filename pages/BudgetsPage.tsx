import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { Link } from 'react-router-dom';
import { Plus, FileText, Calendar, Filter, X, Pencil, Trash, Store, Phone } from 'lucide-react';

export default function BudgetsPage() {
  const { budgets, deleteBudget } = useApp();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredBudgets = useMemo(() => {
    return budgets.filter(budget => {
      const budgetDate = new Date(budget.data);
      // Reset time to start of day for accurate comparison logic based on local date
      budgetDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const [y, m, d] = startDate.split('-').map(Number);
        const start = new Date(y, m - 1, d);
        if (budgetDate < start) return false;
      }

      if (endDate) {
        const [y, m, d] = endDate.split('-').map(Number);
        const end = new Date(y, m - 1, d);
        // Compare with end of the day
        end.setHours(23, 59, 59, 999);
        if (budgetDate > end) return false;
      }

      return true;
    });
  }, [budgets, startDate, endDate]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleDelete = (id: string, numero: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o orçamento ${numero}?`)) {
      deleteBudget(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-500">Histórico de orçamentos de fornecedores.</p>
        </div>
        <Link 
          to="/orcamentos/novo"
          className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} className="mr-2" />
          Novo Orçamento
        </Link>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex items-center gap-2 text-gray-700 font-medium min-w-max">
          <Filter size={18} className="text-accent" />
          <span>Filtrar por data:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs uppercase font-bold pointer-events-none">De</span>
            <input 
              type="date" 
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none w-full sm:w-auto"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <span className="hidden sm:inline text-gray-400">até</span>
          <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs uppercase font-bold pointer-events-none">Até</span>
            <input 
              type="date" 
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none w-full sm:w-auto"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          {(startDate || endDate) && (
            <button 
              onClick={clearFilters}
              className="sm:ml-auto px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <X size={16} />
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBudgets.length > 0 ? (
          filteredBudgets.map((budget) => (
            <div key={budget.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 space-y-4 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-accent bg-blue-50 px-2 py-1 rounded">
                    {budget.numero}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    to={`/orcamentos/editar/${budget.id}`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(budget.id, budget.numero)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-500 flex items-center gap-1 -mt-2">
                <Calendar size={14} />
                {new Date(budget.data).toLocaleDateString('pt-BR')}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                   <Store size={18} className="text-gray-400"/>
                   {budget.fornecedorNome}
                </h3>
                {budget.fornecedorTelefone && (
                  <p className="text-sm text-gray-500 ml-6 flex items-center gap-1">
                    <Phone size={12} /> {budget.fornecedorTelefone}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                 <div className="text-sm text-gray-500">
                    {budget.itens.length} {budget.itens.length === 1 ? 'item' : 'itens'}
                 </div>
                 <div className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="text-sm font-normal text-gray-400 mr-1">Total:</span>
                    {budget.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-lg border border-dashed border-gray-300">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum orçamento encontrado</h3>
            <p className="text-gray-500 mb-6">
              {(startDate || endDate) 
                ? "Tente ajustar os filtros de data." 
                : "Crie seu primeiro orçamento para começar."}
            </p>
            {!startDate && !endDate && (
              <Link 
                to="/orcamentos/novo"
                className="text-accent hover:text-blue-700 font-medium"
              >
                Criar agora &rarr;
              </Link>
            )}
            {(startDate || endDate) && (
                 <button 
                  onClick={clearFilters}
                  className="text-accent hover:text-blue-700 font-medium"
                >
                  Limpar filtros
                </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}