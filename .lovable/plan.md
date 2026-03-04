

# Plano: Painel Admin com Controle Financeiro de Assinaturas

## Contexto

O sistema ainda nao possui painel admin nem controle de assinaturas. O usuario quer um painel admin completo para gerenciar assistencias cadastradas, com foco em controle financeiro simples: registrar pagamentos de mensalidade, forma de pagamento, data, e ter flexibilidade para editar tudo.

---

## Banco de Dados (3 tabelas + 1 funcao)

### Tabela `user_roles`
```text
id (uuid PK), user_id (uuid, FK auth.users, NOT NULL), role (enum: admin/user)
unique(user_id, role)
```
RLS: funcao `has_role()` SECURITY DEFINER para verificar roles sem recursao.

### Tabela `subscriptions`
```text
id, user_id, plan (text: free/mensal/anual), status (text: ativo/suspenso/expirado/trial),
starts_at, expires_at, notes, created_at, updated_at
```
RLS: admin le/escreve tudo, usuario le so a propria.

### Tabela `subscription_payments` (NOVO - controle financeiro)
```text
id (uuid PK)
user_id (uuid) -- a assistencia que pagou
subscription_id (uuid, FK subscriptions)
amount (numeric) -- valor pago
payment_method (text) -- pix/cartao/boleto/dinheiro/transferencia
status (text) -- pago/pendente/atrasado/cancelado
reference_month (date) -- mes de referencia (ex: 2026-03-01)
due_date (date) -- vencimento
paid_at (timestamptz) -- quando pagou
notes (text) -- observacoes livres
created_by (uuid) -- admin que registrou
created_at, updated_at
```
RLS: somente admin pode CRUD. Usuario pode ver os proprios.

### Funcao `has_role()`
```sql
SECURITY DEFINER, retorna boolean, verifica user_roles sem RLS recursivo.
```

---

## Paginas Admin

### `/admin` - Dashboard
- Total assistencias cadastradas, ativas, suspensas, expiradas
- Pagamentos pendentes/atrasados do mes
- Receita do mes (soma de pagamentos pagos)
- Ultimos cadastros e pagamentos recentes

### `/admin/usuarios` - Gestao de Usuarios
- Tabela com todas assistencias: nome, email, telefone, empresa, CNPJ, plano, status, expiracao
- Acoes: ativar/suspender, editar plano/datas, ver detalhes
- Dialog para editar subscription com campos livres

### `/admin/financeiro` - Controle Financeiro de Assinaturas (FOCO PRINCIPAL)
- Visao de todos os pagamentos de mensalidade
- Filtros: mes, status (pago/pendente/atrasado), assistencia
- Registrar novo pagamento: selecionar assistencia, valor, forma de pagamento, mes referencia, data pagamento
- Editar qualquer campo livremente (valor, data, status, forma de pagamento, notas)
- Indicadores: total recebido no mes, total pendente, total atrasado
- Marcar como pago com um clique

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| Migracao SQL | user_roles, subscriptions, subscription_payments, has_role(), enum app_role, insert admin inicial |
| `src/hooks/useAdmin.ts` | CRUD usuarios, subscriptions, payments |
| `src/pages/admin/AdminDashboard.tsx` | Dashboard admin |
| `src/pages/admin/AdminUsersPage.tsx` | Gestao de assistencias |
| `src/pages/admin/AdminFinancialPage.tsx` | Controle financeiro de mensalidades |
| `src/components/admin/AdminLayout.tsx` | Layout com sidebar propria do admin |
| `src/components/admin/SubscriptionDialog.tsx` | Editar plano/datas de assinatura |
| `src/components/admin/PaymentDialog.tsx` | Registrar/editar pagamento |

## Arquivos a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `src/hooks/useAuth.tsx` | Adicionar `isAdmin` via has_role(), criar subscription padrao no signup |
| `src/App.tsx` | Rotas `/admin/*` protegidas por AdminRoute, verificacao de subscription ativa |
| `src/pages/AuthPage.tsx` | Redirecionar admin para `/admin` apos login |

## Seguranca

- Role admin verificada server-side via `has_role()` SECURITY DEFINER
- Nunca client-side (localStorage)
- RLS em todas tabelas admin
- Primeiro admin inserido via migracao SQL (preciso do email do admin)
- Usuarios com subscription expirada veem tela de renovacao com link WhatsApp

## Fluxo

1. Assistencia se cadastra -> subscription criada com status "trial" ou "aguardando"
2. Contrata via WhatsApp
3. Admin acessa `/admin/usuarios`, ativa subscription com plano e data
4. Admin registra pagamento em `/admin/financeiro`
5. Pode editar qualquer dado a qualquer momento
6. Assistencia com assinatura expirada -> tela de renovacao

