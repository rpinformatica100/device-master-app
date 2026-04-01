

# Plano: Admin Funcional Completo — Tudo Funcionando

## Problemas Identificados

1. **ProtectedRoute**: `subscriptionStatus === null` (usuario novo) **passa pelo check** e acessa o sistema — deveria bloquear
2. **Renovacao perde dias**: Pagamento calcula `expires_at = now + 30 dias` em vez de `max(expires_at_atual, now) + 30 dias`
3. **Admin reply quebrado**: Reply do admin no chat nao envia `parent_message_id` — resposta vai como mensagem nova
4. **AdminLayout sem mobile**: Sidebar fixa 256px, inutilizavel em tela pequena
5. **"Voltar ao sistema" no admin**: SuperAdmin nao deveria acessar area de OS
6. **Cron nao agendado**: Edge function de expiracao existe mas nunca roda automaticamente
7. **Logica duplicada**: Ativacao de subscription duplicada entre PaymentDialog e AdminFinancialPage

---

## Mudancas

### 1. ProtectedRoute — Bloquear `null`
**`src/App.tsx`** — Tratar subscription null como bloqueado:
```typescript
// Antes (bug):
if (subscriptionStatus && !["ativo", "trial"].includes(subscriptionStatus)) {

// Depois (fix):
if (!subscriptionStatus || !["ativo", "trial"].includes(subscriptionStatus)) {
```

### 2. Logica de Renovacao Inteligente
**`src/components/admin/PaymentDialog.tsx`** e **`src/pages/admin/AdminFinancialPage.tsx`**:
- Extrair funcao `calculateRenewalDate` reutilizavel
- Base = `max(current_expires_at, now)` + dias do plano
- Evita perda de dias em pagamento antecipado

### 3. Admin Reply com `parent_message_id`
**`src/pages/admin/AdminNotificationsPage.tsx`**:
- `useAdminSendMessage` precisa aceitar `parent_message_id` opcional
- No reply do `AdminMessageItem`, passar `parent_message_id: msg.id`

**`src/hooks/useMessages.ts`**:
- Atualizar `useAdminSendMessage` para aceitar `parent_message_id`

### 4. AdminLayout Responsivo
**`src/components/admin/AdminLayout.tsx`**:
- Adicionar menu hamburger para mobile (sheet/drawer)
- Sidebar oculta em telas < 1024px
- Header mobile com titulo e hamburger

### 5. Remover "Voltar ao sistema"
**`src/components/admin/AdminLayout.tsx`**:
- Remover botao "Voltar ao sistema" — admin so gerencia, nao usa OS

### 6. Agendar Cron de Expiracao
- Usar `supabase insert tool` para criar pg_cron job que chama a edge function diariamente as 3h

### 7. DRY na Ativacao de Subscription
- Criar funcao utilitaria `activateSubscriptionOnPayment(user, upsertSubscription)` usada por PaymentDialog e AdminFinancialPage

---

## Arquivos Modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Fix ProtectedRoute null check |
| `src/hooks/useMessages.ts` | `useAdminSendMessage` aceitar `parent_message_id` |
| `src/pages/admin/AdminNotificationsPage.tsx` | Reply com `parent_message_id` |
| `src/components/admin/AdminLayout.tsx` | Responsivo + remover "Voltar ao sistema" |
| `src/components/admin/PaymentDialog.tsx` | Renovacao inteligente (max dates) |
| `src/pages/admin/AdminFinancialPage.tsx` | Renovacao inteligente (max dates) |
| SQL (insert tool) | pg_cron schedule para edge function |

