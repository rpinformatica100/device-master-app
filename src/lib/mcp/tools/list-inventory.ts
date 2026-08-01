import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_inventory",
  title: "Consultar estoque",
  description:
    "Lista os produtos/peças do estoque do usuário autenticado, com opção de mostrar apenas itens com estoque baixo (abaixo do mínimo).",
  inputSchema: {
    search: z.string().optional().describe("Busca por nome ou SKU do produto."),
    low_stock_only: z.boolean().optional().describe("Se verdadeiro, retorna apenas itens com estoque igual ou abaixo do mínimo."),
    limit: z.number().int().optional().describe("Máximo de produtos retornados (padrão 50, máximo 200)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, low_stock_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("products")
      .select("id, name, sku, category, stock, min_stock, cost_price, sale_price")
      .order("name", { ascending: true })
      .limit(Math.min(Math.max(limit ?? 50, 1), 200));

    if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const rows = (data ?? []).filter((p) => (low_stock_only ? Number(p.stock) <= Number(p.min_stock) : true));
    return {
      content: [{ type: "text", text: JSON.stringify(rows) }],
      structuredContent: { products: rows },
    };
  },
});
