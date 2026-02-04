
# Plano de Correções Urgentes do Sistema

## Resumo Executivo

Este plano aborda todas as correções urgentes solicitadas, organizadas por menu/seção do sistema. As alterações focam em melhorar a experiência do usuário, padronizar fontes, corrigir bugs e adicionar funcionalidades faltantes.

---

## 1. ORDEM DE SERVICO (OS)

### 1.1 Botao "Finalizar OS" com Cadastro de Pagamento

**Problema:** Nao existe um botao direto para finalizar OS e registrar pagamento, incluindo data real.

**Solucao:**
- Adicionar botao "Finalizar OS" no `OrderViewDialog.tsx` para ordens em status "em_andamento", "aguardando" ou "aguardando_peca"
- Ao clicar, abrir dialog de pagamento (`PaymentDialog`) com campo de data do pagamento
- Atualizar status para "concluido" e criar transacao financeira com data correta

**Arquivos a modificar:**
- `src/components/orders/OrderViewDialog.tsx` - Adicionar botao e logica
- `src/components/financial/PaymentDialog.tsx` - Adicionar campo de data do pagamento

### 1.2 OS sem Custo nao Finalizando Corretamente

**Problema:** Ordens sem custo (total = 0) nao estao finalizando corretamente no menu e financeiro.

**Solucao:**
- Modificar `useOrders.ts` para permitir criar transacao financeira mesmo com valor 0
- Ajustar condicao `if (totals.sale > 0)` no `OrderFormDialog.tsx` para permitir finalizar OS sem valor

**Arquivos a modificar:**
- `src/hooks/useOrders.ts` - Remover restricao de valor > 0
- `src/components/orders/OrderFormDialog.tsx` - Ajustar logica de finalizacao

### 1.3 Rolagem Horizontal na Tabela (1366x768)

**Problema:** Tabela de OS tem rolagem horizontal em resolucoes como 1366x768.

**Solucao:**
- Reduzir padding das celulas de `p-4` para `p-2 sm:p-3`
- Reduzir largura das colunas Defeito e Acoes
- Usar `text-xs` em todas as celulas
- Ocultar colunas menos importantes em telas menores (Lucro, Prioridade)

**Arquivos a modificar:**
- `src/pages/OrdersPage.tsx` - Otimizar tabela desktop

### 1.4 Padronizar Tamanho de Fonte

**Problema:** Fontes inconsistentes entre tabelas e formularios.

**Solucao:**
- Definir padrao de fontes: `text-xs` para tabelas, `text-sm` para formularios
- Ajustar todos os componentes relacionados

**Arquivos a modificar:**
- `src/pages/OrdersPage.tsx`
- `src/components/orders/OrderFormDialog.tsx`
- `src/components/orders/OrderViewDialog.tsx`

### 1.5 Melhorar Atualizacao apos CRUD

**Problema:** Atualizacoes lentas apos criar/editar informacoes.

**Solucao:**
- Ja existe atualizacao imediata no `useOrders.ts`
- Verificar se `setOrders` esta sendo chamado corretamente
- Adicionar refresh da lista de pagamentos apos atualizar status

**Arquivos a modificar:**
- `src/pages/OrdersPage.tsx` - Melhorar refresh do estado de pagamentos

### 1.6 Checklist Persistindo na Impressao

**Problema:** Checklist permanece na impressao mesmo apos excluido/editado.

**Solucao:**
- Ao mudar categoria para nao-mobile, limpar checklist do `category_specific_fields`
- Na impressao, verificar se checklist existe E se categoria e mobile
- Adicionar botao para limpar checklist no form

**Arquivos a modificar:**
- `src/components/orders/OrderFormDialog.tsx` - Limpar checklist ao mudar categoria
- `src/components/orders/OrderViewDialog.tsx` - Verificar categoria antes de imprimir checklist

---

## 2. CLIENTES

### 2.1 Clientes Clicaveis com Dialog de Detalhes

**Problema:** Clientes nao sao clicaveis para ver dados completos.

**Solucao:**
- Criar `ClientViewDialog.tsx` para exibir dados completos do cliente
- Adicionar botao "Ver" no `ClientCard.tsx`
- Tornar card inteiro clicavel para abrir detalhes

**Arquivos a criar:**
- `src/components/clients/ClientViewDialog.tsx`

**Arquivos a modificar:**
- `src/components/shared/ClientCard.tsx` - Adicionar onClick e botao Ver
- `src/pages/ClientsPage.tsx` - Adicionar estado e logica do dialog

### 2.2 Historico de Compra/Venda de Equipamentos e OS

**Problema:** Falta historico de transacoes por cliente.

**Solucao:**
- No `ClientViewDialog.tsx`, criar tabs:
  - "Dados" (informacoes do cliente)
  - "Ordens de Servico" (lista de OS do cliente)
  - "Seminovos" (equipamentos comprados/vendidos)
- Cada item clicavel para navegar ao detalhe

**Arquivos a modificar:**
- `src/components/clients/ClientViewDialog.tsx` - Adicionar tabs com historico

---

## 3. FINANCEIRO

### 3.1 Melhorar Detalhes no Mapa de Custo

**Problema:** Mapa de custo com detalhes insuficientes.

**Solucao:**
- Adicionar mais colunas: OS, Cliente, Data
- Melhorar formatacao do lucro por item
- Adicionar link clicavel para a OS

**Arquivos a modificar:**
- `src/components/financial/CostBreakdownSection.tsx`

### 3.2 Padronizar Fonte nos Formularios

**Problema:** Fonte do formulario de detalhes e Nova Despesa inconsistente.

**Solucao:**
- Aplicar `text-xs` nos labels e `text-sm` nos inputs
- Reduzir espacamento dos dialogs

**Arquivos a modificar:**
- `src/components/financial/TransactionFormDialog.tsx`
- `src/pages/FinancialPage.tsx` (dialog de detalhes)

### 3.3 Verificar Calculos e Consistencia

**Problema:** Possivel inconsistencia de dados ou calculos.

**Solucao:**
- Revisar `useFinancial.ts` para garantir calculos corretos
- Verificar se `cost_amount` e `profit_amount` estao sendo calculados corretamente
- Garantir que OS concluidas sem pagamento aparecem como "pendente"
- Sincronizar dados do Dashboard com Financeiro

**Arquivos a verificar/modificar:**
- `src/hooks/useFinancial.ts`
- `src/hooks/useDashboardStats.ts`

---

## 4. SEMINOVOS

### 4.1 Botoes CRUD no Menu Principal e Detalhes

**Problema:** Faltam botoes de acao no menu principal.

**Solucao:**
- Adicionar botoes "Editar", "Reparo", "Vender", "Excluir" no menu principal alem do card
- No `UsedEquipmentCard.tsx`, melhorar visibilidade dos botoes de acao

**Arquivos a modificar:**
- `src/pages/UsedEquipmentPage.tsx` - Melhorar acoes
- `src/components/shared/UsedEquipmentCard.tsx` - Botoes mais visiveis

### 4.2 Checklist para Compra e Venda de Seminovo

**Problema:** Falta checklist similar ao de OS para compra/venda de seminovo.

**Solucao:**
- Reutilizar componente `MobileChecklist.tsx`
- Adicionar campo `checklist` na tabela `used_equipment` (como JSON)
- Mostrar checklist no recibo de compra/venda quando preenchido
- Remover do recibo quando excluido

**Arquivos a modificar:**
- Criar migracao para adicionar campo `checklist` em `used_equipment`
- `src/components/used-equipment/EquipmentFormDialog.tsx` - Adicionar checklist
- `src/pages/EquipmentReceiptPage.tsx` - Exibir checklist quando presente
- `src/pages/EquipmentDetailPage.tsx` - Mostrar/editar checklist

### 4.3 Nao Mostrar Custos no Recibo do Cliente

**Problema:** Recibo mostra custos que nao devem ser vistos pelo cliente.

**Solucao:**
- Separar parametros `showDetails` para uso interno vs recibo para cliente
- Por padrao, recibo de venda nao mostra custos, apenas valor de venda
- Adicionar opcao "Recibo Cliente" vs "Recibo Interno"

**Arquivos a modificar:**
- `src/pages/EquipmentReceiptPage.tsx` - Separar modos de exibicao
- `src/pages/EquipmentDetailPage.tsx` - Adicionar opcao de recibo para cliente
- `src/components/shared/UsedEquipmentCard.tsx` - Diferenciar tipos de recibo

---

## 5. PESSOAL

### 5.1 Ajustar Fonte para Padrao Menor

**Problema:** Fonte maior que o padrao do sistema.

**Solucao:**
- Aplicar `text-xs` e `text-sm` consistentemente
- Reduzir espacamento dos cards e tabelas

**Arquivos a modificar:**
- `src/pages/PersonalFinancePage.tsx`
- `src/pages/ProLaborePage.tsx`
- `src/components/personal/PersonalTransactionDialog.tsx`
- `src/components/shared/PersonalTransactionCard.tsx`

---

## Detalhes Tecnicos

### Padrao de Fonte do Sistema

| Elemento | Classe Tailwind |
|----------|-----------------|
| Titulos de pagina | `text-xl sm:text-2xl` |
| Subtitulos | `text-sm` |
| Labels de form | `text-xs` |
| Inputs | `text-sm` |
| Celulas de tabela | `text-xs` |
| Badges | `text-[10px]` |
| Cards - titulo | `text-xs font-medium` |
| Cards - detalhes | `text-[10px]` |

### Prioridade de Implementacao

1. **Critica (Bugs):**
   - OS sem custo nao finalizando
   - Checklist persistindo na impressao

2. **Alta (UX):**
   - Botao Finalizar OS
   - Clientes clicaveis com historico
   - Custos nao aparecerem no recibo do cliente

3. **Media (Visual):**
   - Padronizacao de fontes
   - Rolagem horizontal da tabela
   - Detalhes do mapa de custo

4. **Baixa (Melhorias):**
   - Checklist em Seminovos
   - Botoes CRUD mais visiveis

### Estimativa de Arquivos

**Novos arquivos:**
- `src/components/clients/ClientViewDialog.tsx`

**Arquivos principais a modificar:**
- `src/pages/OrdersPage.tsx`
- `src/pages/ClientsPage.tsx`
- `src/pages/FinancialPage.tsx`
- `src/pages/UsedEquipmentPage.tsx`
- `src/pages/PersonalFinancePage.tsx`
- `src/pages/EquipmentReceiptPage.tsx`
- `src/pages/EquipmentDetailPage.tsx`
- `src/components/orders/OrderFormDialog.tsx`
- `src/components/orders/OrderViewDialog.tsx`
- `src/components/shared/ClientCard.tsx`
- `src/components/shared/UsedEquipmentCard.tsx`
- `src/components/financial/TransactionFormDialog.tsx`
- `src/components/financial/CostBreakdownSection.tsx`
- `src/components/financial/PaymentDialog.tsx`
- `src/components/used-equipment/EquipmentFormDialog.tsx`
- `src/hooks/useOrders.ts`

**Migracao de banco:**
- Adicionar campo `checklist` (jsonb) em `used_equipment`

