-- Add equipment, problem, and solution description fields to quotes
ALTER TABLE public.quotes 
  ADD COLUMN equipment_description text DEFAULT NULL,
  ADD COLUMN problem_description text DEFAULT NULL,
  ADD COLUMN solution_description text DEFAULT NULL;