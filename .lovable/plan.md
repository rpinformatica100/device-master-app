

# Plano: Integração Total Admin ↔ Assistências

## Resumo

Implementar integração profissional completa entre o painel Admin e as assistências, cobrindo: bloqueio automático por vencimento, atualização automática de datas ao registrar pagamentos, sistema de mensagens bidirecional em tempo real com confirmação de leitura.

---

## 1. Bloqueio Automático por Vencimento

**Problema atual:** O `ProtectedRoute` verifica `subscriptionStatus` mas nao checa `expires_at`. Uma assinatura "ativo" com data expirada continua funcionando.

**Solucao:**
- Alterar `useAuth.tsx` para tambem buscar `expires_at` da subscription
- No `ProtectedRoute`, se `expires_at < now()`, redirecionar para `/assinatura-expirada` mesmo com status "ativo"
- Criar edge function com cron job diario que atualiza automaticamente subscriptions vencidas para status "expirado"

---

## 2. Atualização Automática ao Registrar Pagamento

**Problema atual:** Registrar um pagamento no admin nao atualiza automaticamente a subscription da assistencia.

**Solucao:**
- Quando admin registra pagamento com status "pago", automaticamente:
  - Atualizar subscription para status "ativo"
  - Recalcular `starts_at` e `expires_at` baseado no plano (mensal = +30 dias, anual = +365 dias)
- Implementar isso no `PaymentDialog` e no botao "Marcar como pago"
- Tambem atualizar quando admin muda plano no `SubscriptionDialog`

---

## 3. Sistema de Mensagens Bidirecional (substituir notificacoes unidirecionais)

**Banco de dados - nova tabela `messages`:**
```text
id (uuid PK)
conversation_id (uuid) -- agrupa mensagens de uma conversa
sender_id (uuid) -- quem enviou
recipient_id (uuid, nullable) -- null = broadcast global
message (text) -- conteudo
type (text) -- info/warning/success/error/reply
read_at (timestamptz) -- confirmacao de leitura
parent_message_id (uuid, nullable) -- para respostas
created_at (timestamptz)
```

**RLS:**
- Admin pode ler/escrever todas
- Usuario pode ler as proprias (recipient_id = uid OU null) e criar respostas

**Realtime:** Habilitar `supabase_realtime` na tabela `messages` para notificacoes instantaneas.

---

## 4. Lado Admin - Central de Mensagens

Substituir a pagina `/admin/notificacoes` atual por uma central de mensagens completa:
- Enviar mensagem para assistencia especifica ou broadcast
- Ver conversas com cada assistencia (estilo chat)
- Indicador de leitura (check duplo quando lida)
- Ver respostas das assistencias
- Badge com contagem de mensagens nao lidas

---

## 5. Lado Assistencia - Caixa de Mensagens

- Icone de sino na Sidebar com badge de contagem de nao lidas
- Pagina `/mensagens` com lista de mensagens recebidas
- Possibilidade de responder mensagens do admin
- Marcar como lida ao abrir
- Notificacao visual (toast) quando chega mensagem nova via realtime

---

## 6. Pagina de Assinatura Expirada - Melhorias

- Mostrar detalhes do plano expirado e data de expiracao
- Mostrar mensagens do admin mesmo na tela de expirada (para comunicacao)
- Numero de WhatsApp configuravel

---

## Arquivos e Mudancas

### Banco de Dados (Migration)
| Acao | Descricao |
|------|-----------|
| Criar tabela `messages` | Mensagens bidirecionais com leitura |
| RLS para `messages` | Admin tudo, usuario le/responde proprias |
| Habilitar realtime | `ALTER PUBLICATION supabase_realtime ADD TABLE messages` |
| Manter `admin_notifications` | Tabela existente preservada para historico |

### Edge Function (Cron)
| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/check-expired-subscriptions/index.ts` | Verifica e expira subscriptions vencidas diariamente |

### Hooks
| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useAuth.tsx` | Adicionar `subscriptionExpiresAt`, verificar data de expiracao |
| `src/hooks/useAdmin.ts` | Adicionar funcoes para messages, auto-update subscription ao pagar |
| `src/hooks/useMessages.ts` (NOVO) | Hook para mensagens: listar, enviar, responder, marcar lida, realtime |

### Componentes Admin
| Arquivo | Mudanca |
|---------|---------|
| `src/pages/admin/AdminNotificationsPage.tsx` | Reescrever como central de mensagens com chat |
| `src/components/admin/PaymentDialog.tsx` | Auto-atualizar subscription ao registrar pagamento |
| `src/pages/admin/AdminFinancialPage.tsx` | Auto-atualizar subscription no "Marcar como pago" |

### Componentes Assistencia
| Arquivo | Mudanca |
|---------|---------|
| `src/pages/MessagesPage.tsx` (NOVO) | Caixa de mensagens da assistencia |
| `src/components/layout/Sidebar.tsx` | Adicionar item "Mensagens" com badge de nao lidas |
| `src/components/layout/MobileBottomNav.tsx` | Adicionar icone de mensagens |
| `src/pages/SubscriptionExpiredPage.tsx` | Mostrar mensagens do admin |

### Rotas
| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Adicionar rota `/mensagens`, ajustar `ProtectedRoute` para checar `expires_at` |

---

## Fluxo Completo

```text
1. Assistencia se cadastra → status "aguardando" → tela expirada
2. Admin ativa no painel → define plano + datas → assistencia acessa sistema
3. Admin registra pagamento → subscription atualizada automaticamente (datas + status)
4. Subscription vence → cron expira automaticamente → assistencia ve tela expirada
5. Admin envia mensagem → assistencia recebe em tempo real → pode responder
6. Admin ve confirmacao de leitura das mensagens
```

