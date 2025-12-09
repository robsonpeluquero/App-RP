import React, { createContext, useContext, useState, useEffect } from 'react';
import { Material, Orcamento, User, ChecklistItem, Measurement, Addition } from './types';

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

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: '1', category: 'Fundação & Estrutura', task: 'Impermeabilização das vigas baldrames realizada?', completed: false },
  { id: '2', category: 'Fundação & Estrutura', task: 'Tempo de cura do concreto respeitado (28 dias)?', completed: false },
  { id: '3', category: 'Fundação & Estrutura', task: 'Ferragens conferidas antes da concretagem?', completed: false },
  { id: '4', category: 'Alvenaria & Paredes', task: 'Prumo e nível das paredes conferidos?', completed: false },
  { id: '5', category: 'Alvenaria & Paredes', task: 'Vergas e contravergas instaladas nas janelas/portas?', completed: false },
  { id: '6', category: 'Elétrica', task: 'Tubulação passada conforme projeto?', completed: false },
  { id: '7', category: 'Elétrica', task: 'Teste de continuidade nos fios realizado?', completed: false },
  { id: '8', category: 'Elétrica', task: 'Quadro de distribuição montado e identificado?', completed: false },
  { id: '9', category: 'Hidráulica', task: 'Teste de pressão na tubulação de água (sem vazamentos)?', completed: false },
  { id: '10', category: 'Hidráulica', task: 'Caimento do esgoto verificado (min 1-2%)?', completed: false },
  { id: '11', category: 'Hidráulica', task: 'Impermeabilização de áreas molhadas (banheiros/cozinha)?', completed: false },
  { id: '12', category: 'Acabamento', task: 'Contrapiso nivelado?', completed: false },
  { id: '13', category: 'Acabamento', task: 'Recortes de piso alinhados e simétricos?', completed: false },
  { id: '14', category: 'Pintura', task: 'Parede lixada e selada antes da tinta?', completed: false },
];

const MOCK_MEASUREMENTS: Measurement[] = [
  {
    id: '1',
    stage: 'Fundação',
    date: '2023-09-10',
    percentage: 100,
    description: 'Concretagem das sapatas finalizada.',
    photos: []
  }
];

const MOCK_ADDITIONS: Addition[] = [
  {
    id: '1',
    date: '2023-10-05',
    reason: 'Alteração do ponto de esgoto da cozinha devido à viga não prevista.',
    costImpact: 450.00,
    timeImpact: 2,
    status: 'approved'
  }
];

interface AppContextType {
  user: User | null;
  materials: Material[];
  budgets: Orcamento[];
  checklist: ChecklistItem[];
  measurements: Measurement[];
  additions: Addition[];
  addMaterial: (material: Material) => void;
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;
  addBudget: (budget: Orcamento) => void;
  updateBudget: (budget: Orcamento) => void;
  deleteBudget: (id: string) => void;
  toggleCheckItem: (id: string) => void;
  addMeasurement: (measurement: Measurement) => void;
  deleteMeasurement: (id: string) => void;
  addAddition: (addition: Addition) => void;
  updateAddition: (addition: Addition) => void;
  deleteAddition: (id: string) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('obra360_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [materials, setMaterials] = useState<Material[]>(MOCK_MATERIALS);
  const [budgets, setBudgets] = useState<Orcamento[]>(MOCK_ORCAMENTOS);
  
  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('obra360_checklist');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
  });

  // Measurements & Additions State
  const [measurements, setMeasurements] = useState<Measurement[]>(() => {
    const saved = localStorage.getItem('obra360_measurements');
    return saved ? JSON.parse(saved) : MOCK_MEASUREMENTS;
  });

  const [additions, setAdditions] = useState<Addition[]>(() => {
    const saved = localStorage.getItem('obra360_additions');
    return saved ? JSON.parse(saved) : MOCK_ADDITIONS;
  });

  // Persist effects
  useEffect(() => { localStorage.setItem('obra360_checklist', JSON.stringify(checklist)); }, [checklist]);
  useEffect(() => { localStorage.setItem('obra360_measurements', JSON.stringify(measurements)); }, [measurements]);
  useEffect(() => { localStorage.setItem('obra360_additions', JSON.stringify(additions)); }, [additions]);

  const login = async (email: string, pass: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockUser: User = {
      id: '1',
      name: 'Usuário Demo',
      email: email,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    };
    setUser(mockUser);
    localStorage.setItem('obra360_user', JSON.stringify(mockUser));
  };

  const register = async (name: string, email: string, pass: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      avatar: undefined 
    };
    setUser(newUser);
    localStorage.setItem('obra360_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('obra360_user');
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser = { ...user, ...data };
    setUser(newUser);
    localStorage.setItem('obra360_user', JSON.stringify(newUser));
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`Password update requested for user ${user?.email}`);
  };

  // Materials CRUD
  const addMaterial = (material: Material) => setMaterials((prev) => [...prev, material]);
  const updateMaterial = (material: Material) => setMaterials((prev) => prev.map((m) => (m.id === material.id ? material : m)));
  const deleteMaterial = (id: string) => setMaterials((prev) => prev.filter((m) => m.id !== id));

  // Budget CRUD
  const addBudget = (budget: Orcamento) => setBudgets((prev) => [budget, ...prev]);
  const updateBudget = (budget: Orcamento) => setBudgets((prev) => prev.map((b) => (b.id === budget.id ? budget : b)));
  const deleteBudget = (id: string) => setBudgets((prev) => prev.filter((b) => b.id !== id));

  // Checklist
  const toggleCheckItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // Measurements CRUD
  const addMeasurement = (measurement: Measurement) => setMeasurements(prev => [measurement, ...prev]);
  const deleteMeasurement = (id: string) => setMeasurements(prev => prev.filter(m => m.id !== id));

  // Additions CRUD
  const addAddition = (addition: Addition) => setAdditions(prev => [addition, ...prev]);
  const updateAddition = (addition: Addition) => setAdditions(prev => prev.map(a => a.id === addition.id ? addition : a));
  const deleteAddition = (id: string) => setAdditions(prev => prev.filter(a => a.id !== id));

  return (
    <AppContext.Provider value={{ 
      user,
      materials, 
      budgets, 
      checklist,
      measurements,
      additions,
      addMaterial, 
      updateMaterial, 
      deleteMaterial, 
      addBudget,
      updateBudget,
      deleteBudget,
      toggleCheckItem,
      addMeasurement,
      deleteMeasurement,
      addAddition,
      updateAddition,
      deleteAddition,
      login,
      register,
      logout,
      updateUser,
      changePassword
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