import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { FileText, Users, Package, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo de volta! Aqui está o resumo do seu dia.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Ordens Abertas"
            value={24}
            change="+12% este mês"
            changeType="positive"
            icon={FileText}
            delay={0}
          />
          <StatCard
            title="Clientes Ativos"
            value={156}
            change="+5 novos"
            changeType="positive"
            icon={Users}
            delay={0.1}
          />
          <StatCard
            title="Itens em Estoque"
            value={342}
            change="8 abaixo do mínimo"
            changeType="negative"
            icon={Package}
            delay={0.2}
          />
          <StatCard
            title="Faturamento"
            value="R$ 12.450"
            change="+18% vs mês anterior"
            changeType="positive"
            icon={DollarSign}
            delay={0.3}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <div className="mt-6">
          <FinancialChart />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
