// Types for the database entities
import { Json } from '@/integrations/supabase/types';

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;
  cep?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  cost_price: number;
  sale_price: number;
  category?: string | null;
  stock: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  cost_price: number;
  sale_price: number;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: string;
  item_id?: string | null;
  name: string;
  cost_price: number;
  sale_price: number;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  os_number: string;
  client_id?: string | null;
  device: string;
  category: string;
  serial_number?: string | null;
  password?: string | null;
  accessories?: string | null;
  issue: string;
  internal_notes?: string | null;
  priority: string;
  status: string;
  category_specific_fields?: Json | null;
  total_cost: number;
  total_sale: number;
  total_profit: number;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  // Joined data
  client?: Client | null;
  items?: OrderItem[];
}

export interface FinancialTransaction {
  id: string;
  order_id?: string | null;
  client_id?: string | null;
  description: string;
  type: string;
  category?: string | null;
  amount: number;
  cost_amount: number;
  profit_amount: number;
  status: string;
  payment_method?: string | null;
  due_date?: string | null;
  paid_at?: string | null;
  details?: Json | null;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: Client | null;
  order?: Order | null;
}

export interface OrderItemInput {
  item_type: 'product' | 'service';
  item_id?: string;
  name: string;
  cost_price: number;
  sale_price: number;
  quantity: number;
}
