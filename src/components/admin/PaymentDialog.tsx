import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminPaymentMutations, useAdminSubscriptions, type AdminUser, type SubscriptionPayment } from "@/hooks/useAdmin";
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
  const isEditing = !!payment;

  const [form, setForm] = useState({
    user_id: "",
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
        amount: String(payment.amount),
        payment_method: payment.payment_method || "pix",
        status: payment.status,
        reference_month: payment.reference_month || "",
        due_date: payment.due_date || "",
        paid_at: payment.paid_at ? payment.paid_at.split("T")[0] : "",
        notes: payment.notes || "",
      });
    } else {
      setForm({
        user_id: "",
        amount: "",
        payment_method: "pix",
        status: "pago",
        reference_month: new Date().toISOString().slice(0, 7) + "-01",
        due_date: "",
        paid_at: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [payment, open]);

  const handleSave = async () => {
    if (!form.user_id || !form.amount) {
      toast.error("Selecione a assistência e informe o valor");
      return;
    }

    try {
      const selectedUser = users.find(u => u.id === form.user_id);
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
      if (form.status === "pago" && selectedUser?.subscription) {
        const plan = selectedUser.subscription.plan;
        const now = new Date();
        const daysToAdd = plan === "anual" ? 365 : 30;
        const expiresAt = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        await upsertSubscription.mutateAsync({
          id: selectedUser.subscription.id,
          user_id: selectedUser.id,
          plan,
          status: "ativo",
          starts_at: now.toISOString().split("T")[0],
          expires_at: expiresAt.toISOString().split("T")[0],
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
            <Select value={form.user_id} onValueChange={(v) => setForm({ ...form, user_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.raw_user_meta_data.company_name || u.raw_user_meta_data.full_name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
