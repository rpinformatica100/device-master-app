import { Client, Order } from './database';

export interface UsedEquipment {
  id: string;
  user_id: string;
  code: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  imei?: string | null;
  category: string;
  condition: string;
  status: string;
  purchase_price: number;
  repair_cost: number;
  total_cost: number;
  sale_price?: number | null;
  profit?: number | null;
  notes?: string | null;
  photos?: string[];
  created_at: string;
  updated_at: string;
  sold_at?: string | null;
  // Joined data
  purchases?: UsedEquipmentPurchase[];
  repairs?: UsedEquipmentRepair[];
  sale?: UsedEquipmentSale | null;
}

export interface UsedEquipmentPurchase {
  id: string;
  user_id: string;
  equipment_id: string;
  client_id?: string | null;
  source_order_id?: string | null;
  source_type: 'compra' | 'os';
  amount: number;
  financial_transaction_id?: string | null;
  notes?: string | null;
  created_at: string;
  // Joined data
  client?: Client | null;
  source_order?: Order | null;
}

export interface UsedEquipmentRepair {
  id: string;
  user_id: string;
  equipment_id: string;
  order_id?: string | null;
  description: string;
  parts_cost: number;
  labor_cost: number;
  total_cost: number;
  completed_at?: string | null;
  notes?: string | null;
  created_at: string;
  // Joined data
  order?: Order | null;
}

export interface UsedEquipmentSale {
  id: string;
  user_id: string;
  equipment_id: string;
  client_id?: string | null;
  amount: number;
  payment_method?: string | null;
  financial_transaction_id?: string | null;
  warranty_days: number;
  notes?: string | null;
  created_at: string;
  // Joined data
  client?: Client | null;
}

export type EquipmentStatus = 'disponivel' | 'em_reparo' | 'reservado' | 'vendido';
export type EquipmentCondition = 'excelente' | 'bom' | 'regular' | 'defeito';
export type EquipmentCategory = 'smartphone' | 'notebook' | 'tablet' | 'desktop' | 'impressora' | 'monitor' | 'outros';

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  disponivel: 'Disponível',
  em_reparo: 'Em Reparo',
  reservado: 'Reservado',
  vendido: 'Vendido',
};

export const EQUIPMENT_CONDITION_LABELS: Record<EquipmentCondition, string> = {
  excelente: 'Excelente',
  bom: 'Bom',
  regular: 'Regular',
  defeito: 'Com Defeito',
};

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  smartphone: 'Smartphone',
  notebook: 'Notebook',
  tablet: 'Tablet',
  desktop: 'Desktop',
  impressora: 'Impressora',
  monitor: 'Monitor',
  outros: 'Outros',
};

export const EQUIPMENT_STATUS_COLORS: Record<EquipmentStatus, string> = {
  disponivel: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  em_reparo: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  reservado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  vendido: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export interface EquipmentFormData {
  name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  imei?: string;
  category: string;
  condition: string;
  notes?: string;
}

export interface PurchaseFormData {
  client_id?: string;
  source_order_id?: string;
  source_type: 'compra' | 'os';
  amount: number;
  notes?: string;
}

export interface RepairFormData {
  description: string;
  parts_cost: number;
  labor_cost: number;
  order_id?: string;
  notes?: string;
}

export interface SaleFormData {
  client_id?: string;
  amount: number;
  payment_method: string;
  warranty_days: number;
  notes?: string;
}
