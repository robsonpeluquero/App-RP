import React, { createContext, useContext, useState, useEffect } from 'react';
import { Material, Orcamento, User, ChecklistItem, Measurement, Addition, Integration, ToastMessage, ToastType, ConfirmDialogData, OrcamentoStatus, UserRole } from './types';

interface AppContextType {
  user: User | null;
  loading: boolean;
  materials: Material[];
  budgets: Orcamento[];
  checklist: ChecklistItem[];
  measurements: Measurement[];
  additions: Addition[];
  integrations: Integration[];
  allUsers: User[]; // List of all users for admin management
  
  // Data Actions
  addMaterial: (material: Material) => Promise<void>;
  updateMaterial: (material: Material) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  addBudget: (budget: Orcamento) => Promise<void>;
  updateBudget: (budget: Orcamento) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  changeBudgetStatus: (id: string, status: OrcamentoStatus, approvalData?: Partial<Orcamento>) => Promise<void>;
  
  // Budget Deletion Flow
  requestBudgetDeletion: (id: string, reason: string) => Promise<void>;
  cancelBudgetDeletionRequest: (id: string) => Promise<void>;

  toggleCheckItem: (id: string) => Promise<void>;
  addMeasurement: (measurement: Measurement) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  addAddition: (addition: Addition) => Promise<void>;
  updateAddition: (addition: Addition) => Promise<void>;
  deleteAddition: (id: string) => Promise<void>;
  connectIntegration: (provider: string, email: string) => Promise<void>;
  disconnectIntegration: (provider: string) => void;
  
  // Auth Actions
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  recoverPassword: (email: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  
  // User Management (Admin/Manager)
  addNewUser: (newUser: Omit<User, 'id'>) => Promise<void>;
  editUser: (userData: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  // UI Actions
  toast: ToastMessage | null;
  showToast: (type: ToastType, title: string, message?: string) => void;
  hideToast: () => void;
  
  confirmDialog: ConfirmDialogData;
  askConfirmation: (data: Omit<ConfirmDialogData, 'isOpen'>) => void;
  closeConfirmation: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper functions defined outside component to ensure consistent access logic
const getRegisteredUsersFromStorage = (): User[] => {
  try {
    const usersStr = localStorage.getItem('obra360_users_db');
    return usersStr ? JSON.parse(usersStr) : [];
  } catch (e) {
    console.error("Erro ao ler banco de usuários:", e);
    return [];
  }
};

const saveUsersToStorage = (users: User[]) => {
  localStorage.setItem('obra360_users_db', JSON.stringify(users));
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  // Load initial data (Application State) with Error Handling
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem('obra360_app_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erro ao ler estado da aplicação:", e);
    }
    
    // Clean state by default
    return {
      user: null, // No user logged in by default
      materials: [],
      budgets: [],
      checklist: [
        { id: '1', category: 'Fundação', task: 'Verificar gabarito e esquadro', completed: false },
        { id: '2', category: 'Fundação', task: 'Conferir profundidade das estacas', completed: false },
        { id: '3', category: 'Fundação', task: 'Impermeabilização das vigas baldrames', completed: false },
        { id: '4', category: 'Alvenaria', task: 'Verificar prumo e nível das paredes', completed: false },
        { id: '5', category: 'Alvenaria', task: 'Conferir vergas e contravergas', completed: false },
        { id: '6', category: 'Instalações', task: 'Teste de estanqueidade hidráulica', completed: false },
        { id: '7', category: 'Instalações', task: 'Teste de continuidade elétrica', completed: false },
      ],
      measurements: [],
      additions: [],
      integrations: [
        {
          id: '1',
          provider: 'google_drive',
          name: 'Google Drive',
          description: 'Conecte sua conta para salvar backups de orçamentos e relatórios automaticamente.',
          connected: false
        }
      ]
    };
  };

  const [data, setData] = useState<any>(loadInitialState);
  const [loading, setLoading] = useState(false);
  
  // Initialize allUsers directly from storage to prevent data loss on hot reload/refresh
  const [allUsers, setAllUsers] = useState<User[]>(() => getRegisteredUsersFromStorage());

  // UI State
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const { user, materials, budgets, checklist, measurements, additions, integrations } = data;

  // Persist application state
  useEffect(() => {
    localStorage.setItem('obra360_app_data', JSON.stringify(data));
  }, [data]);

  // Toast Helper
  const showToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToast({ id, type, title, message });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const hideToast = () => setToast(null);

  // Confirmation Helper
  const askConfirmation = (data: Omit<ConfirmDialogData, 'isOpen'>) => {
    setConfirmDialog({ ...data, isOpen: true });
  };

  const closeConfirmation = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // --- Actions ---

  const saveData = (newData: any) => {
      setData((prev: any) => ({ ...prev, ...newData }));
  };

  // Internal helper to update users state and storage simultaneously
  const updateUsersList = (newUsers: User[]) => {
      setAllUsers(newUsers);
      saveUsersToStorage(newUsers);
  };

  // Auth Logic
  const login = async (email: string, pass: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    
    // Always fetch fresh list from storage for login
    const users = getRegisteredUsersFromStorage();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

    if (foundUser) {
        // Don't keep password in session state for security (even if local)
        const { password, ...safeUser } = foundUser;
        saveData({ user: safeUser });
    } else {
        setLoading(false);
        throw new Error('Email ou senha inválidos.');
    }
    setLoading(false);
  };

  const register = async (name: string, email: string, pass: string) => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      const users = getRegisteredUsersFromStorage();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          setLoading(false);
          throw new Error('Este email já está cadastrado.');
      }

      // First user is Admin, others are Collaborators by default (via self-registration)
      const isFirstUser = users.length === 0;
      const role: UserRole = isFirstUser ? 'admin' : 'collaborator';

      const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: name,
          email: email,
          password: pass,
          avatar: '',
          role: role
      };

      const updatedUsers = [...users, newUser];
      updateUsersList(updatedUsers);
      
      const { password, ...safeUser } = newUser;
      saveData({ user: safeUser });
      setLoading(false);
  };

  // Admin/Manager Action: Add new User
  const addNewUser = async (newUserData: Omit<User, 'id'>) => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const users = getRegisteredUsersFromStorage();
      if (users.find(u => u.email.toLowerCase() === newUserData.email.toLowerCase())) {
          setLoading(false);
          throw new Error('Este email já está cadastrado.');
      }

      const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          ...newUserData
      };

      const updatedUsers = [...users, newUser];
      updateUsersList(updatedUsers);
      setLoading(false);
  };

  const editUser = async (userData: User) => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const users = getRegisteredUsersFromStorage();
      const updatedUsers = users.map(u => u.id === userData.id ? userData : u);
      updateUsersList(updatedUsers);
      
      // If editing current logged user, update session
      if (user && user.id === userData.id) {
         const { password, ...safeUser } = userData;
         saveData({ user: safeUser });
      }
      
      setLoading(false);
  };

  const deleteUser = async (userId: string) => {
      if (userId === user?.id) throw new Error("Você não pode excluir a si mesmo.");
      
      const users = getRegisteredUsersFromStorage();
      const updatedUsers = users.filter(u => u.id !== userId);
      updateUsersList(updatedUsers);
  };

  const logout = () => {
      saveData({ user: null });
  };

  const recoverPassword = async (email: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const users = getRegisteredUsersFromStorage();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    setLoading(false);
    if (!exists) {
        throw new Error('Email não encontrado.');
    }
    // Since we can't send real emails, we simulate success
    return; 
  };

  const updateUser = async (userData: Partial<User>) => {
      if (!user) return;
      const updatedUser = { ...user, ...userData };
      saveData({ user: updatedUser });

      // Update in "DB"
      const users = getRegisteredUsersFromStorage();
      const dbUser = users.find(u => u.id === user.id);
      if (dbUser) {
          const newDbUser = { ...dbUser, ...userData };
          const updatedUsers = users.map(u => u.id === user.id ? newDbUser : u);
          updateUsersList(updatedUsers);
      }
  };

  const changePassword = async (currentPass: string, newPass: string) => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users = getRegisteredUsersFromStorage();
      const dbUser = users.find(u => u.id === user?.id);

      if (!dbUser || dbUser.password !== currentPass) {
          setLoading(false);
          throw new Error('Senha atual incorreta.');
      }

      const updatedUsers = users.map(u => 
        u.id === user?.id ? { ...u, password: newPass } : u
      );
      updateUsersList(updatedUsers);
      setLoading(false);
  };

  // Materials
  const addMaterial = async (material: Material) => {
      saveData({ materials: [...materials, material] });
  };
  const updateMaterial = async (material: Material) => {
      saveData({ materials: materials.map((m: Material) => m.id === material.id ? material : m) });
  };
  const deleteMaterial = async (id: string) => {
      saveData({ materials: materials.filter((m: Material) => m.id !== id) });
  };

  // Budgets
  const addBudget = async (budget: Orcamento) => {
      const newBudget = { ...budget, status: budget.status || 'em_analise' };
      saveData({ budgets: [newBudget, ...budgets] });
  };
  const updateBudget = async (budget: Orcamento) => {
      saveData({ budgets: budgets.map((b: Orcamento) => b.id === budget.id ? budget : b) });
  };
  const deleteBudget = async (id: string) => {
      saveData({ budgets: budgets.filter((b: Orcamento) => b.id !== id) });
  };
  const changeBudgetStatus = async (id: string, status: OrcamentoStatus, approvalData: Partial<Orcamento> = {}) => {
      saveData({ 
        budgets: budgets.map((b: Orcamento) => 
          b.id === id ? { ...b, status, ...approvalData } : b
        ) 
      });
  };

  // Deletion Request Flow
  const requestBudgetDeletion = async (id: string, reason: string) => {
      if (!user) return;
      saveData({
        budgets: budgets.map((b: Orcamento) => 
          b.id === id 
            ? { 
                ...b, 
                deletionRequest: {
                   requesterId: user.id,
                   requesterName: user.name,
                   date: new Date().toISOString(),
                   reason: reason
                }
              } 
            : b
        )
      });
  };

  const cancelBudgetDeletionRequest = async (id: string) => {
      saveData({
        budgets: budgets.map((b: Orcamento) => 
            b.id === id 
            ? { ...b, deletionRequest: undefined }
            : b
        )
      });
  };

  // Checklist
  const toggleCheckItem = async (id: string) => {
      saveData({ checklist: checklist.map((i: ChecklistItem) => i.id === id ? { ...i, completed: !i.completed } : i) });
  };

  // Measurements
  const addMeasurement = async (measurement: Measurement) => {
      saveData({ measurements: [measurement, ...measurements] });
  };
  const deleteMeasurement = async (id: string) => {
      saveData({ measurements: measurements.filter((m: Measurement) => m.id !== id) });
  };

  // Additions
  const addAddition = async (addition: Addition) => {
      saveData({ additions: [addition, ...additions] });
  };
  const updateAddition = async (addition: Addition) => {
      saveData({ additions: additions.map((a: Addition) => a.id === addition.id ? addition : a) });
  };
  const deleteAddition = async (id: string) => {
      saveData({ additions: additions.filter((a: Addition) => a.id !== id) });
  };

  // Integrations
  const connectIntegration = async (provider: string, email: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      saveData({ 
        integrations: integrations.map((int: Integration) => 
          int.provider === provider 
          ? { ...int, connected: true, connectedEmail: email, lastSync: new Date().toISOString() } 
          : int
        ) 
      });
  };
  const disconnectIntegration = (provider: string) => {
      saveData({ 
        integrations: integrations.map((int: Integration) => 
          int.provider === provider 
          ? { ...int, connected: false, connectedEmail: undefined, lastSync: undefined } 
          : int
        ) 
      });
  };

  return (
    <AppContext.Provider value={{ 
      user, loading, materials, budgets, checklist, measurements, additions, integrations, allUsers,
      addMaterial, updateMaterial, deleteMaterial, 
      addBudget, updateBudget, deleteBudget, changeBudgetStatus,
      requestBudgetDeletion, cancelBudgetDeletionRequest,
      toggleCheckItem, addMeasurement, deleteMeasurement,
      addAddition, updateAddition, deleteAddition,
      connectIntegration, disconnectIntegration,
      login, register, logout, recoverPassword, updateUser, changePassword,
      addNewUser, editUser, deleteUser,
      toast, showToast, hideToast,
      confirmDialog, askConfirmation, closeConfirmation
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};