
-- 1. Prevent privilege escalation: lock down user_roles writes to admins only
CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. admin_notifications: don't let regular users read/update broadcast (NULL user_id) rows
DROP POLICY IF EXISTS "Users can view own notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.admin_notifications;

CREATE POLICY "Users can view own notifications"
ON public.admin_notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
ON public.admin_notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Realtime messages: restrict broadcast/presence channel access to authenticated users
-- (postgres_changes already enforce table RLS on public.messages)
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can use realtime" ON realtime.messages;
CREATE POLICY "Authenticated users can use realtime"
ON realtime.messages FOR SELECT TO authenticated
USING (true);
