DROP POLICY IF EXISTS "Logos are readable" ON storage.objects;
CREATE POLICY "Users read own logo" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "Anyone can read plans" ON public.plan_pricing;
CREATE POLICY "Anyone can read active plans" ON public.plan_pricing FOR SELECT
USING (active = true);