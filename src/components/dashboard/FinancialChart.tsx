import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function FinancialChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["financial-chart"],
    queryFn: async () => {
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);

      // Get completed orders (revenue)
      const { data: orders } = await supabase
        .from("orders")
        .select("total_sale, created_at")
        .gte("created_at", sixMonthsAgo.toISOString())
        .eq("status", "concluido");

      // Get expenses from financial transactions
      const { data: transactions } = await supabase
        .from("financial_transactions")
        .select("amount, type, created_at")
        .gte("created_at", sixMonthsAgo.toISOString());

      // Group by month
      const monthlyData: Record<string, { receita: number; despesa: number }> = {};
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = { receita: 0, despesa: 0 };
      }

      // Sum orders by month (revenue)
      orders?.forEach(order => {
        const date = new Date(order.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[key]) {
          monthlyData[key].receita += Number(order.total_sale || 0);
        }
      });

      // Sum transactions by month
      transactions?.forEach(tx => {
        const date = new Date(tx.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[key]) {
          if (tx.type === "receita") {
            monthlyData[key].receita += Number(tx.amount || 0);
          } else if (tx.type === "despesa") {
            monthlyData[key].despesa += Number(tx.amount || 0);
          }
        }
      });

      // Convert to array format for chart
      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, values]) => {
          const [year, month] = key.split("-");
          return {
            name: months[parseInt(month) - 1],
            receita: values.receita,
            despesa: values.despesa,
          };
        });
    }
  });

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-6">Visão Financeira</h3>
        <Skeleton className="h-[300px] w-full" />
      </motion.div>
    );
  }

  const hasData = chartData && chartData.some(d => d.receita > 0 || d.despesa > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Visão Financeira</h3>
      <div className="h-[300px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis
                dataKey="name"
                stroke="hsl(215, 20%, 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(215, 20%, 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value >= 1000 ? `R$${(value / 1000).toFixed(1)}k` : `R$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 8%)",
                  border: "1px solid hsl(222, 30%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(210, 40%, 98%)" }}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
              />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="hsl(199, 89%, 48%)"
                fillOpacity={1}
                fill="url(#colorReceita)"
                strokeWidth={2}
                name="Receita"
              />
              <Area
                type="monotone"
                dataKey="despesa"
                stroke="hsl(0, 84%, 60%)"
                fillOpacity={1}
                fill="url(#colorDespesa)"
                strokeWidth={2}
                name="Despesa"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Nenhum dado financeiro disponível. Complete ordens de serviço para visualizar o gráfico.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
