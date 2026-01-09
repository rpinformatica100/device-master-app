export interface PersonalTransaction {
  id: string;
  user_id: string;
  description: string;
  type: 'receita' | 'despesa' | 'prolabore';
  category: string | null;
  amount: number;
  status: 'pago' | 'pendente' | 'cancelado';
  payment_method: string | null;
  source_withdrawal_id: string | null;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  description: string | null;
  reference_month: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  confirmed_at: string | null;
  financial_transaction_id: string | null;
  personal_transaction_id: string | null;
  created_at: string;
}

export interface PersonalSummary {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalProlabore: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export const personalCategories = [
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'lazer', label: 'Lazer' },
  { value: 'saude', label: 'Saúde' },
  { value: 'moradia', label: 'Moradia' },
  { value: 'educacao', label: 'Educação' },
  { value: 'vestuario', label: 'Vestuário' },
  { value: 'prolabore', label: 'Pro-labore' },
  { value: 'investimentos', label: 'Investimentos' },
  { value: 'outros', label: 'Outros' },
] as const;

export const paymentMethods = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'transferencia', label: 'Transferência' },
] as const;
