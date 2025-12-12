import React, { useMemo } from 'react';
import { useApp } from '../context';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Award, Activity, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { budgets } = useApp();

  // Calculate statistics
  const stats = useMemo(() => {
    // Basic Counts
    const count = budgets.length;
    
    // Status Segmentation
    const approvedBudgets = budgets.filter(b => b.status === 'aprovado');
    const pendingBudgets = budgets.filter(b => (b.status || 'em_analise') === 'em_analise');

    // Values
    const approvedValue = approvedBudgets.reduce((acc, b) => acc + b.valorTotal, 0);
    const pendingValue = pendingBudgets.reduce((acc, b) => acc + b.valorTotal, 0);

    // Approval Rate
    const approvalRate = count > 0 ? Math.round((approvedBudgets.length / count) * 100) : 0;
    
    // Sort by value (descending)
    const sortedByValue = [...budgets].sort((a, b) => b.valorTotal - a.valorTotal);
    const top5 = sortedByValue.slice(0, 5);

    // Sort by date (newest first)
    const sortedByDate = [...budgets].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    const recent5 = sortedByDate.slice(0, 7).reverse(); // Last 7 items for chart

    return { 
      approvedValue, 
      pendingValue, 
      count, 
      approvalRate, 
      top5, 
      recent5,
      approvedCount: approvedBudgets.length
    };
  }, [budgets]);

  // Formatting helper
  const formatMoney = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Chart Scaling Calculation
  const maxChartValue = Math.max(
    ...stats.recent5.map(b => b.valorTotal),
    100 // Minimum scale
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral financeira e status das cotações.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Approved Cost (Real Cost) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-2 -mt-2"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-bold text-gray-600">Custo Aprovado</h3>
            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 relative z-10">{formatMoney(stats.approvedValue)}</div>
          <p className="text-xs text-green-600 mt-1 font-medium flex items-center relative z-10">
            <DollarSign size={12} className="mr-1" />
            Valor confirmado
          </p>
        </div>

        {/* KPI 2: Pending Quotes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Em Cotação</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatMoney(stats.pendingValue)}</div>
          <p className="text-xs text-gray-500 mt-1">
            Total em análise
          </p>
        </div>

        {/* KPI 3: Total Budgets Created */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Orçamentos</h3>
            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
              <Activity size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.count}</div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <span className="text-green-600 font-bold">{stats.approvedCount}</span> aprovados
          </p>
        </div>

        {/* KPI 4: Approval Rate */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Taxa de Aprovação</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.approvalRate}%</div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${stats.approvalRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Recent Activity Timeline */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Histórico Recente</h3>
            <p className="text-sm text-gray-500">Valor dos últimos 7 orçamentos.</p>
          </div>
          
          <div className="flex-1 flex items-end gap-3 h-64 relative pt-8 border-b border-gray-100 pb-2">
            {stats.recent5.length > 0 ? (
              stats.recent5.map((budget) => {
                const heightPercentage = (budget.valorTotal / maxChartValue) * 100;
                const isApproved = budget.status === 'aprovado';
                const isRejected = budget.status === 'rejeitado';
                
                return (
                  <div key={budget.id} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs p-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                      <span className="block font-bold mb-1">{budget.fornecedorNome}</span>
                      {formatMoney(budget.valorTotal)}
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 relative
                        ${isApproved ? 'bg-green-500' : isRejected ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'}
                      `}
                      style={{ height: `${heightPercentage}%` }}
                    >
                        {/* Status Dot */}
                        {isApproved && (
                             <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        )}
                    </div>
                    
                    {/* Label */}
                    <div className="mt-2 text-[10px] text-gray-400 truncate w-full text-center">
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
          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Aprovado</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Análise</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-300 rounded-full"></div> Rejeitado</div>
          </div>
        </div>

        {/* Chart 2: Top Value List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Maiores Cotações</h3>
              <p className="text-sm text-gray-500">Top 5 orçamentos por valor total.</p>
            </div>
            <Link to="/orcamentos" className="text-sm text-accent hover:underline flex items-center">
              Ver todos <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.top5.length > 0 ? (
              stats.top5.map((budget, index) => {
                const percentage = (budget.valorTotal / (stats.top5[0].valorTotal || 1)) * 100;
                
                return (
                  <div key={budget.id} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                          {index + 1}
                        </span>
                        <span className="truncate max-w-[150px]">{budget.fornecedorNome}</span>
                        {budget.status === 'aprovado' && <CheckCircle2 size={12} className="text-green-500" />}
                      </span>
                      <span className="font-bold text-gray-900">{formatMoney(budget.valorTotal)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${
                            budget.status === 'aprovado' ? 'bg-green-500' :
                            index === 0 ? 'bg-yellow-400' : 'bg-blue-500'
                        }`}
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