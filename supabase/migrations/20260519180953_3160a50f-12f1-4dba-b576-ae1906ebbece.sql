
-- Function to purge ALL data of a given user (called by admin before hard-deleting auth user).
CREATE OR REPLACE FUNCTION public.admin_purge_user_data(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  -- Block purging another admin
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Cannot purge admin user';
  END IF;

  DELETE FROM public.used_equipment_repair_items
    WHERE repair_id IN (SELECT id FROM public.used_equipment_repairs WHERE user_id = _user_id);
  DELETE FROM public.used_equipment_repairs WHERE user_id = _user_id;
  DELETE FROM public.used_equipment_sales WHERE user_id = _user_id;
  DELETE FROM public.used_equipment_purchases WHERE user_id = _user_id;
  DELETE FROM public.used_equipment WHERE user_id = _user_id;
  DELETE FROM public.quote_items
    WHERE quote_id IN (SELECT id FROM public.quotes WHERE user_id = _user_id);
  DELETE FROM public.quotes WHERE user_id = _user_id;
  DELETE FROM public.order_items
    WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = _user_id);
  DELETE FROM public.financial_transactions WHERE user_id = _user_id;
  DELETE FROM public.personal_transactions WHERE user_id = _user_id;
  DELETE FROM public.withdrawals WHERE user_id = _user_id;
  DELETE FROM public.orders WHERE user_id = _user_id;
  DELETE FROM public.clients WHERE user_id = _user_id;
  DELETE FROM public.products WHERE user_id = _user_id;
  DELETE FROM public.services WHERE user_id = _user_id;
  DELETE FROM public.company_settings WHERE user_id = _user_id;
  DELETE FROM public.subscription_payments WHERE user_id = _user_id;
  DELETE FROM public.subscriptions WHERE user_id = _user_id;
  DELETE FROM public.messages WHERE sender_id = _user_id OR recipient_id = _user_id;
  DELETE FROM public.admin_notifications WHERE user_id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_purge_user_data(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_purge_user_data(uuid) TO authenticated, service_role;

-- One-off cleanup of existing orphans (users that no longer exist in auth.users)
DELETE FROM public.clients c WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = c.user_id);
DELETE FROM public.subscriptions s WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = s.user_id);
DELETE FROM public.subscription_payments p WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.user_id);
DELETE FROM public.company_settings cs WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = cs.user_id);
DELETE FROM public.orders o WHERE o.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = o.user_id);
DELETE FROM public.products p WHERE p.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.user_id);
DELETE FROM public.services s WHERE s.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = s.user_id);
DELETE FROM public.financial_transactions f WHERE f.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = f.user_id);
DELETE FROM public.personal_transactions pt WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = pt.user_id);
DELETE FROM public.quotes q WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = q.user_id);
DELETE FROM public.used_equipment ue WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = ue.user_id);
DELETE FROM public.withdrawals w WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = w.user_id);
DELETE FROM public.user_roles r WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = r.user_id);
