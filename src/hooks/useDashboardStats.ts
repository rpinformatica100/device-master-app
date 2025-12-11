import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  openOrders: number;
  activeClients: number;
  stockItems: number;
  lowStockItems: number;
  monthlyRevenue: number;
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

      // Open orders (not completed)
      const { count: openOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .not("status", "eq", "concluido");

      // Active clients (with orders this month or last 3 months)
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

      // Monthly revenue from completed orders
      const { data: currentMonthOrders } = await supabase
        .from("orders")
        .select("total_sale")
        .gte("created_at", startOfMonth.toISOString())
        .eq("status", "concluido");

      const { data: lastMonthOrders } = await supabase
        .from("orders")
        .select("total_sale")
        .gte("created_at", startOfLastMonth.toISOString())
        .lte("created_at", endOfLastMonth.toISOString())
        .eq("status", "concluido");

      const monthlyRevenue = currentMonthOrders?.reduce((sum, o) => sum + Number(o.total_sale || 0), 0) || 0;
      const lastMonthRevenue = lastMonthOrders?.reduce((sum, o) => sum + Number(o.total_sale || 0), 0) || 0;
      
      const revenueChange = lastMonthRevenue > 0 
        ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0;

      return {
        openOrders: openOrders || 0,
        activeClients: uniqueClients.size,
        stockItems,
        lowStockItems,
        monthlyRevenue,
        revenueChange
      };
    }
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
    }
  });
}
