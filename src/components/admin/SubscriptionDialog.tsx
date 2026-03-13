import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAdminSubscriptions, useAdminPayments, useAdminPaymentMutations } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { format, addDays, addYears, isPast, differenceInDays, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, Shield, ShieldAlert, ShieldCheck, ShieldX, Clock,
  AlertTriangle, CheckCircle2, XCircle, DollarSign, Ban
} from "lucide-react";
import type { AdminUser } from "@/hooks/useAdmin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
}

const planConfig: Record<string, { label: string; days: number; color: string }> = {
  free: { label: "Free", days: 0, color: "text-muted-foreground" },
  mensal: { label: "Mensal", days: 30, color: "text-primary" },
  anual: { label: "Anual", days: 365, color: "text-emerald-500" },
};

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  ativo: { label: "Ativo", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  suspenso: { label: "Suspenso", icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  expirado: { label: "Expirado", icon: ShieldX, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  trial: { label: "Trial", icon: Shield, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  aguardando: { label: "Aguardando", icon: Clock, color: "text-muted-foreground", bg: "bg-muted border-border" },
};

function DatePickerField({ label, date, onSelect }: { label: string; date: Date | undefined; onSelect: (d: Date | undefined) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal h-9 text-sm", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {date && isValid(date) ? format(date, "dd/MM/yyyy") : "Selecionar data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
            className="p-3 pointer-events-auto"
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function SubscriptionDialog({ open, onOpenChange, user }: Props) {
  const { upsertSubscription } = useAdminSubscriptions();
  const { data: payments = [] } = useAdminPayments({ userId: user?.id });
  const { updatePayment } = useAdminPaymentMutations();

  const [plan, setPlan] = useState("mensal");
  const [status, setStatus] = useState("ativo");
  const [startsAt, setStartsAt] = useState<Date | undefined>();
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");

  // Reset form when user changes
  useEffect(() => {
    if (!user) return;
    if (user.subscription) {
      setPlan(user.subscription.plan);
      setStatus(user.subscription.status);
      setStartsAt(user.subscription.starts_at ? new Date(user.subscription.starts_at) : undefined);
      setExpiresAt(user.subscription.expires_at ? new Date(user.subscription.expires_at) : undefined);
      setNotes(user.subscription.notes || "");
    } else {
      setPlan("mensal");
      setStatus("aguardando");
      setStartsAt(undefined);
      setExpiresAt(undefined);
      setNotes("");
    }
  }, [user]);

  // Auto-calculate expires_at when plan or starts_at changes
  const handlePlanChange = (newPlan: string) => {
    setPlan(newPlan);
    if (startsAt && planConfig[newPlan]?.days > 0) {
      const days = planConfig[newPlan].days;
      setExpiresAt(addDays(startsAt, days));
    }
  };

  const handleStartsAtChange = (date: Date | undefined) => {
    setStartsAt(date);
    if (date && planConfig[plan]?.days > 0) {
      setExpiresAt(addDays(date, planConfig[plan].days));
    }
  };

  // Quick actions
  const handleActivateNow = () => {
    const now = new Date();
    setStatus("ativo");
    setStartsAt(now);
    const days = planConfig[plan]?.days || 30;
    setExpiresAt(addDays(now, days));
  };

  const handleSuspend = () => {
    setStatus("suspenso");
  };

  const handleExpire = () => {
    setStatus("expirado");
  };

  // Computed alerts
  const alerts = useMemo(() => {
    const list: { type: "warning" | "error" | "info"; message: string }[] = [];
    if (expiresAt && isValid(expiresAt)) {
      const daysLeft = differenceInDays(expiresAt, new Date());
      if (daysLeft < 0) {
        list.push({ type: "error", message: `Assinatura vencida há ${Math.abs(daysLeft)} dias` });
      } else if (daysLeft <= 7) {
        list.push({ type: "warning", message: `Assinatura vence em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}` });
      }
    }
    if (status === "ativo" && (!expiresAt || (expiresAt && isPast(expiresAt)))) {
      list.push({ type: "error", message: "Status ativo mas sem data de expiração válida — acesso será bloqueado" });
    }
    if (status === "aguardando") {
      list.push({ type: "info", message: "Assistência aguardando ativação — sem acesso ao sistema" });
    }
    const pendingPayments = payments.filter(p => p.status === "pendente" || p.status === "atrasado");
    if (pendingPayments.length > 0) {
      list.push({ type: "warning", message: `${pendingPayments.length} pagamento(s) pendente(s)/atrasado(s)` });
    }
    return list;
  }, [expiresAt, status, payments]);

  // Recent payments for this user
  const recentPayments = useMemo(() => payments.slice(0, 5), [payments]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await upsertSubscription.mutateAsync({
        id: user.subscription?.id,
        user_id: user.id,
        plan,
        status,
        starts_at: startsAt ? format(startsAt, "yyyy-MM-dd") : null,
        expires_at: expiresAt ? format(expiresAt, "yyyy-MM-dd") : null,
        notes: notes || null,
      });
      toast.success("Assinatura atualizada com sucesso!");
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    }
  };

  if (!user) return null;

  const StatusIcon = statusConfig[status]?.icon || Shield;
  const daysLeft = expiresAt && isValid(expiresAt) ? differenceInDays(expiresAt, new Date()) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatusIcon className={cn("w-5 h-5", statusConfig[status]?.color)} />
            Gestão de Assinatura
          </DialogTitle>
        </DialogHeader>

        {/* Client Info Header */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {user.raw_user_meta_data.company_name || user.raw_user_meta_data.full_name || "Sem nome"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {user.raw_user_meta_data.cnpj && (
              <p className="text-xs text-muted-foreground">CNPJ: {user.raw_user_meta_data.cnpj}</p>
            )}
          </div>
          <Badge variant="outline" className={cn("shrink-0", statusConfig[status]?.bg)}>
            {statusConfig[status]?.label || status}
          </Badge>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-md text-xs font-medium border",
                  alert.type === "error" && "bg-destructive/10 text-destructive border-destructive/20",
                  alert.type === "warning" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                  alert.type === "info" && "bg-primary/10 text-primary border-primary/20",
                )}
              >
                {alert.type === "error" ? <XCircle className="w-3.5 h-3.5 shrink-0" /> :
                  alert.type === "warning" ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> :
                    <Clock className="w-3.5 h-3.5 shrink-0" />}
                {alert.message}
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Plan & Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Plano</Label>
            <Select value={plan} onValueChange={handlePlanChange}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="mensal">Mensal (30 dias)</SelectItem>
                <SelectItem value="anual">Anual (365 dias)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">✅ Ativo</SelectItem>
                <SelectItem value="suspenso">⚠️ Suspenso</SelectItem>
                <SelectItem value="expirado">❌ Expirado</SelectItem>
                <SelectItem value="trial">🔵 Trial</SelectItem>
                <SelectItem value="aguardando">⏳ Aguardando</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <DatePickerField label="Data Início" date={startsAt} onSelect={handleStartsAtChange} />
          <DatePickerField label="Data Expiração" date={expiresAt} onSelect={setExpiresAt} />
        </div>

        {/* Days remaining indicator */}
        {daysLeft !== null && (
          <div className={cn(
            "flex items-center justify-center gap-2 p-2 rounded-md text-xs font-bold border",
            daysLeft < 0 ? "bg-destructive/10 text-destructive border-destructive/20" :
              daysLeft <= 7 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          )}>
            {daysLeft < 0 ? `Vencido há ${Math.abs(daysLeft)} dias` :
              daysLeft === 0 ? "Vence hoje!" :
                `${daysLeft} dia${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={handleActivateNow} className="text-xs h-8 gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ativar Agora
          </Button>
          <Button size="sm" variant="outline" onClick={handleSuspend} className="text-xs h-8 gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
            <ShieldAlert className="w-3.5 h-3.5" />
            Suspender
          </Button>
          <Button size="sm" variant="outline" onClick={handleExpire} className="text-xs h-8 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10">
            <Ban className="w-3.5 h-3.5" />
            Expirar
          </Button>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Observações internas</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anotações sobre este cliente..."
            className="text-sm"
          />
        </div>

        <Separator />

        {/* Recent Payments */}
        {recentPayments.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Últimos Pagamentos
            </Label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0",
                      p.status === "pago" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        p.status === "atrasado" ? "bg-destructive/10 text-destructive border-destructive/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {p.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {p.reference_month ? format(new Date(p.reference_month + "T12:00:00"), "MMM/yyyy", { locale: ptBR }) : "—"}
                    </span>
                  </div>
                  <span className="font-bold text-foreground">R$ {Number(p.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={upsertSubscription.isPending} size="sm" className="gradient-primary">
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
