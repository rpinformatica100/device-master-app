export interface RepairItem {
  id?: string;
  repair_id?: string;
  item_id?: string | null;
  item_type: 'product' | 'service' | 'manual';
  name: string;
  quantity: number;
  cost_price: number;
  created_at?: string;
}

export interface RepairItemFormData {
  item_type: 'product' | 'service' | 'manual';
  item_id?: string;
  name: string;
  quantity: number;
  cost_price: number;
}
