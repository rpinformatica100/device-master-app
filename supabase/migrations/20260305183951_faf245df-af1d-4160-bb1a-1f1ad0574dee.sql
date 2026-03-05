-- Allow admin to read ALL company_settings (needed for admin users list)
CREATE POLICY "Admin can read all company settings"
ON public.company_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Allow admin to read ALL subscriptions (already has "Admin can do all" but just for clarity, it's covered)
-- The subscriptions table already has the admin policy from the initial migration