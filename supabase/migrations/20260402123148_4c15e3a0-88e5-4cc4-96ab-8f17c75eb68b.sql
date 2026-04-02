CREATE OR REPLACE FUNCTION public.handle_new_user_role_and_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If admin email, assign admin role (no subscription needed)
  IF NEW.email IN ('admin@admin.com', 'superadmin@techos.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- For regular users, create a subscription with "aguardando" status
    INSERT INTO public.subscriptions (user_id, plan, status)
    VALUES (NEW.id, 'free', 'aguardando');
  END IF;
  
  RETURN NEW;
END;
$function$;