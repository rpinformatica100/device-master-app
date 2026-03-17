

# Auditoria Completa: Micro-Fluxos do Sistema TechOS

## Metodologia
Analisei cada fluxo do sistema comparando com melhores praticas de SaaS profissional. Classifico cada item como: **OK** (funciona bem), **PARCIAL** (funciona mas tem gaps), ou **PROBLEMA** (precisa correcao).

---

## 1. FLUXO DE CADASTRO / ONBOARDING

**Status: PARCIAL**

| O que temos | Problema | Melhor pratica |
|---|---|---|
| Signup cria `company_settings` e subscription "aguardando" via trigger | Apos signup, usuario e redirecionado para `/dashboard` (linha 104 AuthPage) antes de confirmar email | Redirecionar para tela "Verifique seu email" em vez de /dashboard |
| Trigger `handle_new_user_role_and_subscription` cria subscription automaticamente | Se email nao for confirmado, usuario pode ficar preso no loading | Mostrar pagina intermediaria clara |
| Campos opcionais (telefone, CNPJ) coletados no signup | Nao ha validacao de CNPJ/telefone no backend | Validacao server-side via trigger ou edge function |

**Acoes recomendadas:**
- Criar pagina "Confirme seu email" pos-signup
- Nao redirecionar para /dashboard antes da confirmacao

---

## 2. FLUXO DE LOGIN / ROTEAMENTO

**Status: OK (apos fix do loop)**

| O que temos | Status |
|---|---|
| Login com validacao Zod | OK |
| Redirecionamento admin → /admin, usuario → /dashboard | OK |
| Loading state sem loop infinito | OK (corrigido) |
| ProtectedRoute verifica status + expires_at | OK |

**Problema residual:** AuthPage tem `useEffect` que redireciona baseado em `user` + `isAdmin`, mas nao aguarda `subscriptionStatus` carregar. Um usuario expirado pode ver brevemente o dashboard antes de ser redirecionado para `/assinatura-expirada`.

---

## 3. FLUXO DE ASSINATURA / BLOQUEIO

**Status: PARCIAL**

| O que temos | Problema |
|---|---|
| ProtectedRoute checa `subscriptionStatus` | Usuarios sem subscription (null) passam pelo check — nao sao bloqueados |
| Cron edge function expira contas | Edge function existe mas cron scheduling nao esta configurado no config.toml |
| Admin pode ativar/suspender/expirar | Quick actions so mudam state local, nao salvam automaticamente (usuario precisa clicar "Salvar") — pode confundir |

**Problemas criticos:**
- `ProtectedRoute` (App.tsx linha 52): se `subscriptionStatus` e `null` (usuario novo sem subscription), o usuario **passa** pelo check e acessa o sistema. Deveria bloquear.
- A edge function `check-expired-subscriptions` existe mas nao tem cron schedule configurado — nunca roda automaticamente.

**Acoes recomendadas:**
- Tratar `subscriptionStatus === null` como bloqueado no ProtectedRoute
- Configurar cron no config.toml ou via pg_cron

---

## 4. FLUXO DE PAGAMENTO → ATIVACAO

**Status: PARCIAL**

| O que temos | Problema |
|---|---|
| PaymentDialog auto-ativa subscription ao registrar "pago" | Calculo de expires_at sempre usa `now()` como base, nao a data de expiracao anterior |
| AdminFinancialPage "Marcar como pago" tambem auto-ativa | Duplicacao de logica entre PaymentDialog e AdminFinancialPage |
| SubscriptionDialog com calendar pickers | Funciona corretamente apos refatoracao |

**Problema de logica de renovacao:**
Ao renovar, o sistema calcula `expires_at = now + 30 dias`. Se a assinatura ainda nao venceu (usuario paga antecipado), ele **perde** os dias restantes. Profissionalmente, deveria ser `max(expires_at, now) + 30 dias`.

**Acoes recomendadas:**
- Logica de renovacao: `base = max(current_expires_at, now)` + dias do plano
- Extrair logica de ativacao para funcao reutilizavel (DRY)

---

## 5. FLUXO DE MENSAGENS (Admin ↔ Assistencia)

**Status: PARCIAL**

| O que temos | Problema |
|---|---|
| Admin envia mensagens individuais ou broadcast | OK |
| Assistencia ve mensagens + pode responder | OK |
| Realtime via Supabase channels | OK |
| Badge de nao lidas na Sidebar | OK |
| Confirmacao de leitura (check duplo) | Leitura so e marcada quando usuario expande a mensagem — nao ao abrir a pagina |

**Problemas encontrados:**
- Admin reply no `AdminNotificationsPage` envia mensagem sem `parent_message_id` (linha 50-53) — nao vincula a resposta a conversa original. Envia como nova mensagem.
- `useSendReply` do usuario define `recipient_id: null` — admin so ve a reply buscando por `parent_message_id`, mas a query de `useAdminMessages` filtra `parent_message_id IS NULL`, entao replies aparecem corretamente como threads.
- Mensagens globais (broadcast) nao podem ser respondidas pelo design do RLS — `Users can reply` exige `parent_message_id IS NOT NULL` e `sender_id = auth.uid()`, o que esta correto.
- **Bug:** No `AdminMessageItem`, a resposta do admin (linha 49-53) usa `useAdminSendMessage` que nao define `parent_message_id`. A resposta vai como mensagem nova, nao como reply na thread.

**Acoes recomendadas:**
- Corrigir reply do admin para incluir `parent_message_id`
- Adicionar toast notification quando mensagem nova chega (nao so badge)

---

## 6. FLUXO DE ORDENS DE SERVICO

**Status: OK**

| O que temos | Status |
|---|---|
| CRUD completo com items (produtos/servicos) | OK |
| Lifecycle: pendente → em andamento → concluido → entregue | OK |
| Finalizar OS com pagamento | OK |
| Reversao de status restaura estoque | OK |
| OS number auto-gerado com ano | OK |
| Impressao de recibo e orcamento | OK |

Fluxo solido e bem implementado.

---

## 7. FLUXO FINANCEIRO

**Status: OK**

| O que temos | Status |
|---|---|
| Transacoes vinculadas a OS | OK |
| Dashboard sincronizado com pagina financeira | OK |
| Filtros por periodo/status/tipo | OK |
| Pro-labore / retiradas pessoais | OK |

---

## 8. ADMIN DASHBOARD

**Status: PARCIAL**

| O que temos | Problema |
|---|---|
| Stats de usuarios/receita | OK |
| Ultimos cadastros | OK |
| Resumo financeiro do mes | Filtro por `reference_month` — se admin nao registrou pagamento com mes referencia, nao aparece |

**Faltando para profissional:**
- Grafico de evolucao de receita (ultimos 6 meses)
- Lista de assistencias proximas do vencimento (alerta proativo)
- Taxa de churn / conversao (aguardando → ativo)

---

## 9. ADMIN LAYOUT / RESPONSIVIDADE

**Status: PROBLEMA**

| O que temos | Problema |
|---|---|
| AdminLayout com sidebar fixa de 256px | Nao e responsivo — sem menu mobile |
| Tabelas em AdminUsersPage e AdminFinancialPage | Nao tem scroll horizontal em mobile |
| "Voltar ao sistema" no admin | Admin tem acesso ao sistema de OS? Nao faz sentido — admin gerencia assistencias, nao usa OS |

**Acoes recomendadas:**
- Adicionar menu hamburger mobile ao AdminLayout
- Remover "Voltar ao sistema" (admin nao deveria acessar area de OS)
- Tornar tabelas scrollaveis em mobile

---

## 10. SEGURANCA

**Status: OK (com ressalva)**

| O que temos | Status |
|---|---|
| RLS em todas as tabelas | OK |
| Roles via `user_roles` table (nao no profile) | OK |
| `has_role()` SECURITY DEFINER | OK |
| Admin check via DB, nao localStorage | OK |

**Ressalva:** A subscription check no `useAuth` e client-side. Um usuario tecnico poderia manipular o estado React para bypassar o ProtectedRoute. Idealmente, as RLS policies das tabelas de dados (orders, clients, etc.) tambem deveriam checar subscription status, mas isso adicionaria complexidade significativa.

---

## RESUMO DE PRIORIDADES

| Prioridade | Item | Impacto |
|---|---|---|
| **CRITICA** | `subscriptionStatus === null` permite acesso | Usuarios novos acessam sistema sem ativacao |
| **CRITICA** | Reply do admin nao vincula `parent_message_id` | Conversas quebradas |
| **ALTA** | Renovacao antecipada perde dias restantes | Perda financeira para o cliente |
| **ALTA** | Cron de expiracao nao esta agendado | Contas nunca expiram automaticamente |
| **MEDIA** | AdminLayout nao responsivo | Inutilizavel em mobile |
| **MEDIA** | Pagina pos-signup redireciona para dashboard | UX confusa antes de confirmar email |
| **BAIXA** | Admin pode "Voltar ao sistema" (area de OS) | Confusao de papeis |
| **BAIXA** | Dashboard admin sem graficos de evolucao | Falta visao estrategica |

---

## Plano de Implementacao

### Fase 1 — Correcoes Criticas
1. **ProtectedRoute**: Tratar `subscriptionStatus === null` como bloqueado
2. **Admin reply bug**: Passar `parent_message_id` no reply do admin
3. **Logica de renovacao**: `max(current_expires_at, now) + dias`
4. **Extrair funcao** `activateSubscription()` reutilizavel

### Fase 2 — Melhorias Profissionais
5. **AdminLayout responsivo**: Menu hamburger mobile
6. **Pagina pos-signup**: "Verifique seu email" 
7. **Remover "Voltar ao sistema"** do admin
8. **Toast global** quando mensagem nova chega (qualquer pagina)

### Fase 3 — Dashboard Admin Avancado
9. **Alerta proativo**: Lista de assistencias prestes a vencer
10. **Grafico de receita** ultimos 6 meses

