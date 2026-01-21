-- Add client_type and cnpj columns to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_type text DEFAULT 'pessoa_fisica';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cnpj text;

-- Add comment for clarity
COMMENT ON COLUMN public.clients.client_type IS 'Type of client: pessoa_fisica or pessoa_juridica';
COMMENT ON COLUMN public.clients.cnpj IS 'CNPJ for legal entities';