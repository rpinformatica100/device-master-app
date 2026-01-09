-- Create personal_transactions table
CREATE TABLE public.personal_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'prolabore')),
  category TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'cancelado')),
  payment_method TEXT,
  source_withdrawal_id UUID,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT DEFAULT 'Pro-labore',
  reference_month DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  confirmed_at TIMESTAMPTZ,
  financial_transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE SET NULL,
  personal_transaction_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key after both tables exist
ALTER TABLE public.personal_transactions 
  ADD CONSTRAINT personal_transactions_source_withdrawal_fkey 
  FOREIGN KEY (source_withdrawal_id) REFERENCES public.withdrawals(id) ON DELETE SET NULL;

ALTER TABLE public.withdrawals 
  ADD CONSTRAINT withdrawals_personal_transaction_fkey 
  FOREIGN KEY (personal_transaction_id) REFERENCES public.personal_transactions(id) ON DELETE SET NULL;

-- Enable RLS on personal_transactions
ALTER TABLE public.personal_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own personal transactions"
ON public.personal_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own personal transactions"
ON public.personal_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal transactions"
ON public.personal_transactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal transactions"
ON public.personal_transactions
FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on withdrawals
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals"
ON public.withdrawals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawals"
ON public.withdrawals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own withdrawals"
ON public.withdrawals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own withdrawals"
ON public.withdrawals
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on personal_transactions
CREATE TRIGGER update_personal_transactions_updated_at
BEFORE UPDATE ON public.personal_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();