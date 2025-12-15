-- Criar função para gerar próximo número de OS único globalmente
CREATE OR REPLACE FUNCTION public.generate_next_os_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(os_number FROM 4) AS INTEGER)), 0
  ) INTO max_num
  FROM orders;
  
  RETURN 'OS-' || LPAD((max_num + 1)::TEXT, 4, '0');
END;
$$;

-- Garantir que a função pode ser chamada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.generate_next_os_number() TO authenticated;