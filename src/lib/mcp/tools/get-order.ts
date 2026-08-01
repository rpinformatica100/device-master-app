import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_order",
  title: "Detalhar ordem de serviço",
  description:
    "Retorna os detalhes completos de uma ordem de serviço (dados do equipamento, cliente e itens de reparo) pelo número da OS ou pelo id.",
  inputSchema: {
    os_number: z.string().optional().describe("Número da OS, por exemplo OS-0012-2026."),
    id: z.string().optional().describe("Identificador (uuid) da ordem de serviço."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ os_number, id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    if (!os_number && !id) {
      return { content: [{ type: "text", text: "Informe os_number ou id." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("orders")
      .select(
        "id, os_number, device, issue, status, priority, category, serial_number, accessories, internal_notes, total_sale, total_cost, total_profit, created_at, completed_at, clients(id, name, phone, email), repair_items(*)",
      )
      .limit(1);
    query = id ? query.eq("id", id) : query.eq("os_number", os_number!);

    const { data, error } = await query.maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Ordem de serviço não encontrada." }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { order: data },
    };
  },
});
