
# Sistema de Compra e Venda de Equipamentos Seminovos

## Visão Geral

Criar um módulo completo para gerenciar o ciclo de vida de equipamentos seminovos, desde a aquisição (compra de terceiros ou retirada de uma OS), passando por eventuais reparos, até a venda final. O sistema rastreará todo o histórico, incluindo integração completa com o módulo financeiro.

---

## Funcionalidades Principais

### 1. Catálogo de Equipamentos Seminovos
- Registro detalhado de cada equipamento (marca, modelo, número de série, IMEI, condição)
- Fotos do equipamento
- Status do equipamento: Disponível, Em Reparo, Reservado, Vendido
- Origem: Comprado de terceiros ou Retirado de OS (com referência à OS original)

### 2. Registro de Compra (Aquisição)
- De quem foi comprado (cliente/fornecedor existente ou novo)
- Valor de compra
- Data da aquisição
- Documentação/notas (opcional)
- Criação automática de transação financeira (despesa)

### 3. Histórico de Reparos
- Vinculação com OS de reparo interno (opcional)
- Registro de custos de reparo (peças, mão de obra)
- Atualização automática do custo total do equipamento

### 4. Registro de Venda
- Para quem foi vendido (cliente)
- Valor de venda
- Forma de pagamento
- Criação automática de transação financeira (receita)
- Cálculo automático de lucro (considerando compra + reparos)

### 5. Dashboard de Equipamentos
- Visão geral do estoque de seminovos
- Equipamentos disponíveis vs vendidos
- Margem de lucro por equipamento
- Tempo médio em estoque

---

## Modelagem de Dados (Novas Tabelas)

### Tabela: `used_equipment`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| user_id | uuid | Dono do registro (multi-tenant) |
| code | text | Código interno (EQ-0001) |
| name | text | Nome/descrição do equipamento |
| brand | text | Marca |
| model | text | Modelo |
| serial_number | text | Número de série |
| imei | text | IMEI (para celulares) |
| category | text | Categoria (smartphone, notebook, etc) |
| condition | text | Estado (excelente, bom, regular, defeito) |
| status | text | Status (disponivel, em_reparo, reservado, vendido) |
| purchase_price | numeric | Valor de compra |
| repair_cost | numeric | Custo total de reparos (atualizado automaticamente) |
| total_cost | numeric | Custo total (compra + reparos) |
| sale_price | numeric | Valor de venda (quando vendido) |
| profit | numeric | Lucro (venda - custo total) |
| notes | text | Observações |
| photos | jsonb | URLs das fotos |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data de atualização |
| sold_at | timestamp | Data da venda |

### Tabela: `used_equipment_purchases`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| user_id | uuid | Dono do registro |
| equipment_id | uuid | Referência ao equipamento |
| client_id | uuid | De quem comprou (cliente/fornecedor) |
| source_order_id | uuid | OS de origem (se retirado de OS) |
| source_type | text | Tipo de origem: 'compra' ou 'os' |
| amount | numeric | Valor pago |
| financial_transaction_id | uuid | Transação financeira vinculada |
| notes | text | Observações |
| created_at | timestamp | Data da compra |

### Tabela: `used_equipment_repairs`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| user_id | uuid | Dono do registro |
| equipment_id | uuid | Referência ao equipamento |
| order_id | uuid | OS de reparo (opcional) |
| description | text | Descrição do reparo |
| parts_cost | numeric | Custo de peças |
| labor_cost | numeric | Custo de mão de obra |
| total_cost | numeric | Custo total do reparo |
| completed_at | timestamp | Data de conclusão |
| notes | text | Observações |
| created_at | timestamp | Data de criação |

### Tabela: `used_equipment_sales`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| user_id | uuid | Dono do registro |
| equipment_id | uuid | Referência ao equipamento |
| client_id | uuid | Para quem vendeu |
| amount | numeric | Valor de venda |
| payment_method | text | Forma de pagamento |
| financial_transaction_id | uuid | Transação financeira vinculada |
| warranty_days | integer | Dias de garantia |
| notes | text | Observações |
| created_at | timestamp | Data da venda |

---

## Componentes Frontend

### Nova Página: `/seminovos`
- Listagem de equipamentos com filtros (status, categoria)
- Cards responsivos para mobile
- Tabela para desktop
- Botões de ação rápida

### Dialogs/Formulários:
1. **EquipmentFormDialog** - Cadastro/edição de equipamento
2. **PurchaseFormDialog** - Registro de compra
3. **RepairFormDialog** - Registro de reparo
4. **SaleFormDialog** - Registro de venda
5. **EquipmentViewDialog** - Visualização do histórico completo

### Cards:
- **UsedEquipmentCard** - Card mobile para listar equipamentos
- **EquipmentTimelineCard** - Timeline do histórico

---

## Integrações

### Com Financeiro
- Compra: Cria transação tipo "despesa", categoria "compra_seminovo"
- Reparo: Atualiza custo do equipamento (pode criar OS interna)
- Venda: Cria transação tipo "receita", categoria "venda_seminovo"

### Com Clientes
- Fornecedor de quem comprou
- Cliente para quem vendeu

### Com Ordens de Serviço
- Equipamento pode vir de uma OS (cliente abandonou/trocou)
- Reparo pode gerar uma OS interna

---

## Fluxo de Navegação

Adicionar ao menu lateral e bottom nav:
- Ícone: `Smartphone` ou `RefreshCcw`
- Label: "Seminovos"
- Path: `/seminovos`

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `supabase/migrations/[timestamp]_used_equipment.sql` | Tabelas e RLS policies |
| `src/pages/UsedEquipmentPage.tsx` | Página principal |
| `src/hooks/useUsedEquipment.ts` | Hook de gerenciamento |
| `src/components/used-equipment/EquipmentFormDialog.tsx` | Form de equipamento |
| `src/components/used-equipment/PurchaseFormDialog.tsx` | Form de compra |
| `src/components/used-equipment/RepairFormDialog.tsx` | Form de reparo |
| `src/components/used-equipment/SaleFormDialog.tsx` | Form de venda |
| `src/components/used-equipment/EquipmentViewDialog.tsx` | View do histórico |
| `src/components/shared/UsedEquipmentCard.tsx` | Card mobile |
| `src/types/usedEquipment.ts` | Types TypeScript |

---

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/App.tsx` | Adicionar rota /seminovos |
| `src/components/layout/Sidebar.tsx` | Adicionar item no menu |
| `src/components/layout/MobileBottomNav.tsx` | Avaliar adição ao nav |
| `src/components/layout/MobileHeader.tsx` | Adicionar ao dropdown |
| `src/types/database.ts` | Adicionar interfaces |

---

## Segurança (RLS Policies)

Todas as tabelas terão:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

Garantindo isolamento total de dados por usuário.

---

## Benefícios do Sistema

1. **Rastreabilidade Completa** - Saber exatamente de onde veio e para onde foi cada equipamento
2. **Controle Financeiro** - Custos e lucros calculados automaticamente
3. **Histórico de Reparos** - Saber quanto foi investido em cada equipamento
4. **Integração com OS** - Aproveitar a estrutura existente para reparos
5. **Mobile-First** - Interface otimizada conforme padrões já implementados
