CREATE POLICY "Users can update own repair items"
  ON public.used_equipment_repair_items
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.used_equipment_repairs r
    WHERE r.id = used_equipment_repair_items.repair_id 
    AND r.user_id = auth.uid()
  ));