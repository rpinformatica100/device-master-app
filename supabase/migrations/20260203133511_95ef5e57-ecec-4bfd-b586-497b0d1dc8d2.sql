-- Create table for repair items (products/services used in repairs)
CREATE TABLE public.used_equipment_repair_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repair_id UUID NOT NULL REFERENCES public.used_equipment_repairs(id) ON DELETE CASCADE,
  item_id UUID, -- Reference to product or service
  item_type TEXT NOT NULL DEFAULT 'manual', -- 'product', 'service', 'manual'
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.used_equipment_repair_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (access through repair which has user_id check)
CREATE POLICY "Users can view own repair items"
  ON public.used_equipment_repair_items
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.used_equipment_repairs r
    WHERE r.id = repair_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own repair items"
  ON public.used_equipment_repair_items
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.used_equipment_repairs r
    WHERE r.id = repair_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own repair items"
  ON public.used_equipment_repair_items
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.used_equipment_repairs r
    WHERE r.id = repair_id AND r.user_id = auth.uid()
  ));