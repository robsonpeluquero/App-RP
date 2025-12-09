
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
  descricaoSnapshot: string; // Guardamos o nome caso o material seja deletado futuramente
  quantidade: number;
  precoUnitario: number; // Preço no momento do orçamento
  subtotal: number;
}

export interface Orcamento {
  id: string;
  numero: string;
  fornecedorNome: string; // Renamed from clienteNome
  fornecedorTelefone?: string; // New
  fornecedorSite?: string; // New
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
}

export interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  completed: boolean;
}

export type UnitType = 'un' | 'm' | 'm²' | 'm³' | 'kg' | 'l' | 'cx';

export const UNITS: UnitType[] = ['un', 'm', 'm²', 'm³', 'kg', 'l', 'cx'];