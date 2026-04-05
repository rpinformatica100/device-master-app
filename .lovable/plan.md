

# Plano: Otimizar Layout de Impressão da OS e Orçamento

## Problemas Atuais

1. **Cabeçalho ocupa muito espaço vertical** — empresa e dados empilhados no centro
2. **Seções Cliente e Equipamento ocupam blocos separados** — poderiam ser lado a lado
3. **PDF gerado muito grande** — `html2canvas` com `scale: 2` gera imagem PNG enorme
4. **Título do arquivo genérico** — falta nome da assistência no nome do PDF/impressão
5. **Campos longos sem truncamento** — textos grandes quebram o layout

## Mudanças Propostas

### 1. Cabeçalho compacto lado a lado (OS e Orçamento)
- Logo/nome da empresa à esquerda, dados de contato à direita, numa única faixa horizontal
- Número da OS/Orçamento e data na mesma linha abaixo do cabeçalho

### 2. Cliente + Equipamento lado a lado (OS)
- Grid de 2 colunas: cliente à esquerda, equipamento à direita
- Truncar campos longos (endereço, acessórios) com `overflow: hidden; text-overflow: ellipsis; max-width`

### 3. Reduzir tamanho do PDF
- Baixar `scale` de `2` para `1.5` no `html2canvas`
- Usar `image/jpeg` com qualidade 0.85 em vez de PNG
- Aplicar em ambas as páginas (OS e Orçamento)

### 4. Título personalizado do documento
- PDF: `OS-{numero}_{NomeEmpresa}.pdf` / `ORC-{numero}_{NomeEmpresa}.pdf`
- Impressão: usar `document.title` temporariamente durante `window.print()` para que o navegador use o título correto

### 5. Campos com limite de caracteres
- Truncar textos longos em campos do grid (max ~60 chars) com reticências
- Acessórios e endereço com `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`

## Arquivos Modificados

| Arquivo | Alteração |
|---|---|
| `src/pages/OrderReceiptPage.tsx` | Cabeçalho horizontal, cliente+equipamento lado a lado, PDF JPEG menor, título personalizado, truncamento |
| `src/pages/QuotePrintPage.tsx` | Cabeçalho horizontal, PDF JPEG menor, título personalizado |

