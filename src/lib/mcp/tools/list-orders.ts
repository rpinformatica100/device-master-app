import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_orders",
  title: "Listar ordens de serviço",
  description:
    "Lista as ordens de serviço (OS) da assistência técnica do usuário autenticado, com filtro opcional por status e busca por equipamento ou número da OS.",
  inputSchema: {
    status: z
      .string()
      .optional()
      .describe("Filtra por status da OS, por exemplo: aberta, em_andamento, concluida, cancelada."),
    search: z.string().optional().describe("Busca por número da OS, equipamento ou defeito relatado."),
    limit: z.number().int().optional().describe("Máximo de ordens retornadas (padrão 20, máximo 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("orders")
      .select(
        "id, os_number, device, issue, status, priority, category, total_sale, total_cost, total_profit, created_at, completed_at, clients(name, phone)",
      )
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 100));

    if (status) query = query.eq("status", status);
    if (search) query = query.or(`os_number.ilike.%${search}%,device.ilike.%${search}%,issue.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { orders: data ?? [] },
    };
  },
});
