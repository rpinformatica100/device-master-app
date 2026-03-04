import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminUsers, useAdminPayments } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, AlertTriangle, Clock, DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  const { data: users = [], isLoading: loadingUsers } = useAdminUsers();
  const currentMonth = format(new Date(), "yyyy-MM-01");
  const { data: payments = [], isLoading: loadingPayments } = useAdminPayments({ month: currentMonth });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.subscription?.status === "ativo").length;
  const suspendedUsers = users.filter(u => u.subscription?.status === "suspenso").length;
  const expiredUsers = users.filter(u => u.subscription?.status === "expirado").length;
  const awaitingUsers = users.filter(u => !u.subscription || u.subscription?.status === "aguardando").length;

  const paidPayments = payments.filter(p => p.status === "pago");
  const pendingPayments = payments.filter(p => p.status === "pendente");
  const overduePayments = payments.filter(p => p.status === "atrasado");

  const monthRevenue = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const monthPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const stats = [
    { label: "Total Assistências", value: totalUsers, icon: Users, color: "text-primary" },
    { label: "Ativas", value: activeUsers, icon: CheckCircle, color: "text-emerald-500" },
    { label: "Suspensas", value: suspendedUsers, icon: AlertTriangle, color: "text-amber-500" },
    { label: "Expiradas", value: expiredUsers, icon: Clock, color: "text-destructive" },
    { label: "Aguardando", value: awaitingUsers, icon: Clock, color: "text-muted-foreground" },
    { label: "Receita do Mês", value: `R$ ${monthRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-emerald-500" },
  ];

  const recentUsers = [...users].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Últimos Cadastros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingUsers ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum cadastro</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.raw_user_meta_data.company_name || user.raw_user_meta_data.full_name || "Sem nome"}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.subscription?.status === "ativo" ? "bg-emerald-500/10 text-emerald-500" :
                      user.subscription?.status === "suspenso" ? "bg-amber-500/10 text-amber-500" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {user.subscription?.status || "aguardando"}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Resumo Financeiro - {format(new Date(), "MMMM yyyy", { locale: ptBR })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10">
                <span className="text-sm text-emerald-500">Recebido</span>
                <span className="text-lg font-bold text-emerald-500">R$ {monthRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10">
                <span className="text-sm text-amber-500">Pendente</span>
                <span className="text-lg font-bold text-amber-500">R$ {monthPending.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                <span className="text-sm text-destructive">Atrasado ({overduePayments.length})</span>
                <span className="text-lg font-bold text-destructive">
                  R$ {overduePayments.reduce((s, p) => s + Number(p.amount), 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
