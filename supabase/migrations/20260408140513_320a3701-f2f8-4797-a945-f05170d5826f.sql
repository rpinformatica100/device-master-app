
CREATE TABLE public.plan_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text UNIQUE NOT NULL,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  period_label text NOT NULL,
  description text,
  features jsonb DEFAULT '[]',
  popular boolean DEFAULT false,
  active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE plan_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plans" ON plan_pricing FOR SELECT TO public USING (true);
CREATE POLICY "Admin can manage plans" ON plan_pricing FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO plan_pricing (plan_key, name, price, period_label, description, features, popular) VALUES
  ('free', 'Free', 0, 'para sempre', 'Para começar', '["Até 50 OS por mês","Cadastro de clientes","Controle de estoque básico","Relatórios simples"]', false),
  ('mensal', 'Mensal', 49, '/mês', 'Tudo ilimitado', '["OS ilimitadas","Clientes ilimitados","Financeiro completo","Relatórios avançados","Exportação de dados","Suporte prioritário"]', true),
  ('anual', 'Anual', 399, '/ano', 'Economize 32%', '["Tudo do plano Mensal","2 meses grátis","Prioridade no suporte","Treinamento incluso"]', false);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'aberto';
