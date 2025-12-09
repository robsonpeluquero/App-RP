import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash, Save, PlusCircle, AlertCircle, Phone, Globe, Store } from 'lucide-react';
import { OrcamentoItem, Orcamento } from '../types';

export default function NewBudgetPage() {
  const { materials, addBudget, updateBudget, budgets } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Edit Mode Flag
  const isEditing = Boolean(id);

  // Header State
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierSite, setSupplierSite] = useState('');
  const [obs, setObs] = useState('');
  const [budgetNumber, setBudgetNumber] = useState(''); // To keep the number when editing

  // Item Form State
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  
  // Items List State
  const [items, setItems] = useState<OrcamentoItem[]>([]);

  // Load data if editing
  useEffect(() => {
    if (isEditing && id) {
      const existingBudget = budgets.find(b => b.id === id);
      if (existingBudget) {
        setSupplierName(existingBudget.fornecedorNome);
        setSupplierPhone(existingBudget.fornecedorTelefone || '');
        setSupplierSite(existingBudget.fornecedorSite || '');
        setObs(existingBudget.observacoes || '');
        setItems(existingBudget.itens);
        setBudgetNumber(existingBudget.numero);
      } else {
        // If ID invalid, go back
        navigate('/orcamentos');
      }
    }
  }, [id, isEditing, budgets, navigate]);

  // Computed
  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);
  const currentItemSubtotal = selectedMaterial ? selectedMaterial.precoUnitario * quantity : 0;
  
  const totalBudget = items.reduce((acc, item) => acc + item.subtotal, 0);

  const handleAddItem = () => {
    if (!selectedMaterial) return;
    if (quantity <= 0) {
      alert("Quantidade deve ser maior que zero.");
      return;
    }

    const newItem: OrcamentoItem = {
      id: Math.random().toString(36).substr(2, 9),
      materialId: selectedMaterial.id,
      descricaoSnapshot: selectedMaterial.descricao,
      precoUnitario: selectedMaterial.precoUnitario,
      quantidade: quantity,
      subtotal: currentItemSubtotal
    };

    setItems([...items, newItem]);
    
    // Reset selection
    setSelectedMaterialId('');
    setQuantity(1);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) return;
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantidade: newQty,
          subtotal: item.precoUnitario * newQty
        };
      }
      return item;
    }));
  };

  const handleSaveBudget = () => {
    if (!supplierName.trim()) {
      alert("Por favor, informe o nome do fornecedor.");
      return;
    }
    if (items.length === 0) {
      alert("Adicione pelo menos um material ao orçamento.");
      return;
    }

    const budgetData: Orcamento = {
      id: isEditing && id ? id : Math.random().toString(36).substr(2, 9),
      numero: isEditing ? budgetNumber : `ORC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      fornecedorNome: supplierName,
      fornecedorTelefone: supplierPhone,
      fornecedorSite: supplierSite,
      data: isEditing ? (budgets.find(b => b.id === id)?.data || new Date().toISOString()) : new Date().toISOString(),
      observacoes: obs,
      itens: items,
      valorTotal: totalBudget
    };

    if (isEditing) {
      updateBudget(budgetData);
      alert("Orçamento atualizado com sucesso!");
    } else {
      addBudget(budgetData);
      alert("Orçamento criado com sucesso!");
    }
    
    navigate('/orcamentos');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header / Nav */}
      <div className="flex items-center gap-4 text-gray-500 mb-2">
        <Link to="/orcamentos" className="hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="text-sm font-medium">Voltar para lista</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? `Editar Orçamento: ${budgetNumber}` : 'Novo Orçamento'}
        </h1>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
          Data: {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Client Info & Item Entry */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Supplier Details Card */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-accent rounded-full"></span>
              Dados do Fornecedor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Fornecedor *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Store size={18} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    placeholder="Ex: Depósito ABC"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (Opcional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                    value={supplierPhone}
                    onChange={e => setSupplierPhone(e.target.value)}
                    placeholder="(00) 0000-0000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site (Opcional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Globe size={18} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                    value={supplierSite}
                    onChange={e => setSupplierSite(e.target.value)}
                    placeholder="www.site.com.br"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea 
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none resize-none"
                  value={obs}
                  onChange={e => setObs(e.target.value)}
                  placeholder="Ex: Frete incluso, entrega em 5 dias..."
                />
              </div>
            </div>
          </section>

          {/* Add Item Card */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-accent rounded-full"></span>
              Adicionar Itens
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Material</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent outline-none bg-white text-gray-900"
                  value={selectedMaterialId}
                  onChange={e => setSelectedMaterialId(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.codigo ? `[${m.codigo}] ` : ''}{m.descricao} ({m.precoUnitario.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}/{m.unidade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                    value={quantity}
                    onChange={e => setQuantity(parseFloat(e.target.value))}
                    disabled={!selectedMaterialId}
                  />
                </div>
                <div className="flex-1">
                   <label className="block text-sm font-medium text-gray-500 mb-1">Subtotal Previsto</label>
                   <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 font-medium">
                      {currentItemSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                   </div>
                </div>
                <button 
                  onClick={handleAddItem}
                  disabled={!selectedMaterialId || quantity <= 0}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[42px]"
                >
                  <PlusCircle size={18} />
                  Adicionar
                </button>
              </div>
            </div>
          </section>

          {/* Items Table */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Itens do Orçamento</h3>
                <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{items.length} itens</span>
             </div>
             
             {items.length === 0 ? (
               <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                 <AlertCircle className="mb-2 opacity-50" size={32} />
                 <p>Nenhum item adicionado ainda.</p>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead>
                     <tr className="bg-gray-50 border-b border-gray-200">
                       <th className="px-6 py-3 font-medium text-gray-600">Material</th>
                       <th className="px-6 py-3 font-medium text-gray-600 w-24">Qtd.</th>
                       <th className="px-6 py-3 font-medium text-gray-600 text-right">Unit.</th>
                       <th className="px-6 py-3 font-medium text-gray-600 text-right">Total</th>
                       <th className="px-6 py-3 w-10"></th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {items.map((item) => (
                       <tr key={item.id} className="hover:bg-gray-50">
                         <td className="px-6 py-3 text-gray-900 font-medium">{item.descricaoSnapshot}</td>
                         <td className="px-6 py-3">
                           <input 
                             type="number" 
                             min="1"
                             className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm bg-white text-gray-900"
                             value={item.quantidade}
                             onChange={(e) => handleUpdateQuantity(item.id, parseFloat(e.target.value))}
                           />
                         </td>
                         <td className="px-6 py-3 text-right text-gray-600">
                           {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                         </td>
                         <td className="px-6 py-3 text-right font-bold text-gray-900">
                           {item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                         </td>
                         <td className="px-6 py-3 text-right">
                           <button 
                             onClick={() => handleRemoveItem(item.id)}
                             className="text-red-400 hover:text-red-600 transition-colors p-1"
                             title="Remover item"
                           >
                             <Trash size={16} />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </section>

        </div>

        {/* Right Column: Summary & Actions (Sticky) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Resumo</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal Itens</span>
                <span>{totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Descontos</span>
                <span>R$ 0,00</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Geral</span>
                <span className="text-2xl font-bold text-accent">
                  {totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleSaveBudget}
                disabled={items.length === 0}
                className="w-full py-3 bg-accent text-white rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <Save size={18} />
                {isEditing ? 'Atualizar Orçamento' : 'Finalizar Orçamento'}
              </button>
              <Link 
                to="/orcamentos"
                className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors flex justify-center items-center"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}