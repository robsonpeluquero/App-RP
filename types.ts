
export interface Material {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  precoUnitario: number;
  imagem?: string;
  fornecedor?: string;
}

export interface OrcamentoItem {
  id: string;
  materialId: string;
  descricaoSnapshot: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Orcamento {
  id: string;
  numero: string;
  fornecedorNome: string;
  fornecedorTelefone?: string;
  fornecedorSite?: string;
  data: string;
  observacoes?: string;
  itens: OrcamentoItem[];
  valorTotal: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  password?: string; // Only for local storage simulation
}

export interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  completed: boolean;
}

export interface Measurement {
  id: string;
  stage: string;
  date: string;
  percentage: number;
  description: string;
  photos: string[];
}

export interface Addition {
  id: string;
  date: string;
  reason: string;
  costImpact: number;
  timeImpact: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Integration {
  id: string;
  provider: 'google_drive' | 'dropbox' | 'onedrive';
  name: string;
  description: string;
  connected: boolean;
  connectedEmail?: string;
  lastSync?: string;
}

export type UnitType = 'un' | 'm' | 'm²' | 'm³' | 'kg' | 'l' | 'cx';

export const UNITS: UnitType[] = ['un', 'm', 'm²', 'm³', 'kg', 'l', 'cx'];

// UI Feedback Types
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export interface ConfirmDialogData {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'info';
}