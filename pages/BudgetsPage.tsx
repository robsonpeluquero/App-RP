import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { Link } from 'react-router-dom';
import { Plus, FileText, Calendar, Filter, X, Pencil, Trash, Store, Phone, Check, ThumbsUp, ThumbsDown, Trophy, ArrowUp, AlertCircle, MessageSquare, ShieldAlert } from 'lucide-react';
import { OrcamentoStatus } from '../types';

export default function BudgetsPage() {
  const { user, budgets, deleteBudget, changeBudgetStatus, requestBudgetDeletion, cancelBudgetDeletionRequest, askConfirmation, showToast } = useApp();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrcamentoStatus | 'todos'>('todos');

  // Approval Modal State
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Deletion Request Modal State
  const [isDeleteRequestModalOpen, setIsDeleteRequestModalOpen] = useState(false);
  const [budgetToDeleteId, setBudgetToDeleteId] = useState<string | null>(null);
  const [deletionReason, setDeletionReason] = useState('');

  // Check Permissions
  const canApprove = user?.role === 'admin' || user?.role === 'manager';
  const isAdmin = user?.role === 'admin';

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

      if (statusFilter !== 'todos' && (budget.status || 'em_analise') !== statusFilter) {
          return false;
      }

      return true;
    });
  }, [budgets, startDate, endDate, statusFilter]);

  // Statistics for decision making (based on visible list)
  const stats = useMemo(() => {
    if (filteredBudgets.length === 0) return { min: null, max: null };
    
    // Ignore rejected budgets for price comparison unless only rejected exist
    const activeBudgets = filteredBudgets.filter(b => b.status !== 'rejeitado');
    const listToCompare = activeBudgets.length > 0 ? activeBudgets : filteredBudgets;
    
    const min = Math.min(...listToCompare.map(b => b.valorTotal));
    const max = Math.max(...listToCompare.map(b => b.valorTotal));
    
    return { min, max };
  }, [filteredBudgets]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('todos');
  };

  const handleDeleteClick = (budget: any) => {
    // Scenario 1: Budget NOT approved OR User IS Admin -> Normal Delete flow
    if (budget.status !== 'aprovado' || isAdmin) {
        askConfirmation({
            title: 'Excluir Orçamento',
            message: `Tem certeza que deseja excluir o orçamento ${budget.numero}? Essa ação não pode ser desfeita.`,
            variant: 'danger',
            confirmLabel: 'Excluir',
            onConfirm: async () => {
              await deleteBudget(budget.id);
              showToast('success', 'Orçamento excluído', 'O orçamento foi removido com sucesso.');
            }
          });
          return;
    }

    // Scenario 2: Budget Approved AND User NOT Admin -> Request Deletion flow
    setBudgetToDeleteId(budget.id);
    setDeletionReason('');
    setIsDeleteRequestModalOpen(true);
  };

  const handleSubmitDeletionRequest = async () => {
      if (!budgetToDeleteId || !deletionReason.trim()) {
          showToast('error', 'Motivo obrigatório', 'Por favor, explique por que este orçamento aprovado precisa ser excluído.');
          return;
      }

      await requestBudgetDeletion(budgetToDeleteId, deletionReason);
      showToast('info', 'Solicitação Enviada', 'O administrador analisará seu pedido de exclusão.');
      setIsDeleteRequestModalOpen(false);
  };

  const handleAdminReviewDeletion = (id: string, action: 'approve' | 'deny') => {
      if (action === 'approve') {
          askConfirmation({
              title: 'Aprovar Exclusão',
              message: 'Tem certeza que deseja aceitar a solicitação e excluir permanentemente este orçamento aprovado?',
              variant: 'danger',
              onConfirm: async () => {
                  await deleteBudget(id);
                  showToast('success', 'Solicitação Aceita', 'Orçamento excluído com sucesso.');
              }
          });
      } else {
          cancelBudgetDeletionRequest(id);
          showToast('info', 'Solicitação Rejeitada', 'O orçamento permanece ativo.');
      }
  };

  const handleOpenApprovalModal = (id: string) => {
    setSelectedBudgetId(id);
    setApprovalNotes('');
    setIsApprovalModalOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedBudgetId || !user) return;

    const approvalData = {
        aprovadoPor: { id: user.id, nome: user.name },
        dataAprovacao: new Date().toISOString(),
        observacaoAprovacao: approvalNotes
    };

    await changeBudgetStatus(selectedBudgetId, 'aprovado', approvalData);
    showToast('success', 'Orçamento Aprovado!', 'O fornecedor foi selecionado.');
    setIsApprovalModalOpen(false);
  };

  const handleReject = (id: string) => {
      // Rejection clears approval data
      changeBudgetStatus(id, 'rejeitado', { aprovadoPor: undefined, dataAprovacao: undefined, observacaoAprovacao: undefined });
      showToast('info', 'Orçamento Rejeitado');
  };

  const handleResetStatus = (id: string) => {
      // Resetting to analysis clears approval data
      changeBudgetStatus(id, 'em_analise', { aprovadoPor: undefined, dataAprovacao: undefined, observacaoAprovacao: undefined });
      showToast('info', 'Orçamento em Análise');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-500">Compare, analise e aprove orçamentos de fornecedores.</p>
        </div>
        <Link 
          to="/orcamentos/novo"
          className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} className="mr-2" />
          Novo Orçamento
        </Link>
      </div>

      {/* Date Filter & Status Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="flex items-center gap-2 text-gray-700 font-medium min-w-max">
          <Filter size={18} className="text-accent" />
          <span>Filtros:</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-1">
          {/* Status Select */}
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="todos">Todos os Status</option>
            <option value="em_analise">Em Análise</option>
            <option value="aprovado">Aprovados</option>
            <option value="rejeitado">Rejeitados</option>
          </select>

          <div className="h-4 w-px bg-gray-300 hidden sm:block mx-2"></div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">De</span>
            <input 
              type="date" 
              className="px-2 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none w-full sm:w-auto"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Até</span>
            <input 
              type="date" 
              className="px-2 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none w-full sm:w-auto"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          {(startDate || endDate || statusFilter !== 'todos') && (
            <button 
              onClick={clearFilters}
              className="sm:ml-auto px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <X size={16} />
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBudgets.length > 0 ? (
          filteredBudgets.map((budget) => {
            const isBestPrice = stats.min !== null && budget.valorTotal === stats.min && budget.status !== 'rejeitado';
            const isWorstPrice = stats.max !== null && budget.valorTotal === stats.max && budget.status !== 'rejeitado' && filteredBudgets.length > 1;
            const isApproved = budget.status === 'aprovado';
            const isRejected = budget.status === 'rejeitado';
            const hasDeletionRequest = !!budget.deletionRequest;

            return (
              <div 
                key={budget.id} 
                className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all p-6 space-y-4 relative group flex flex-col
                  ${hasDeletionRequest ? 'border-red-300 ring-2 ring-red-100 bg-red-50/30' : 
                    isApproved ? 'border-green-500 ring-1 ring-green-500 bg-green-50/10' : 'border-gray-200'}
                  ${isRejected ? 'opacity-75 bg-gray-50' : ''}
                `}
              >
                {/* Decision Badges */}
                {isBestPrice && !isApproved && (
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Trophy size={12} /> MELHOR PREÇO
                   </div>
                )}
                {isWorstPrice && !isApproved && !isRejected && (
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200 flex items-center gap-1">
                      <ArrowUp size={12} /> MAIOR PREÇO
                   </div>
                )}
                
                {hasDeletionRequest && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                        <ShieldAlert size={12} /> SOLICITAÇÃO DE EXCLUSÃO
                    </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit">
                      {budget.numero}
                    </span>
                    {isApproved && (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                        <Check size={12} /> APROVADO
                      </span>
                    )}
                    {isRejected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                        <X size={12} /> REJEITADO
                      </span>
                    )}
                    {!isApproved && !isRejected && (
                       <span className="text-xs font-medium text-blue-600">Em Análise</span>
                    )}
                  </div>
                  
                  {/* Actions (Edit/Delete) */}
                  <div className="flex gap-2">
                    <Link 
                      to={`/orcamentos/editar/${budget.id}`}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </Link>
                    {/* Hide delete button if request pending to avoid duplicate requests, unless admin */}
                    {(!hasDeletionRequest || isAdmin) && (
                        <button 
                        onClick={() => handleDeleteClick(budget)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title={isApproved && !isAdmin ? "Solicitar Exclusão" : "Excluir"}
                        >
                        <Trash size={16} />
                        </button>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-500 flex items-center gap-1 -mt-2">
                  <Calendar size={14} />
                  {new Date(budget.data).toLocaleDateString('pt-BR')}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 truncate">
                     <Store size={18} className="text-gray-400 shrink-0"/>
                     <span className="truncate">{budget.fornecedorNome}</span>
                  </h3>
                  {budget.fornecedorTelefone && (
                    <p className="text-sm text-gray-500 ml-6 flex items-center gap-1">
                      <Phone size={12} /> {budget.fornecedorTelefone}
                    </p>
                  )}
                </div>

                {/* Approved Metadata Box */}
                {isApproved && budget.aprovadoPor && (
                    <div className="text-xs bg-green-100 text-green-800 p-2 rounded-md border border-green-200">
                        <p><strong>Aprovado por:</strong> {budget.aprovadoPor.nome}</p>
                        {budget.dataAprovacao && (
                            <p className="mt-1">
                                <strong>Em:</strong> {new Date(budget.dataAprovacao).toLocaleString('pt-BR')}
                            </p>
                        )}
                        {budget.observacaoAprovacao && (
                            <div className="mt-2 pt-2 border-t border-green-200 italic flex items-start gap-1">
                                <MessageSquare size={12} className="shrink-0 mt-0.5"/>
                                <span>"{budget.observacaoAprovacao}"</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Deletion Request Box */}
                {hasDeletionRequest && (
                    <div className="text-xs bg-red-100 text-red-900 p-3 rounded-md border border-red-200 mt-2">
                        <p className="font-bold flex items-center gap-1 mb-1">
                             <ShieldAlert size={12}/> Pedido de Exclusão
                        </p>
                        <p><strong>Por:</strong> {budget.deletionRequest?.requesterName}</p>
                        <p className="mt-1 italic">"{budget.deletionRequest?.reason}"</p>
                        
                        {isAdmin ? (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <button 
                                    onClick={() => handleAdminReviewDeletion(budget.id, 'approve')}
                                    className="bg-red-600 text-white py-1 rounded hover:bg-red-700 transition-colors"
                                >
                                    Excluir
                                </button>
                                <button 
                                    onClick={() => handleAdminReviewDeletion(budget.id, 'deny')}
                                    className="bg-white text-gray-700 border border-gray-300 py-1 rounded hover:bg-gray-50 transition-colors"
                                >
                                    Rejeitar
                                </button>
                            </div>
                        ) : (
                            <p className="text-[10px] text-red-700 mt-2 font-medium bg-red-50 p-1 rounded text-center">
                                Aguardando análise do Administrador
                            </p>
                        )}
                    </div>
                )}

                <div className="pt-4 border-t border-gray-100 mt-auto">
                   <div className="flex items-end justify-between mb-4">
                      <div className="text-sm text-gray-500">
                          {budget.itens.length} {budget.itens.length === 1 ? 'item' : 'itens'}
                      </div>
                      <div className={`text-xl font-bold flex items-center ${isApproved ? 'text-green-700' : 'text-gray-900'}`}>
                          <span className="text-sm font-normal text-gray-400 mr-1">Total:</span>
                          {budget.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                   </div>

                   {/* Approval Actions - Restricted to Admin/Manager */}
                   {!isApproved && !isRejected && canApprove && (
                     <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleOpenApprovalModal(budget.id)}
                          className="flex items-center justify-center gap-1 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                        >
                           <ThumbsUp size={14} /> Aprovar
                        </button>
                        <button 
                          onClick={() => handleReject(budget.id)}
                          className="flex items-center justify-center gap-1 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm font-medium transition-colors"
                        >
                           <ThumbsDown size={14} /> Rejeitar
                        </button>
                     </div>
                   )}

                   {!isApproved && !isRejected && !canApprove && (
                       <div className="text-center bg-gray-50 py-2 rounded text-xs text-gray-500 flex items-center justify-center gap-1">
                           <AlertCircle size={12} /> Aguardando aprovação (Gerência)
                       </div>
                   )}
                   
                   {isRejected && canApprove && (
                      <button 
                        onClick={() => handleResetStatus(budget.id)}
                        className="w-full text-center text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                         Reconsiderar (Voltar para Análise)
                      </button>
                   )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-lg border border-dashed border-gray-300">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum orçamento encontrado</h3>
            <p className="text-gray-500 mb-6">
              {(startDate || endDate || statusFilter !== 'todos') 
                ? "Tente ajustar os filtros." 
                : "Crie seu primeiro orçamento para começar."}
            </p>
            {(!startDate && !endDate && statusFilter === 'todos') && (
              <Link 
                to="/orcamentos/novo"
                className="text-accent hover:text-blue-700 font-medium"
              >
                Criar agora &rarr;
              </Link>
            )}
             <button 
                  onClick={clearFilters}
                  className="text-accent hover:text-blue-700 font-medium block mx-auto mt-2"
                >
                  Limpar filtros
             </button>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {isApprovalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                     <h2 className="text-lg font-semibold text-gray-900">Confirmar Aprovação</h2>
                     <button onClick={() => setIsApprovalModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                         <X size={20} />
                     </button>
                 </div>
                 <div className="p-6 space-y-4">
                     <p className="text-gray-600 text-sm">
                         Você está aprovando este orçamento. Isso sinalizará a escolha deste fornecedor. Deseja adicionar alguma observação?
                     </p>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Observação (Opcional)</label>
                         <textarea 
                             className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                             rows={3}
                             placeholder="Ex: Entrega negociada para 15 dias, pagamento em 3x..."
                             value={approvalNotes}
                             onChange={e => setApprovalNotes(e.target.value)}
                         />
                     </div>
                     <div className="flex justify-end gap-3 pt-2">
                         <button 
                             onClick={() => setIsApprovalModalOpen(false)}
                             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                         >
                             Cancelar
                         </button>
                         <button 
                             onClick={handleConfirmApproval}
                             className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 shadow-sm flex items-center gap-2"
                         >
                             <Check size={16} />
                             Confirmar Aprovação
                         </button>
                     </div>
                 </div>
             </div>
          </div>
      )}

      {/* Deletion Request Modal */}
      {isDeleteRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50">
                     <div className="flex items-center gap-2 text-red-700">
                        <ShieldAlert size={20} />
                        <h2 className="text-lg font-semibold">Solicitar Exclusão</h2>
                     </div>
                     <button onClick={() => setIsDeleteRequestModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                         <X size={20} />
                     </button>
                 </div>
                 <div className="p-6 space-y-4">
                     <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-800">
                        Este orçamento já foi <strong>APROVADO</strong>. A exclusão requer autorização do Administrador.
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Exclusão *</label>
                         <textarea 
                             className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                             rows={3}
                             placeholder="Ex: Erro no cadastro, fornecedor cancelou a proposta..."
                             value={deletionReason}
                             onChange={e => setDeletionReason(e.target.value)}
                             required
                         />
                     </div>
                     <div className="flex justify-end gap-3 pt-2">
                         <button 
                             onClick={() => setIsDeleteRequestModalOpen(false)}
                             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                         >
                             Cancelar
                         </button>
                         <button 
                             onClick={handleSubmitDeletionRequest}
                             disabled={!deletionReason.trim()}
                             className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 shadow-sm disabled:opacity-50"
                         >
                             Enviar Solicitação
                         </button>
                     </div>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
}