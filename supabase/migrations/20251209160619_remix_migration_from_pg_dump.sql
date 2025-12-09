CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    cpf text,
    cep text,
    address text,
    city text,
    state text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    client_id uuid,
    description text NOT NULL,
    type text NOT NULL,
    category text,
    amount numeric(10,2) DEFAULT 0 NOT NULL,
    cost_amount numeric(10,2) DEFAULT 0 NOT NULL,
    profit_amount numeric(10,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'pendente'::text NOT NULL,
    payment_method text,
    due_date date,
    paid_at timestamp with time zone,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    item_type text NOT NULL,
    item_id uuid,
    name text NOT NULL,
    cost_price numeric(10,2) DEFAULT 0 NOT NULL,
    sale_price numeric(10,2) DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    os_number text NOT NULL,
    client_id uuid,
    device text NOT NULL,
    category text NOT NULL,
    serial_number text,
    password text,
    accessories text,
    issue text NOT NULL,
    internal_notes text,
    priority text DEFAULT 'normal'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    category_specific_fields jsonb DEFAULT '{}'::jsonb,
    total_cost numeric(10,2) DEFAULT 0 NOT NULL,
    total_sale numeric(10,2) DEFAULT 0 NOT NULL,
    total_profit numeric(10,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    sku text,
    cost_price numeric(10,2) DEFAULT 0 NOT NULL,
    sale_price numeric(10,2) DEFAULT 0 NOT NULL,
    category text,
    stock integer DEFAULT 0 NOT NULL,
    min_stock integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    cost_price numeric(10,2) DEFAULT 0 NOT NULL,
    sale_price numeric(10,2) DEFAULT 0 NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_os_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_os_number_key UNIQUE (os_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: clients update_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: financial_transactions update_financial_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: services update_services_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: financial_transactions financial_transactions_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: clients Anyone can create clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create clients" ON public.clients FOR INSERT WITH CHECK (true);


--
-- Name: financial_transactions Anyone can create financial_transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create financial_transactions" ON public.financial_transactions FOR INSERT WITH CHECK (true);


--
-- Name: order_items Anyone can create order_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create order_items" ON public.order_items FOR INSERT WITH CHECK (true);


--
-- Name: orders Anyone can create orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);


--
-- Name: products Anyone can create products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create products" ON public.products FOR INSERT WITH CHECK (true);


--
-- Name: services Anyone can create services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create services" ON public.services FOR INSERT WITH CHECK (true);


--
-- Name: clients Anyone can delete clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete clients" ON public.clients FOR DELETE USING (true);


--
-- Name: financial_transactions Anyone can delete financial_transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete financial_transactions" ON public.financial_transactions FOR DELETE USING (true);


--
-- Name: order_items Anyone can delete order_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete order_items" ON public.order_items FOR DELETE USING (true);


--
-- Name: orders Anyone can delete orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete orders" ON public.orders FOR DELETE USING (true);


--
-- Name: products Anyone can delete products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);


--
-- Name: services Anyone can delete services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete services" ON public.services FOR DELETE USING (true);


--
-- Name: clients Anyone can update clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update clients" ON public.clients FOR UPDATE USING (true);


--
-- Name: financial_transactions Anyone can update financial_transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update financial_transactions" ON public.financial_transactions FOR UPDATE USING (true);


--
-- Name: order_items Anyone can update order_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update order_items" ON public.order_items FOR UPDATE USING (true);


--
-- Name: orders Anyone can update orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);


--
-- Name: products Anyone can update products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);


--
-- Name: services Anyone can update services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update services" ON public.services FOR UPDATE USING (true);


--
-- Name: clients Anyone can view clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view clients" ON public.clients FOR SELECT USING (true);


--
-- Name: financial_transactions Anyone can view financial_transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view financial_transactions" ON public.financial_transactions FOR SELECT USING (true);


--
-- Name: order_items Anyone can view order_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view order_items" ON public.order_items FOR SELECT USING (true);


--
-- Name: orders Anyone can view orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);


--
-- Name: products Anyone can view products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);


--
-- Name: services Anyone can view services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);


--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: financial_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


