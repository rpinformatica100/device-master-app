import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSubscriptions } from "@/hooks/useAdmin";
import { toast } from "sonner";
import type { AdminUser } from "@/hooks/useAdmin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
}

export default function SubscriptionDialog({ open, onOpenChange, user }: Props) {
  const { upsertSubscription } = useAdminSubscriptions();
  const [form, setForm] = useState({
    plan: "mensal",
    status: "ativo",
    starts_at: "",
    expires_at: "",
    notes: "",
  });

  useEffect(() => {
    if (user?.subscription) {
      setForm({
        plan: user.subscription.plan,
        status: user.subscription.status,
        starts_at: user.subscription.starts_at ? user.subscription.starts_at.split("T")[0] : "",
        expires_at: user.subscription.expires_at ? user.subscription.expires_at.split("T")[0] : "",
        notes: user.subscription.notes || "",
      });
    } else {
      setForm({
        plan: "mensal",
        status: "ativo",
        starts_at: new Date().toISOString().split("T")[0],
        expires_at: "",
        notes: "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await upsertSubscription.mutateAsync({
        id: user.subscription?.id,
        user_id: user.id,
        plan: form.plan,
        status: form.status,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
        notes: form.notes || null,
      });
      toast.success("Assinatura atualizada!");
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Assinatura</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium text-foreground">
              {user?.raw_user_meta_data.company_name || user?.raw_user_meta_data.full_name}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Plano</Label>
              <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                  <SelectItem value="expirado">Expirado</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="aguardando">Aguardando</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Início</Label>
              <Input type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Expiração</Label>
              <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Observações</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={upsertSubscription.isPending} className="gradient-primary">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
