-- Update OS number generation function to include year
-- Format: OS-XXXX-YYYY where XXXX is sequential global number and YYYY is current year
CREATE OR REPLACE FUNCTION public.generate_next_os_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_num INTEGER;
  next_num INTEGER;
  current_year TEXT;
  new_os TEXT;
BEGIN
  -- Lock table to prevent race conditions
  LOCK TABLE orders IN SHARE UPDATE EXCLUSIVE MODE;
  
  -- Extract max number from existing OS numbers (handles both old OS-XXXX and new OS-XXXX-YYYY formats)
  SELECT COALESCE(
    MAX(
      CASE 
        -- New format: OS-0042-2026 -> extract 42
        WHEN os_number ~ '^OS-[0-9]+-[0-9]{4}$' THEN 
          CAST(SPLIT_PART(REGEXP_REPLACE(os_number, '^OS-', ''), '-', 1) AS INTEGER)
        -- Old format: OS-0042 -> extract 42
        WHEN os_number ~ '^OS-[0-9]+$' THEN 
          CAST(REGEXP_REPLACE(os_number, '^OS-', '') AS INTEGER)
        ELSE 0
      END
    ), 0
  ) INTO max_num
  FROM orders
  WHERE os_number ~ '^OS-[0-9]+';
  
  next_num := max_num + 1;
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Format: OS-0042-2026
  new_os := 'OS-' || LPAD(next_num::TEXT, 4, '0') || '-' || current_year;
  
  RETURN new_os;
END;
$$;