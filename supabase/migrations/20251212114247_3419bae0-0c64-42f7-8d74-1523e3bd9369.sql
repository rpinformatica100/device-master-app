-- Add user_id column to all tables
ALTER TABLE public.clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.financial_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clients;

DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON public.orders;

DROP POLICY IF EXISTS "Authenticated users can view order_items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can create order_items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can update order_items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can delete order_items" ON public.order_items;

DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can create products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

DROP POLICY IF EXISTS "Authenticated users can view services" ON public.services;
DROP POLICY IF EXISTS "Authenticated users can create services" ON public.services;
DROP POLICY IF EXISTS "Authenticated users can update services" ON public.services;
DROP POLICY IF EXISTS "Authenticated users can delete services" ON public.services;

DROP POLICY IF EXISTS "Authenticated users can view financial_transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Authenticated users can create financial_transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Authenticated users can update financial_transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Authenticated users can delete financial_transactions" ON public.financial_transactions;

-- Create new RLS policies for clients (user can only see their own data)
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create new RLS policies for orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own orders" ON public.orders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create new RLS policies for order_items (based on order ownership)
CREATE POLICY "Users can view own order_items" ON public.order_items FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can create own order_items" ON public.order_items FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can update own order_items" ON public.order_items FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can delete own order_items" ON public.order_items FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Create new RLS policies for products
CREATE POLICY "Users can view own products" ON public.products FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own products" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON public.products FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create new RLS policies for services
CREATE POLICY "Users can view own services" ON public.services FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own services" ON public.services FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own services" ON public.services FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own services" ON public.services FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create new RLS policies for financial_transactions
CREATE POLICY "Users can view own transactions" ON public.financial_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON public.financial_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.financial_transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.financial_transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);