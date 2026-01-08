import { FinancialTransaction } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExportData {
  transactions: FinancialTransaction[];
  startDate?: Date;
  endDate?: Date;
  summary: {
    totalReceitas: number;
    totalDespesas: number;
    totalCustos: number;
    totalLucro: number;
    saldo: number;
  };
}

export function exportToExcel(data: ExportData) {
  const { transactions, startDate, endDate, summary } = data;

  // Create CSV content
  const headers = [
    "Data",
    "Descrição",
    "Tipo",
    "Categoria",
    "Status",
    "Custo",
    "Receita",
    "Lucro",
    "Forma de Pagamento",
  ];

  const rows = transactions.map((t) => [
    format(new Date(t.created_at), "dd/MM/yyyy", { locale: ptBR }),
    `"${t.description.replace(/"/g, '""')}"`,
    t.type,
    t.category || "-",
    t.status,
    Number(t.cost_amount).toFixed(2).replace(".", ","),
    Number(t.amount).toFixed(2).replace(".", ","),
    Number(t.profit_amount).toFixed(2).replace(".", ","),
    t.payment_method || "-",
  ]);

  // Add summary rows
  rows.push([]);
  rows.push(["RESUMO DO PERÍODO"]);
  if (startDate && endDate) {
    rows.push([
      `Período: ${format(startDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`,
    ]);
  }
  rows.push([]);
  rows.push(["Total Receitas", "", "", "", "", "", summary.totalReceitas.toFixed(2).replace(".", ",")]);
  rows.push(["Total Despesas", "", "", "", "", "", summary.totalDespesas.toFixed(2).replace(".", ",")]);
  rows.push(["Total Custos", "", "", "", "", summary.totalCustos.toFixed(2).replace(".", ",")]);
  rows.push(["Total Lucro", "", "", "", "", "", "", summary.totalLucro.toFixed(2).replace(".", ",")]);
  rows.push(["Saldo Final", "", "", "", "", "", summary.saldo.toFixed(2).replace(".", ",")]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\n");

  // Add BOM for Excel to recognize UTF-8
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // Download file
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const fileName = `relatorio_financeiro_${format(new Date(), "yyyy-MM-dd_HHmm")}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(data: ExportData) {
  const { transactions, startDate, endDate, summary } = data;

  const periodText =
    startDate && endDate
      ? `${format(startDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`
      : "Todas as transações";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório Financeiro</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          font-size: 11px; 
          color: #333;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
        }
        .header h1 { font-size: 20px; margin-bottom: 5px; }
        .header p { color: #666; font-size: 12px; }
        .summary {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 25px;
        }
        .summary-card {
          flex: 1;
          min-width: 150px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 6px;
          text-align: center;
        }
        .summary-card h3 { font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase; }
        .summary-card p { font-size: 16px; font-weight: bold; }
        .summary-card.positive p { color: #16a34a; }
        .summary-card.negative p { color: #dc2626; }
        .summary-card.neutral p { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { 
          padding: 8px 6px; 
          text-align: left; 
          border-bottom: 1px solid #ddd; 
          font-size: 10px;
        }
        th { 
          background: #f0f0f0; 
          font-weight: 600;
          text-transform: uppercase;
          font-size: 9px;
        }
        tr:nth-child(even) { background: #fafafa; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 500;
        }
        .badge-receita { background: #dcfce7; color: #166534; }
        .badge-despesa { background: #fee2e2; color: #991b1b; }
        .badge-pago { background: #dcfce7; color: #166534; }
        .badge-pendente { background: #fef3c7; color: #92400e; }
        .positive { color: #16a34a; }
        .negative { color: #dc2626; }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          font-size: 10px;
          color: #666;
          text-align: center;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório Financeiro</h1>
        <p>Período: ${periodText}</p>
        <p>Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      </div>

      <div class="summary">
        <div class="summary-card positive">
          <h3>Total Receitas</h3>
          <p>R$ ${summary.totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div class="summary-card negative">
          <h3>Total Despesas</h3>
          <p>R$ ${summary.totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div class="summary-card">
          <h3>Total Custos</h3>
          <p>R$ ${summary.totalCustos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div class="summary-card neutral">
          <h3>Lucro Líquido</h3>
          <p>R$ ${summary.totalLucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div class="summary-card ${summary.saldo >= 0 ? "positive" : "negative"}">
          <h3>Saldo Final</h3>
          <p>R$ ${summary.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th class="text-center">Tipo</th>
            <th class="text-center">Status</th>
            <th class="text-right">Custo</th>
            <th class="text-right">Receita</th>
            <th class="text-right">Lucro</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .map(
              (t) => `
            <tr>
              <td>${format(new Date(t.created_at), "dd/MM/yyyy", { locale: ptBR })}</td>
              <td>${t.description}</td>
              <td class="text-center">
                <span class="badge badge-${t.type}">${t.type}</span>
              </td>
              <td class="text-center">
                <span class="badge badge-${t.status}">${t.status}</span>
              </td>
              <td class="text-right">R$ ${Number(t.cost_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
              <td class="text-right ${t.type === "receita" ? "positive" : "negative"}">
                ${t.type === "receita" ? "+" : "-"}R$ ${Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </td>
              <td class="text-right positive">R$ ${Number(t.profit_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="footer">
        <p>Total de ${transactions.length} transações no período</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
