

# Plano: Centralizar Preços dos Planos, Melhorar Financeiro Admin e Sistema de Chamados

## Resumo

Três frentes de trabalho: (1) centralizar os valores dos planos em uma tabela configurável pelo admin, integrando Landing Page, Financeiro Admin e PaymentDialog; (2) melhorar o fluxo de "Novo Pagamento" com auto-preenchimento baseado no plano; (3) transformar mensagens em chamados com status (aberto/encerrado).

---

## 1. Tabela de Configuração de Planos (nova migração)

Criar tabela `plan_pricing` para armazenar os valores dos planos de forma editável:

```sql
CREATE TABLE public.plan_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text UNIQUE NOT NULL, -- 'free', 'mensal', 'anual'
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  period_label text NOT NULL, -- '/mês', '/ano', 'para sempre'
  description text,
  features jsonb DEFAULT '[]',
  popular boolean DEFAULT false,
  active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Dados iniciais
INSERT INTO plan_pricing (plan_key, name, price, period_label, description, features, popular) VALUES
  ('free', 'Free', 0, 'para sempre', 'Para começar', '["Até 50 OS por mês","Cadastro de clientes","Controle de estoque básico","Relatórios simples"]', false),
  ('mensal', 'Mensal', 49, '/mês', 'Tudo ilimitado', '["OS ilimitadas","Clientes ilimitados","Financeiro completo","Relatórios avançados","Exportação de dados","Suporte prioritário"]', true),
  ('anual', 'Anual', 399, '/ano', 'Economize 32%', '["Tudo do plano Mensal","2 meses grátis","Prioridade no suporte","Treinamento incluso"]', false);

-- RLS: leitura pública, escrita apenas admin
ALTER TABLE plan_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plans" ON plan_pricing FOR SELECT TO public USING (true);
CREATE POLICY "Admin can manage plans" ON plan_pricing FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
```

## 2. Adicionar campo `status` à tabela `messages` (migração)

```sql
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'aberto';
```

Valores possíveis: `aberto`, `encerrado`.

---

## 3. Hook `usePlanPricing`

Novo hook (`src/hooks/usePlanPricing.ts`) que busca os planos da tabela `plan_pricing`. Usado por:
- Landing Page (substituir array hardcoded `pricingPlans`)
- PaymentDialog (auto-preencher valor ao selecionar plano)
- Admin (para editar preços)

## 4. Melhorar PaymentDialog (`src/components/admin/PaymentDialog.tsx`)

- Adicionar seletor de **Plano** (Free/Mensal/Anual) que:
  - Auto-preenche o campo Valor com o preço da tabela `plan_pricing`
  - Auto-calcula datas de início e expiração baseado no plano
- Ao selecionar a assistência, mostrar plano atual e status da assinatura

## 5. Landing Page dinâmica (`src/pages/LandingPage.tsx`)

- Substituir o array `pricingPlans` hardcoded pela query `usePlanPricing`
- Formatar preço dinamicamente (R$ 0 = "Grátis", senão `R$ {price}`)

## 6. Painel Admin: Gerenciar Preços dos Planos

- Nova seção na página de Assistências ou Financeiro Admin para editar os valores dos planos
- Formulário simples: Nome, Preço, Descrição, Features
- Usar mutation para atualizar `plan_pricing`

## 7. Sistema de Chamados (Mensagens com Status)

**Admin (`AdminNotificationsPage.tsx`):**
- Adicionar botão "Encerrar Chamado" em cada conversa
- Filtro por status: Abertos / Encerrados
- Ao encerrar, atualiza `messages.status = 'encerrado'` na mensagem pai

**Usuário (`MessagesPage.tsx`):**
- Mostrar badge "Encerrado" em conversas fechadas
- Desabilitar campo de resposta em chamados encerrados

**Hook (`useMessages.ts`):**
- Adicionar mutation `useCloseTicket` para atualizar status
- Filtrar mensagens por status quando necessário

---

## Arquivos Modificados/Criados

| Arquivo | Ação |
|---|---|
| Migração SQL | Criar tabela `plan_pricing` + adicionar `status` em `messages` |
| `src/hooks/usePlanPricing.ts` | Novo hook para buscar/editar preços dos planos |
| `src/pages/LandingPage.tsx` | Usar preços dinâmicos da tabela |
| `src/components/admin/PaymentDialog.tsx` | Seletor de plano com auto-preenchimento de valor e datas |
| `src/hooks/useMessages.ts` | Adicionar mutation `useCloseTicket` |
| `src/pages/admin/AdminNotificationsPage.tsx` | Botão encerrar chamado + filtros |
| `src/pages/MessagesPage.tsx` | Badge encerrado + bloquear resposta |
| `src/pages/admin/AdminFinancialPage.tsx` | Seção para gerenciar preços dos planos (ou página separada) |

