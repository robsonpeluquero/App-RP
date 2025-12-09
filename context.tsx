import React, { createContext, useContext, useState, useEffect } from 'react';
import { Material, Orcamento } from './types';

// Mock Data Inicial
const MOCK_MATERIALS: Material[] = [
  { 
    id: '1', 
    codigo: 'MAT001', 
    descricao: 'Cimento CP II-32 50kg', 
    unidade: 'un', 
    precoUnitario: 32.50,
    imagem: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&q=80',
    fornecedor: 'Cimento Forte Ltda'
  },
  { id: '2', codigo: 'MAT002', descricao: 'Areia Média Lavada', unidade: 'm³', precoUnitario: 120.00, fornecedor: 'Areial São José' },
  { id: '3', codigo: 'MAT003', descricao: 'Tijolo Cerâmico 8 furos', unidade: 'un', precoUnitario: 0.85, fornecedor: 'Cerâmica Vermelha' },
  { id: '4', codigo: 'MAT004', descricao: 'Tinta Acrílica Fosca Branco 18L', unidade: 'l', precoUnitario: 280.00, fornecedor: 'Tintas Coral' },
  { id: '5', codigo: 'MAT005', descricao: 'Piso Porcelanato 60x60', unidade: 'm²', precoUnitario: 55.90, fornecedor: 'Portinari' },
];

const MOCK_ORCAMENTOS: Orcamento[] = [
  {
    id: '101',
    numero: 'ORC-2023-001',
    fornecedorNome: 'Depósito ConstruMax',
    fornecedorTelefone: '(11) 99999-1234',
    fornecedorSite: 'www.construmax.com.br',
    data: '2023-10-15',
    itens: [],
    valorTotal: 1540.50
  },
  {
    id: '102',
    numero: 'ORC-2023-002',
    fornecedorNome: 'Madeireira Silva',
    fornecedorTelefone: '(11) 3333-4444',
    data: '2023-10-20',
    itens: [],
    valorTotal: 890.00
  }
];

interface AppContextType {
  materials: Material[];
  budgets: Orcamento[];
  addMaterial: (material: Material) => void;
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;
  addBudget: (budget: Orcamento) => void;
  updateBudget: (budget: Orcamento) => void;
  deleteBudget: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [materials, setMaterials] = useState<Material[]>(MOCK_MATERIALS);
  const [budgets, setBudgets] = useState<Orcamento[]>(MOCK_ORCAMENTOS);

  /* 
   * NOTA SOBRE INTEGRAÇÃO COM BACKEND/N8N:
   * 
   * Para integrar com um backend real:
   * 1. Substitua os MOCK_MATERIALS por um useEffect que faz fetch na API ao carregar.
   *    useEffect(() => { api.get('/materials').then(setMaterials) }, []);
   * 
   * 2. A função addMaterial deveria fazer um POST na API e atualizar o estado apenas no sucesso.
   *    const addMaterial = async (m) => { await api.post('/materials', m); fetchMaterials(); }
   */

  const addMaterial = (material: Material) => {
    setMaterials((prev) => [...prev, material]);
  };

  const updateMaterial = (material: Material) => {
    setMaterials((prev) => prev.map((m) => (m.id === material.id ? material : m)));
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const addBudget = (budget: Orcamento) => {
    setBudgets((prev) => [budget, ...prev]);
  };

  const updateBudget = (budget: Orcamento) => {
    setBudgets((prev) => prev.map((b) => (b.id === budget.id ? budget : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      materials, 
      budgets, 
      addMaterial, 
      updateMaterial, 
      deleteMaterial, 
      addBudget,
      updateBudget,
      deleteBudget 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};