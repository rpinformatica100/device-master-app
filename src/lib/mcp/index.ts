import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listOrdersTool from "./tools/list-orders";
import getOrderTool from "./tools/get-order";
import listClientsTool from "./tools/list-clients";
import createClientTool from "./tools/create-client";
import listInventoryTool from "./tools/list-inventory";
import financialSummaryTool from "./tools/financial-summary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "techcare-os",
  title: "TechCare OS",
  version: "0.1.0",
  instructions:
    "Ferramentas do TechCare OS, sistema de gestão para assistências técnicas. Use list_orders e get_order para consultar ordens de serviço, list_clients e create_client para clientes, list_inventory para estoque e peças, e financial_summary para receitas, despesas e lucro em um período. Todas as operações são feitas na conta do usuário autenticado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listOrdersTool, getOrderTool, listClientsTool, createClientTool, listInventoryTool, financialSummaryTool],
});
