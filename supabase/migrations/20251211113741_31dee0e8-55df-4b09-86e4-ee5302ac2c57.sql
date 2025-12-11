-- Drop all existing permissive policies and create authenticated-only policies

-- CLIENTS TABLE
DROP POLICY IF EXISTS "Anyone can view clients" ON clients;
DROP POLICY IF EXISTS "Anyone can create clients" ON clients;
DROP POLICY IF EXISTS "Anyone can update clients" ON clients;
DROP POLICY IF EXISTS "Anyone can delete clients" ON clients;

CREATE POLICY "Authenticated users can view clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete clients" ON clients FOR DELETE TO authenticated USING (true);

-- ORDERS TABLE
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can delete orders" ON orders;

CREATE POLICY "Authenticated users can view orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update orders" ON orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete orders" ON orders FOR DELETE TO authenticated USING (true);

-- ORDER_ITEMS TABLE
DROP POLICY IF EXISTS "Anyone can view order_items" ON order_items;
DROP POLICY IF EXISTS "Anyone can create order_items" ON order_items;
DROP POLICY IF EXISTS "Anyone can update order_items" ON order_items;
DROP POLICY IF EXISTS "Anyone can delete order_items" ON order_items;

CREATE POLICY "Authenticated users can view order_items" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create order_items" ON order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update order_items" ON order_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete order_items" ON order_items FOR DELETE TO authenticated USING (true);

-- PRODUCTS TABLE
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Anyone can create products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

CREATE POLICY "Authenticated users can view products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE TO authenticated USING (true);

-- SERVICES TABLE
DROP POLICY IF EXISTS "Anyone can view services" ON services;
DROP POLICY IF EXISTS "Anyone can create services" ON services;
DROP POLICY IF EXISTS "Anyone can update services" ON services;
DROP POLICY IF EXISTS "Anyone can delete services" ON services;

CREATE POLICY "Authenticated users can view services" ON services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create services" ON services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update services" ON services FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete services" ON services FOR DELETE TO authenticated USING (true);

-- FINANCIAL_TRANSACTIONS TABLE
DROP POLICY IF EXISTS "Anyone can view financial_transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Anyone can create financial_transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Anyone can update financial_transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Anyone can delete financial_transactions" ON financial_transactions;

CREATE POLICY "Authenticated users can view financial_transactions" ON financial_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create financial_transactions" ON financial_transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update financial_transactions" ON financial_transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete financial_transactions" ON financial_transactions FOR DELETE TO authenticated USING (true);