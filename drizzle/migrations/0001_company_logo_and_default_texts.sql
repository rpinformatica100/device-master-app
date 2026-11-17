ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS default_warranty_text text,
  ADD COLUMN IF NOT EXISTS default_os_notes text,
  ADD COLUMN IF NOT EXISTS default_quote_notes text;
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS warranty_text text,
  ADD COLUMN IF NOT EXISTS customer_notes text;
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS warranty_text text;

CREATE POLICY "Users upload own logo" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own logo" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own logo" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Logos are readable" ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');