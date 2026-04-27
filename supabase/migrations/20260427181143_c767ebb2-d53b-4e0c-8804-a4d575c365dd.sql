-- 1) Audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  actor_email text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_data jsonb,
  new_data jsonb,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.admin_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON public.admin_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.admin_audit_log(created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit log" ON public.admin_audit_log;
CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can create audit log" ON public.admin_audit_log;
CREATE POLICY "Admins can create audit log"
  ON public.admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND actor_id = auth.uid());

-- 2) Auto-activate subscription when payment is marked paid
CREATE OR REPLACE FUNCTION public.auto_activate_subscription_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_sub RECORD;
  base_date timestamptz;
  days_to_add integer;
  new_expires timestamptz;
  plan_to_use text;
BEGIN
  IF NEW.status <> 'pago' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'pago' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO current_sub FROM public.subscriptions WHERE user_id = NEW.user_id LIMIT 1;
  plan_to_use := COALESCE(current_sub.plan, 'mensal');
  IF plan_to_use = 'free' THEN plan_to_use := 'mensal'; END IF;
  days_to_add := CASE WHEN plan_to_use = 'anual' THEN 365 ELSE 30 END;

  base_date := now();
  IF current_sub.expires_at IS NOT NULL AND current_sub.expires_at > now() THEN
    base_date := current_sub.expires_at;
  END IF;
  new_expires := base_date + (days_to_add || ' days')::interval;

  IF current_sub.id IS NULL THEN
    INSERT INTO public.subscriptions (user_id, plan, status, starts_at, expires_at)
    VALUES (NEW.user_id, plan_to_use, 'ativo', now(), new_expires);
  ELSE
    UPDATE public.subscriptions
       SET status = 'ativo',
           plan = plan_to_use,
           starts_at = COALESCE(starts_at, now()),
           expires_at = new_expires,
           updated_at = now()
     WHERE id = current_sub.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_activate_subscription ON public.subscription_payments;
CREATE TRIGGER trg_auto_activate_subscription
AFTER INSERT OR UPDATE OF status ON public.subscription_payments
FOR EACH ROW
EXECUTE FUNCTION public.auto_activate_subscription_on_payment();