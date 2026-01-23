import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { FileText, Users, Package, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const Index = () => {
  const { data: stats, isLoading } = useDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <MainLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Bem-vindo de volta! Aqui está o resumo do seu dia.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
          <StatCard
            title="Ordens Abertas"
            value={isLoading ? "..." : stats?.openOrders || 0}
            change={isLoading ? "" : `${stats?.openOrders || 0} pendentes`}
            changeType="neutral"
            icon={FileText}
            delay={0}
          />
          <StatCard
            title="Clientes Ativos"
            value={isLoading ? "..." : stats?.activeClients || 0}
            change="últimos 3 meses"
            changeType="neutral"
            icon={Users}
            delay={0.1}
          />
          <StatCard
            title="Itens em Estoque"
            value={isLoading ? "..." : stats?.stockItems || 0}
            change={isLoading ? "" : stats?.lowStockItems ? `${stats.lowStockItems} abaixo do mínimo` : "Estoque OK"}
            changeType={stats?.lowStockItems ? "negative" : "positive"}
            icon={Package}
            delay={0.2}
          />
          <StatCard
            title="Faturamento (Pago)"
            value={isLoading ? "..." : formatCurrency(stats?.monthlyRevenue || 0)}
            change={isLoading ? "" : stats?.monthlyPendingRevenue ? `+ ${formatCurrency(stats.monthlyPendingRevenue)} pendente` : stats?.revenueChange ? `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}% vs mês anterior` : "Este mês"}
            changeType={stats?.monthlyPendingRevenue ? "neutral" : stats?.revenueChange && stats.revenueChange > 0 ? "positive" : stats?.revenueChange && stats.revenueChange < 0 ? "negative" : "neutral"}
            icon={DollarSign}
            delay={0.3}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Recent Orders - Spans 2 columns */}
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Financial Chart */}
        <div className="mt-3 sm:mt-4 lg:mt-6">
          <FinancialChart />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
