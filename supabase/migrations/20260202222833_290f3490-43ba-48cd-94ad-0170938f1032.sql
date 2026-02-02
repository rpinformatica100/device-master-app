-- Function to generate next equipment code
CREATE OR REPLACE FUNCTION public.generate_next_equipment_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  max_num INTEGER;
  next_num INTEGER;
  new_code TEXT;
BEGIN
  SELECT COALESCE(
    MAX(CAST(NULLIF(REGEXP_REPLACE(code, '[^0-9]', '', 'g'), '') AS INTEGER)), 0
  ) INTO max_num
  FROM used_equipment
  WHERE code ~ '^EQ-[0-9]+$';
  
  next_num := max_num + 1;
  new_code := 'EQ-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN new_code;
END;
$function$;

-- Main equipment table
CREATE TABLE public.used_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  imei TEXT,
  category TEXT NOT NULL DEFAULT 'outros',
  condition TEXT NOT NULL DEFAULT 'bom',
  status TEXT NOT NULL DEFAULT 'disponivel',
  purchase_price NUMERIC NOT NULL DEFAULT 0,
  repair_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC,
  profit NUMERIC,
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sold_at TIMESTAMP WITH TIME ZONE
);

-- Purchases table (acquisition records)
CREATE TABLE public.used_equipment_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  equipment_id UUID NOT NULL REFERENCES public.used_equipment(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  source_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL DEFAULT 'compra',
  amount NUMERIC NOT NULL DEFAULT 0,
  financial_transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Repairs table
CREATE TABLE public.used_equipment_repairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  equipment_id UUID NOT NULL REFERENCES public.used_equipment(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  parts_cost NUMERIC NOT NULL DEFAULT 0,
  labor_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sales table
CREATE TABLE public.used_equipment_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  equipment_id UUID NOT NULL REFERENCES public.used_equipment(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  financial_transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE SET NULL,
  warranty_days INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.used_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.used_equipment_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.used_equipment_repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.used_equipment_sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for used_equipment
CREATE POLICY "Users can view own equipment" ON public.used_equipment
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own equipment" ON public.used_equipment
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment" ON public.used_equipment
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment" ON public.used_equipment
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for used_equipment_purchases
CREATE POLICY "Users can view own purchases" ON public.used_equipment_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases" ON public.used_equipment_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchases" ON public.used_equipment_purchases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchases" ON public.used_equipment_purchases
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for used_equipment_repairs
CREATE POLICY "Users can view own repairs" ON public.used_equipment_repairs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own repairs" ON public.used_equipment_repairs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own repairs" ON public.used_equipment_repairs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own repairs" ON public.used_equipment_repairs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for used_equipment_sales
CREATE POLICY "Users can view own sales" ON public.used_equipment_sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sales" ON public.used_equipment_sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales" ON public.used_equipment_sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales" ON public.used_equipment_sales
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_used_equipment_updated_at
  BEFORE UPDATE ON public.used_equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();