import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context';
import { UNITS, Material } from '../types';
import { Search, Plus, Filter, X, Pencil, Trash, Image as ImageIcon, Upload, Store } from 'lucide-react';

export default function MaterialsPage() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useApp();
  
  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Material>>({
    descricao: '',
    unidade: 'un',
    precoUnitario: 0,
    codigo: '',
    imagem: '',
    fornecedor: ''
  });

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = m.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (m.fornecedor && m.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesUnit = unitFilter ? m.unidade === unitFilter : true;
      return matchesSearch && matchesUnit;
    });
  }, [materials, searchTerm, unitFilter]);

  const handleOpenModal = (material?: Material) => {
    if (material) {
      setFormData(material);
      setEditingId(material.id);
    } else {
      setFormData({ descricao: '', unidade: 'un', precoUnitario: 0, codigo: '', imagem: '', fornecedor: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.precoUnitario) return;

    const commonData = {
      codigo: formData.codigo || `MAT-${Math.floor(Math.random() * 1000)}`,
      descricao: formData.descricao,
      unidade: formData.unidade || 'un',
      precoUnitario: Number(formData.precoUnitario),
      imagem: formData.imagem,
      fornecedor: formData.fornecedor
    };

    if (editingId) {
      // Update existing
      const updatedMaterial: Material = {
        id: editingId,
        ...commonData
      };
      updateMaterial(updatedMaterial);
      alert('Material atualizado com sucesso!');
    } else {
      // Create new
      const newMaterial: Material = {
        id: Math.random().toString(36).substr(2, 9),
        ...commonData
      };
      addMaterial(newMaterial);
      alert('Material adicionado com sucesso!');
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      deleteMaterial(id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imagem: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materiais</h1>
          <p className="text-gray-500">Gerencie o catálogo de produtos para orçamentos.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} className="mr-2" />
          Adicionar Material
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por descrição, código ou fornecedor..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent outline-none appearance-none bg-white text-gray-900"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
          >
            <option value="">Todas Unidades</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 w-16">Foto</th>
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Fornecedor</th>
                <th className="px-6 py-3">Unidade</th>
                <th className="px-6 py-3 text-right">Preço Unit.</th>
                <th className="px-6 py-3 text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {material.imagem ? (
                          <img src={material.imagem} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-500">{material.codigo}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{material.descricao}</td>
                    <td className="px-6 py-3 text-gray-600">
                      {material.fornecedor ? (
                        <span className="flex items-center gap-1.5">
                          <Store size={14} className="text-gray-400" />
                          {material.fornecedor}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {material.unidade}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">
                      {material.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(material)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(material.id, material.descricao)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum material encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar Material' : 'Novo Material'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {/* Image Upload Section */}
              <div className="flex justify-center mb-6">
                <div 
                  className="relative group w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-blue-50 transition-colors overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.imagem ? (
                    <>
                      <img src={formData.imagem} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-center p-2">
                       <Upload size={24} className="mx-auto mb-1" />
                       <span className="text-xs">Adicionar Foto</span>
                    </div>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input 
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Ex: Cimento CP-II"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor / Loja</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                  value={formData.fornecedor}
                  onChange={e => setFormData({...formData, fornecedor: e.target.value})}
                  placeholder="Ex: Depósito Santa Rita"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade *</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent outline-none bg-white text-gray-900"
                    value={formData.unidade}
                    onChange={e => setFormData({...formData, unidade: e.target.value})}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                    value={formData.precoUnitario}
                    onChange={e => setFormData({...formData, precoUnitario: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código (Opcional)</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                  value={formData.codigo}
                  onChange={e => setFormData({...formData, codigo: e.target.value})}
                  placeholder="Gerado automaticamente se vazio"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-blue-700 shadow-sm"
                >
                  {editingId ? 'Salvar Alterações' : 'Salvar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}