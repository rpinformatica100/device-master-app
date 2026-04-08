import { useState } from "react";
import { calculateRenewalDate } from "@/lib/subscriptionUtils";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminUsers, useAdminPayments, useAdminPaymentMutations, useAdminSubscriptions, type SubscriptionPayment } from "@/hooks/useAdmin";
import { usePlanPricing, useUpdatePlanPricing } from "@/hooks/usePlanPricing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, CheckCircle, Trash2, Edit, DollarSign, Clock, AlertTriangle, Save, Settings } from "lucide-react";
import PaymentDialog from "@/components/admin/PaymentDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pago: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  pendente: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  atrasado: "bg-destructive/10 text-destructive border-destructive/20",
  cancelado: "bg-muted text-muted-foreground border-border",
};

export default function AdminFinancialPage() {
  const { data: users = [] } = useAdminUsers();
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7) + "-01");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUser, setFilterUser] = useState("all");

  const { data: payments = [], isLoading } = useAdminPayments({
    month: filterMonth || undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    userId: filterUser !== "all" ? filterUser : undefined,
  });
  const { updatePayment, deletePayment } = useAdminPaymentMutations();
  const { upsertSubscription } = useAdminSubscriptions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<SubscriptionPayment | null>(null);

  const totalPaid = payments.filter(p => p.status === "pago").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === "pendente").reduce((s, p) => s + Number(p.amount), 0);
  const totalOverdue = payments.filter(p => p.status === "atrasado").reduce((s, p) => s + Number(p.amount), 0);

  const getUserName = (userId: string) => {
    const u = users.find(u => u.id === userId);
    return u?.raw_user_meta_data.company_name || u?.raw_user_meta_data.full_name || u?.email || userId.slice(0, 8);
  };

  const handleMarkPaid = async (payment: SubscriptionPayment) => {
    try {
      await updatePayment.mutateAsync({
        id: payment.id,
        status: "pago",
        paid_at: new Date().toISOString(),
      });

      // Auto-activate subscription
      const u = users.find(u => u.id === payment.user_id);
      if (u) {
        const plan = u.subscription?.plan || "mensal";
        const { startsAt, expiresAt } = calculateRenewalDate(
          u.subscription?.expires_at ?? null,
          plan
        );
        await upsertSubscription.mutateAsync({
          id: u.subscription?.id,
          user_id: u.id,
          plan,
          status: "ativo",
          starts_at: startsAt,
          expires_at: expiresAt,
        });
      }

      toast.success("Marcado como pago e assinatura ativada!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este pagamento?")) return;
    try {
      await deletePayment.mutateAsync(id);
      toast.success("Pagamento excluído");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Controle Financeiro</h1>
            <p className="text-muted-foreground">Pagamentos de mensalidade das assistências</p>
          </div>
          <Button className="gradient-primary" onClick={() => { setEditPayment(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Pagamento
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Recebido</p>
                <p className="text-xl font-bold text-emerald-500">R$ {totalPaid.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Pendente</p>
                <p className="text-xl font-bold text-amber-500">R$ {totalPending.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Atrasado</p>
                <p className="text-xl font-bold text-destructive">R$ {totalOverdue.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <Input
            type="month"
            className="w-48"
            value={filterMonth?.slice(0, 7)}
            onChange={(e) => setFilterMonth(e.target.value ? e.target.value + "-01" : "")}
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Assistência" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {users.map(u => (
                <SelectItem key={u.id} value={u.id}>
                  {u.raw_user_meta_data.company_name || u.raw_user_meta_data.full_name || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payments Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Assistência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Mês Ref.</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Obs</TableHead>
                <TableHead className="w-28">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : payments.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum pagamento encontrado</TableCell></TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm font-medium">{getUserName(p.user_id)}</TableCell>
                    <TableCell className="text-sm font-bold">R$ {Number(p.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-xs uppercase text-muted-foreground">{p.payment_method || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.reference_month ? format(new Date(p.reference_month + "T12:00:00"), "MMM/yyyy", { locale: ptBR }) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.due_date ? format(new Date(p.due_date + "T12:00:00"), "dd/MM/yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.paid_at ? format(new Date(p.paid_at), "dd/MM/yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[p.status] || ""}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                      {p.notes || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {p.status !== "pago" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMarkPaid(p)} title="Marcar como pago">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditPayment(p); setDialogOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        users={users}
        payment={editPayment}
      />
    </AdminLayout>
  );
}
