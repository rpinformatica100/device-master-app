-- Drop the existing function and recreate with better concurrency handling
DROP FUNCTION IF EXISTS public.generate_next_os_number();

CREATE OR REPLACE FUNCTION public.generate_next_os_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_num INTEGER;
  next_num INTEGER;
  new_os TEXT;
BEGIN
  -- Lock the orders table to prevent race conditions
  LOCK TABLE orders IN SHARE UPDATE EXCLUSIVE MODE;
  
  -- Get the maximum OS number
  SELECT COALESCE(
    MAX(CAST(NULLIF(REGEXP_REPLACE(os_number, '[^0-9]', '', 'g'), '') AS INTEGER)), 0
  ) INTO max_num
  FROM orders
  WHERE os_number ~ '^OS-[0-9]+$';
  
  -- Calculate next number
  next_num := max_num + 1;
  
  -- Format with leading zeros
  new_os := 'OS-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN new_os;
END;
$$;