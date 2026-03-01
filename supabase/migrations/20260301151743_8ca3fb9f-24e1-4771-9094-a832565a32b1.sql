
-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quote_number TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  title TEXT NOT NULL DEFAULT 'Orçamento',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  validity_days INTEGER NOT NULL DEFAULT 7,
  interest_rate NUMERIC NOT NULL DEFAULT 2.99,
  max_installments INTEGER NOT NULL DEFAULT 12,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  total_sale NUMERIC NOT NULL DEFAULT 0,
  total_profit NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE
);

-- Create quote_items table
CREATE TABLE public.quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'service',
  item_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Quotes RLS policies
CREATE POLICY "Users can view own quotes" ON public.quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own quotes" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quotes" ON public.quotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quotes" ON public.quotes FOR DELETE USING (auth.uid() = user_id);

-- Quote items RLS policies
CREATE POLICY "Users can view own quote items" ON public.quote_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_items.quote_id AND q.user_id = auth.uid()));
CREATE POLICY "Users can create own quote items" ON public.quote_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_items.quote_id AND q.user_id = auth.uid()));
CREATE POLICY "Users can update own quote items" ON public.quote_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_items.quote_id AND q.user_id = auth.uid()));
CREATE POLICY "Users can delete own quote items" ON public.quote_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_items.quote_id AND q.user_id = auth.uid()));

-- Function to generate quote number
CREATE OR REPLACE FUNCTION public.generate_next_quote_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_num INTEGER;
  next_num INTEGER;
  current_year TEXT;
BEGIN
  LOCK TABLE quotes IN SHARE UPDATE EXCLUSIVE MODE;
  
  SELECT COALESCE(
    MAX(CAST(
      SPLIT_PART(REGEXP_REPLACE(quote_number, '^ORC-', ''), '-', 1) 
      AS INTEGER
    )), 0
  ) INTO max_num
  FROM quotes
  WHERE quote_number ~ '^ORC-[0-9]+';
  
  next_num := max_num + 1;
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  RETURN 'ORC-' || LPAD(next_num::TEXT, 4, '0') || '-' || current_year;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
