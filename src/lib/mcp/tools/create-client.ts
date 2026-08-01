import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_client",
  title: "Cadastrar cliente",
  description: "Cadastra um novo cliente na assistência técnica do usuário autenticado.",
  inputSchema: {
    name: z.string().trim().min(1).describe("Nome completo ou razão social do cliente."),
    phone: z.string().optional().describe("Telefone/WhatsApp do cliente."),
    email: z.string().optional().describe("E-mail do cliente."),
    client_type: z.string().optional().describe("Tipo do cliente: 'pf' (pessoa física) ou 'pj' (pessoa jurídica)."),
    cpf: z.string().optional().describe("CPF, quando pessoa física."),
    cnpj: z.string().optional().describe("CNPJ, quando pessoa jurídica."),
    notes: z.string().optional().describe("Observações internas sobre o cliente."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("clients")
      .insert({ ...input, user_id: ctx.getUserId() })
      .select("id, name, phone, email, client_type")
      .single();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Cliente criado: ${JSON.stringify(data)}` }],
      structuredContent: { client: data },
    };
  },
});
