import React, { useMemo } from 'react';
import { useApp } from '../context';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Award, Activity, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { budgets } = useApp();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalValue = budgets.reduce((acc, b) => acc + b.valorTotal, 0);
    const count = budgets.length;
    const avg = count > 0 ? totalValue / count : 0;
    
    // Sort by value (descending)
    const sortedByValue = [...budgets].sort((a, b) => b.valorTotal - a.valorTotal);
    const bestBudget = sortedByValue[0] || null;
    const top5 = sortedByValue.slice(0, 5);

    // Sort by date (newest first)
    const sortedByDate = [...budgets].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    const recent5 = sortedByDate.slice(0, 7).reverse(); // Last 7 items, chronological order for chart

    return { totalValue, count, avg, bestBudget, top5, recent5 };
  }, [budgets]);

  // Formatting helper
  const formatMoney = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Chart Scaling Calculation
  const maxChartValue = Math.max(
    ...stats.recent5.map(b => b.valorTotal),
    stats.bestBudget ? stats.bestBudget.valorTotal : 0,
    100 // Minimum scale
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral e comparativos de performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Orçado</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatMoney(stats.totalValue)}</div>
          <p className="text-xs text-green-600 mt-1 font-medium flex items-center">
            <TrendingUp size={12} className="mr-1" />
            Valor acumulado
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Orçamentos</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Activity size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.count}</div>
          <p className="text-xs text-gray-500 mt-1">Total gerado</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Maior Orçamento</h3>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <Award size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.bestBudget ? formatMoney(stats.bestBudget.valorTotal) : 'R$ 0,00'}
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {stats.bestBudget?.fornecedorNome || '-'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Média por Cotação</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatMoney(stats.avg)}</div>
          <p className="text-xs text-gray-500 mt-1">Valor médio</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Recent Activity vs Best Benchmark */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Atividade Recente</h3>
            <p className="text-sm text-gray-500">Últimos 7 orçamentos comparados ao maior valor.</p>
          </div>
          
          <div className="flex-1 flex items-end gap-2 h-64 relative pt-8">
            {/* Benchmark Line (Best Budget) */}
            {stats.bestBudget && (
              <div 
                className="absolute w-full border-t-2 border-dashed border-yellow-400 z-10 pointer-events-none flex items-center"
                style={{ bottom: `${(stats.bestBudget.valorTotal / maxChartValue) * 100}%` }}
              >
                <span className="absolute right-0 -top-6 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded font-medium">
                  Recorde: {formatMoney(stats.bestBudget.valorTotal)}
                </span>
              </div>
            )}

            {stats.recent5.length > 0 ? (
              stats.recent5.map((budget) => {
                const heightPercentage = (budget.valorTotal / maxChartValue) * 100;
                const isBest = stats.bestBudget && budget.id === stats.bestBudget.id;
                
                return (
                  <div key={budget.id} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs p-2 rounded pointer-events-none whitespace-nowrap z-20">
                      {budget.fornecedorNome}: {formatMoney(budget.valorTotal)}
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-500 ${isBest ? 'bg-yellow-400' : 'bg-accent hover:bg-blue-700'}`}
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                    
                    {/* Label */}
                    <div className="mt-2 text-xs text-gray-400 rotate-0 truncate w-full text-center">
                      {new Date(budget.data).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Sem dados recentes
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Top 5 List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top 5 Fornecedores</h3>
              <p className="text-sm text-gray-500">Maiores orçamentos registrados.</p>
            </div>
            <Link to="/orcamentos" className="text-sm text-accent hover:underline flex items-center">
              Ver todos <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.top5.length > 0 ? (
              stats.top5.map((budget, index) => {
                const percentage = (budget.valorTotal / (stats.bestBudget?.valorTotal || 1)) * 100;
                
                return (
                  <div key={budget.id} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                          {index + 1}
                        </span>
                        {budget.fornecedorNome}
                      </span>
                      <span className="font-bold text-gray-900">{formatMoney(budget.valorTotal)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${index === 0 ? 'bg-yellow-400' : 'bg-blue-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-gray-400">
                Nenhum orçamento registrado ainda.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}