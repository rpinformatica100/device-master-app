import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  openOrders: number;
  activeClients: number;
  stockItems: number;
  lowStockItems: number;
  monthlyRevenue: number;
  monthlyPendingRevenue: number;
  monthlyCost: number;
  monthlyProfit: number;
  revenueChange: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Open orders (not completed/delivered)
      const { count: openOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .not("status", "in", "(concluido,entregue)");

      // Active clients (with orders in last 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const { data: activeClientsData } = await supabase
        .from("orders")
        .select("client_id")
        .gte("created_at", threeMonthsAgo.toISOString())
        .not("client_id", "is", null);
      
      const uniqueClients = new Set(activeClientsData?.map(o => o.client_id) || []);

      // Stock items and low stock
      const { data: products } = await supabase
        .from("products")
        .select("stock, min_stock");
      
      const stockItems = products?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0;
      const lowStockItems = products?.filter(p => (p.stock || 0) < (p.min_stock || 0)).length || 0;

      // Monthly revenue from financial_transactions - separate paid vs pending
      const { data: currentMonthTransactions } = await supabase
        .from("financial_transactions")
        .select("amount, cost_amount, profit_amount, type, status")
        .gte("created_at", startOfMonth.toISOString())
        .eq("type", "receita");

      const { data: lastMonthTransactions } = await supabase
        .from("financial_transactions")
        .select("amount, type, status")
        .gte("created_at", startOfLastMonth.toISOString())
        .lte("created_at", endOfLastMonth.toISOString())
        .eq("type", "receita");

      // Calculate paid revenue only
      const paidTransactions = currentMonthTransactions?.filter(t => t.status === 'pago') || [];
      const pendingTransactions = currentMonthTransactions?.filter(t => t.status === 'pendente') || [];
      
      const monthlyRevenue = paidTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const monthlyPendingRevenue = pendingTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const monthlyCost = paidTransactions.reduce((sum, t) => sum + Number(t.cost_amount || 0), 0);
      const monthlyProfit = paidTransactions.reduce((sum, t) => sum + Number(t.profit_amount || 0), 0);
      
      // Compare paid revenue only
      const lastMonthPaidRevenue = lastMonthTransactions
        ?.filter(t => t.status === 'pago')
        ?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;
      
      const revenueChange = lastMonthPaidRevenue > 0 
        ? Math.round(((monthlyRevenue - lastMonthPaidRevenue) / lastMonthPaidRevenue) * 100)
        : 0;

      return {
        openOrders: openOrders || 0,
        activeClients: uniqueClients.size,
        stockItems,
        lowStockItems,
        monthlyRevenue,
        monthlyPendingRevenue,
        monthlyCost,
        monthlyProfit,
        revenueChange
      };
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function useRecentOrders() {
  return useQuery({
    queryKey: ["recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          os_number,
          device,
          status,
          created_at,
          clients (
            name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}
