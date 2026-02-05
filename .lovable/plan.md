
# Plano de Melhorias do Sistema - Fase 2

## Resumo Executivo

Este plano aborda as novas solicitacoes, incluindo checklist nos Seminovos, novos planos de precos, dados adicionais no cadastro de usuarios, melhorias na OS e padronizacao de impressoes.

---

## 1. SEMINOVOS - Checklist no Formulario e Impressao

### 1.1 Adicionar Checklist ao Formulario de Cadastro

**Objetivo:** Reutilizar o componente `MobileChecklist.tsx` existente no cadastro de equipamentos seminovos.

**Solucao:**
- Adicionar botao "Checklist de Entrada" no `EquipmentFormDialog.tsx` (apenas para categorias smartphone/tablet)
- Armazenar checklist no campo `checklist` (jsonb) ja existente na tabela `used_equipment`
- Exibir resumo do checklist no formulario quando preenchido

**Arquivos a modificar:**
- `src/components/used-equipment/EquipmentFormDialog.tsx`
- `src/hooks/useUsedEquipment.ts` (salvar checklist)

### 1.2 Adicionar Checklist ao Formulario de Venda

**Objetivo:** Permitir atualizar checklist de saida no momento da venda.

**Solucao:**
- Adicionar botao "Checklist de Saida" no `SaleFormDialog.tsx`
- Opcionalmente criar campo separado `sale_checklist` ou reutilizar o existente

**Arquivos a modificar:**
- `src/components/used-equipment/SaleFormDialog.tsx`

### 1.3 Exibir Checklist na Impressao

**Objetivo:** Mostrar checklist no recibo quando preenchido.

**Solucao:**
- No `EquipmentReceiptPage.tsx`, buscar dados do checklist do equipamento
- Renderizar grid de checklist similar ao da OS
- Somente exibir se checklist tiver dados

**Arquivos a modificar:**
- `src/pages/EquipmentReceiptPage.tsx`
- `src/pages/EquipmentDetailPage.tsx` (exibir/editar checklist)

---

## 2. LANDING PAGE - Novos Planos de Precos

### 2.1 Reestruturar Planos

**De:**
- Starter (Gratis - 50 OS/mes)
- Profissional (R$ 49/mes)
- Empresarial (R$ 99/mes)

**Para:**
- Free (Gratis - COM restricoes: max 50 OS/mes, sem exportacao, sem relatorios avancados)
- Mensal (R$ X/mes - TUDO ilimitado)
- Anual (R$ Y/ano - TUDO ilimitado + desconto)

**Solucao:**
- Atualizar array `pricingPlans` em `LandingPage.tsx`
- Manter mesmas features para Mensal e Anual, diferenciando apenas o preco
- Free com restricoes claras listadas

**Arquivo a modificar:**
- `src/pages/LandingPage.tsx`

---

## 3. CADASTRO DE USUARIO - Mais Dados Pessoais e Empresa

### 3.1 Expandir Formulario de Cadastro

**Objetivo:** Coletar mais dados no signup para usar nas impressoes.

**Novos campos no signup:**
- Nome Completo (ja existe)
- Telefone (novo)
- Nome da Empresa (novo)
- CNPJ (opcional, novo)

**Solucao:**
- Expandir `AuthPage.tsx` com campos adicionais
- Salvar dados no `user_metadata` do Supabase Auth
- Criar/atualizar automaticamente `company_settings` apos cadastro

**Arquivos a modificar:**
- `src/pages/AuthPage.tsx`
- `src/hooks/useAuth.tsx` (passar metadata no signup)

### 3.2 Sincronizar com Company Settings

**Objetivo:** Ao cadastrar, criar registro em `company_settings` com dados iniciais.

**Solucao:**
- Apos signup bem-sucedido, criar registro em `company_settings`
- Usar trigger ou logica no frontend

**Arquivos a modificar:**
- `src/hooks/useAuth.tsx` ou criar migracao com trigger

### 3.3 Usar Dados em TODAS Impressoes

**Objetivo:** Garantir que OS e recibos usem dados de `company_settings`.

**Verificar:**
- `OrderViewDialog.tsx` (impressao de OS) - Adicionar cabecalho da empresa
- `EquipmentReceiptPage.tsx` (ja usa company settings)
- Qualquer outra impressao

**Arquivos a modificar:**
- `src/components/orders/OrderViewDialog.tsx` (adicionar useCompanySettings)

---

## 4. ORDEM DE SERVICO - Melhorias

### 4.1 Diminuir Fonte do Formulario

**Objetivo:** Padronizar fontes menores no formulario de OS.

**Solucao:**
- Aplicar `text-xs` em Labels
- Aplicar `text-sm` em Inputs
- Reduzir padding de campos

**Arquivo a modificar:**
- `src/components/orders/OrderFormDialog.tsx`

### 4.2 Menu Recolhivel para Caracteristicas do Equipamento

**Objetivo:** Organizar melhor os campos especificos de categoria.

**Solucao:**
- Usar componente `Collapsible` do Radix UI
- Adicionar campos Marca e Modelo fixos (nao apenas por categoria)
- Agrupar campos especificos (IMEI, cor, capacidade, etc) em secao recolhivel

**Arquivo a modificar:**
- `src/components/orders/OrderFormDialog.tsx`

### 4.3 Melhorar Atualizacao apos CRUD

**Problema:** Demora para aparecer nova OS na tabela.

**Solucao:**
- Ja existe atualizacao otimista no `useOrders.ts`
- Verificar se o `setOrders` esta sendo chamado corretamente
- Adicionar refresh forcado ou usar React Query com invalidation

**Arquivo a verificar:**
- `src/hooks/useOrders.ts`
- `src/pages/OrdersPage.tsx`

### 4.4 Melhorar Numeracao da OS com Ano

**De:** `OS-0009`
**Para:** `OS-0009-2026`

**Regra:** Nao zerar numero ao mudar de ano, apenas atualizar o ano.

**Solucao:**
- Criar nova migracao para alterar funcao `generate_next_os_number()`
- Formato: `OS-{numero_sequencial_global}-{ano_atual}`

**Nova logica:**
```sql
-- Pegar maior numero global (ignorando ano)
-- Incrementar
-- Adicionar ano atual
-- Resultado: OS-0042-2026
```

**Arquivo a criar:**
- Nova migracao SQL

---

## 5. PADRONIZACAO DE IMPRESSAO - OS e RECIBOS

### 5.1 Problema Atual

A impressao atual parece um "print do sistema" e nao um documento profissional.

### 5.2 Solucao: Criar Pagina de Impressao Dedicada para OS

**Objetivo:** Criar `/ordem-servico/{id}/imprimir` similar a `/seminovos/{id}/recibo`.

**Nova pagina:** `src/pages/OrderReceiptPage.tsx`

**Caracteristicas:**
- Layout A4 profissional
- Cabecalho com dados da empresa (de company_settings)
- Secoes bem definidas com bordas
- Tabela de itens/servicos formatada
- Checklist quando aplicavel
- Assinaturas
- Termos e condicoes
- Rodape com data de geracao

### 5.3 Melhorar Impressao de Seminovos

**Ajustes no `EquipmentReceiptPage.tsx`:**
- Adicionar checklist quando preenchido
- Melhorar layout para parecer mais profissional
- Verificar consistencia com OS

### 5.4 Padrao Visual de Impressao

| Elemento | Especificacao |
|----------|---------------|
| Tamanho | A4 (210mm x 297mm) |
| Margens | 10-15mm |
| Fonte base | 11px |
| Cabecalho | Logo/Nome empresa, CNPJ, endereco, telefone |
| Titulo | Tipo de documento centralizado |
| Secoes | Bordas, titulos em maiusculo |
| Tabelas | Bordas, cabecalho destacado |
| Assinaturas | Duas colunas no final |
| Rodape | Data de geracao |

---

## Detalhes Tecnicos

### Campos Adicionais no Signup

```typescript
interface SignupData {
  name: string;       // Ja existe
  email: string;      // Ja existe
  password: string;   // Ja existe
  phone?: string;     // Novo
  company_name?: string; // Novo
  cnpj?: string;      // Novo
}
```

### Nova Funcao SQL para OS Number

```sql
CREATE OR REPLACE FUNCTION public.generate_next_os_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_num INTEGER;
  next_num INTEGER;
  current_year TEXT;
  new_os TEXT;
BEGIN
  -- Lock table
  LOCK TABLE orders IN SHARE UPDATE EXCLUSIVE MODE;
  
  -- Get max number (extract just the number part, ignoring year suffix)
  SELECT COALESCE(
    MAX(CAST(
      SPLIT_PART(REGEXP_REPLACE(os_number, '^OS-', ''), '-', 1) 
      AS INTEGER
    )), 0
  ) INTO max_num
  FROM orders
  WHERE os_number ~ '^OS-[0-9]+';
  
  next_num := max_num + 1;
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Format: OS-0042-2026
  new_os := 'OS-' || LPAD(next_num::TEXT, 4, '0') || '-' || current_year;
  
  RETURN new_os;
END;
$$;
```

### Novos Planos de Precos

```typescript
const pricingPlans = [
  {
    name: "Free",
    price: "Gratis",
    period: "para sempre",
    description: "Para comecar",
    features: [
      "Ate 50 OS por mes",
      "Cadastro de clientes",
      "Controle de estoque basico",
      "Sem exportacao de dados",
    ],
    restrictions: true,
    popular: false,
    cta: "Comecar Gratis"
  },
  {
    name: "Mensal",
    price: "R$ 49",
    period: "/mes",
    description: "Tudo ilimitado",
    features: [
      "OS ilimitadas",
      "Clientes ilimitados",
      "Financeiro completo",
      "Relatorios avancados",
      "Exportacao de dados",
      "Suporte prioritario"
    ],
    restrictions: false,
    popular: true,
    cta: "Assinar Mensal"
  },
  {
    name: "Anual",
    price: "R$ 399",
    period: "/ano",
    description: "Economize 32%",
    features: [
      "Tudo do plano Mensal",
      "2 meses gratis",
      "Prioridade no suporte",
      "Treinamento incluso"
    ],
    restrictions: false,
    popular: false,
    cta: "Assinar Anual"
  }
];
```

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/OrderReceiptPage.tsx` | Pagina de impressao profissional de OS |
| Nova migracao SQL | Atualizar funcao de geracao de OS number |

## Arquivos a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `src/pages/LandingPage.tsx` | Novos planos de precos |
| `src/pages/AuthPage.tsx` | Campos adicionais no signup |
| `src/hooks/useAuth.tsx` | Passar metadata e criar company_settings |
| `src/components/orders/OrderFormDialog.tsx` | Fontes menores, menu recolhivel, campos Marca/Modelo |
| `src/components/orders/OrderViewDialog.tsx` | Usar company_settings na impressao |
| `src/components/used-equipment/EquipmentFormDialog.tsx` | Adicionar checklist |
| `src/components/used-equipment/SaleFormDialog.tsx` | Adicionar checklist de saida |
| `src/pages/EquipmentReceiptPage.tsx` | Exibir checklist na impressao |
| `src/pages/EquipmentDetailPage.tsx` | Exibir/editar checklist |
| `src/App.tsx` | Nova rota /ordem-servico/:id/imprimir |

---

## Ordem de Implementacao

1. **Prioridade Alta:**
   - Padronizacao de impressao (cria nova pagina OrderReceiptPage)
   - OS number com ano (migracao SQL)
   - Dados empresa nas impressoes

2. **Prioridade Media:**
   - Checklist em Seminovos
   - Formulario OS (fontes, campos, menu recolhivel)
   - Novos planos na Landing Page

3. **Prioridade Baixa:**
   - Dados adicionais no signup
   - Melhorias de atualizacao CRUD

