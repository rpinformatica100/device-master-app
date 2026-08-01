import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "financial_summary",
  title: "Resumo financeiro",
  description:
    "Resume receitas, despesas, custos e lucro das transações financeiras do usuário autenticado em um período (datas ISO YYYY-MM-DD).",
  inputSchema: {
    start_date: z.string().optional().describe("Data inicial no formato YYYY-MM-DD."),
    end_date: z.string().optional().describe("Data final no formato YYYY-MM-DD."),
    status: z.string().optional().describe("Filtra por status da transação, por exemplo 'pago' ou 'pendente'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ start_date, end_date, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("financial_transactions")
      .select("type, amount, cost_amount, profit_amount, status, created_at")
      .limit(5000);

    if (start_date) query = query.gte("created_at", `${start_date}T00:00:00Z`);
    if (end_date) query = query.lte("created_at", `${end_date}T23:59:59Z`);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const rows = data ?? [];
    const sum = (pred: (r: (typeof rows)[number]) => boolean, key: "amount" | "cost_amount" | "profit_amount") =>
      rows.filter(pred).reduce((acc, r) => acc + Number(r[key] ?? 0), 0);

    const summary = {
      transactions: rows.length,
      revenue: sum((r) => r.type === "receita", "amount"),
      expenses: sum((r) => r.type === "despesa", "amount"),
      costs: sum(() => true, "cost_amount"),
      profit: sum(() => true, "profit_amount"),
      period: { start_date: start_date ?? null, end_date: end_date ?? null },
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary) }],
      structuredContent: summary,
    };
  },
});
