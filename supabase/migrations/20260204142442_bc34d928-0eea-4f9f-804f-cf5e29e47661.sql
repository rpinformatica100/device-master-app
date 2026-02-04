-- Add checklist field to used_equipment table for purchase/sale checklists
ALTER TABLE public.used_equipment 
ADD COLUMN IF NOT EXISTS checklist jsonb DEFAULT NULL;