import { useState, useEffect } from "react";
import { calculateRenewalDate } from "@/lib/subscriptionUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAdminPaymentMutations, useAdminSubscriptions, type AdminUser, type SubscriptionPayment } from "@/hooks/useAdmin";
import { usePlanPricing } from "@/hooks/usePlanPricing";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: AdminUser[];
  payment?: SubscriptionPayment | null;
}

export default function PaymentDialog({ open, onOpenChange, users, payment }: Props) {
  const { createPayment, updatePayment } = useAdminPaymentMutations();
  const { upsertSubscription } = useAdminSubscriptions();
  const { user: currentUser } = useAuth();
  const { data: plans = [] } = usePlanPricing();
  const isEditing = !!payment;

  const [form, setForm] = useState({
    user_id: "",
    plan_key: "mensal",
    amount: "",
    payment_method: "pix",
    status: "pago",
    reference_month: new Date().toISOString().slice(0, 7) + "-01",
    due_date: "",
    paid_at: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (payment) {
      setForm({
        user_id: payment.user_id,
        plan_key: "",
        amount: String(payment.amount),
        payment_method: payment.payment_method || "pix",
        status: payment.status,
        reference_month: payment.reference_month || "",
        due_date: payment.due_date || "",
        paid_at: payment.paid_at ? payment.paid_at.split("T")[0] : "",
        notes: payment.notes || "",
      });
    } else {
      const defaultPlan = plans.find(p => p.plan_key === "mensal");
      setForm({
        user_id: "",
        plan_key: "mensal",
        amount: defaultPlan ? String(defaultPlan.price) : "49",
        payment_method: "pix",
        status: "pago",
        reference_month: new Date().toISOString().slice(0, 7) + "-01",
        due_date: "",
        paid_at: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [payment, open, plans]);

  const handlePlanChange = (planKey: string) => {
    const plan = plans.find(p => p.plan_key === planKey);
    setForm(prev => ({
      ...prev,
      plan_key: planKey,
      amount: plan ? String(plan.price) : prev.amount,
    }));
  };

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    const currentPlan = selectedUser?.subscription?.plan || "mensal";
    const plan = plans.find(p => p.plan_key === currentPlan);
    setForm(prev => ({
      ...prev,
      user_id: userId,
      plan_key: currentPlan,
      amount: plan ? String(plan.price) : prev.amount,
    }));
  };

  const selectedUser = users.find(u => u.id === form.user_id);

  const handleSave = async () => {
    if (!form.user_id || !form.amount) {
      toast.error("Selecione a assistência e informe o valor");
      return;
    }

    try {
      const payload = {
        user_id: form.user_id,
        subscription_id: selectedUser?.subscription?.id || null,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        status: form.status,
        reference_month: form.reference_month || null,
        due_date: form.due_date || null,
        paid_at: form.paid_at ? new Date(form.paid_at).toISOString() : null,
        notes: form.notes || null,
        created_by: currentUser?.id || null,
      };

      if (isEditing && payment) {
        await updatePayment.mutateAsync({ id: payment.id, ...payload });
        toast.success("Pagamento atualizado!");
      } else {
        await createPayment.mutateAsync(payload);
        toast.success("Pagamento registrado!");
      }

      // Auto-activate subscription when payment is "pago"
      if (form.status === "pago" && selectedUser) {
        const plan = form.plan_key || selectedUser.subscription?.plan || "mensal";
        const { startsAt, expiresAt } = calculateRenewalDate(
          selectedUser.subscription?.expires_at ?? null,
          plan
        );
        await upsertSubscription.mutateAsync({
          id: selectedUser.subscription?.id,
          user_id: selectedUser.id,
          plan,
          status: "ativo",
          starts_at: startsAt,
          expires_at: expiresAt,
        });
      }

      onOpenChange(false);
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Pagamento" : "Registrar Pagamento"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Assistência *</Label>
            <Select value={form.user_id} onValueChange={handleUserChange}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.raw_user_meta_data.company_name || u.raw_user_meta_data.full_name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedUser?.subscription && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px]">
                  Plano: {selectedUser.subscription.plan}
                </Badge>
                <Badge variant="outline" className={`text-[10px] ${selectedUser.subscription.status === 'ativo' ? 'text-emerald-500 border-emerald-500/30' : 'text-amber-500 border-amber-500/30'}`}>
                  {selectedUser.subscription.status}
                </Badge>
                {selectedUser.subscription.expires_at && (
                  <span className="text-[10px] text-muted-foreground">
                    Exp: {new Date(selectedUser.subscription.expires_at).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Plano</Label>
            <div className="grid grid-cols-3 gap-2">
              {plans.filter(p => p.plan_key !== "free").map((plan) => (
                <button
                  key={plan.plan_key}
                  type="button"
                  onClick={() => handlePlanChange(plan.plan_key)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    form.plan_key === plan.plan_key
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                  <p className="text-lg font-bold text-primary">R$ {plan.price}</p>
                  <p className="text-[10px] text-muted-foreground">{plan.period_label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Valor (R$) *</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Forma de Pagamento</Label>
              <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mês Referência</Label>
              <Input type="month" value={form.reference_month?.slice(0, 7)} onChange={(e) => setForm({ ...form, reference_month: e.target.value + "-01" })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Vencimento</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data Pagamento</Label>
              <Input type="date" value={form.paid_at} onChange={(e) => setForm({ ...form, paid_at: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Observações</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={createPayment.isPending || updatePayment.isPending} className="gradient-primary">
            {isEditing ? "Atualizar" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
