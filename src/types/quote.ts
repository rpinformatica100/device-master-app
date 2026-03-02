export interface Quote {
  id: string;
  user_id: string;
  quote_number: string;
  client_id?: string | null;
  title: string;
  description?: string | null;
  equipment_description?: string | null;
  problem_description?: string | null;
  solution_description?: string | null;
  status: string;
  validity_days: number;
  interest_rate: number;
  max_installments: number;
  discount_percentage: number;
  total_cost: number;
  total_sale: number;
  total_profit: number;
  notes?: string | null;
  order_id?: string | null;
  created_at: string;
  updated_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
  client?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    cpf?: string | null;
    cnpj?: string | null;
    address?: string | null;
    numero?: string | null;
    bairro?: string | null;
    city?: string | null;
    state?: string | null;
  } | null;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  item_type: string;
  item_id?: string | null;
  name: string;
  description?: string | null;
  quantity: number;
  cost_price: number;
  sale_price: number;
  created_at: string;
}

export interface QuoteItemInput {
  item_type: 'product' | 'service' | 'manual';
  item_id?: string;
  name: string;
  description?: string;
  cost_price: number;
  sale_price: number;
  quantity: number;
}
