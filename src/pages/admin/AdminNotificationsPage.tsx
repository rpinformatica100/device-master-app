import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminUsers, useAdminNotifications } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bell, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const typeIcons: Record<string, any> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
};

const typeColors: Record<string, string> = {
  info: "text-primary",
  warning: "text-amber-500",
  success: "text-emerald-500",
  error: "text-destructive",
};

export default function AdminNotificationsPage() {
  const { data: users = [] } = useAdminUsers();
  const { sendNotification, notifications } = useAdminNotifications();
  const notifData = notifications.data || [];

  const [form, setForm] = useState({
    user_id: "all",
    title: "",
    message: "",
    type: "info",
  });

  const handleSend = async () => {
    if (!form.title || !form.message) {
      toast.error("Preencha título e mensagem");
      return;
    }
    try {
      await sendNotification.mutateAsync({
        user_id: form.user_id === "all" ? null : form.user_id,
        title: form.title,
        message: form.message,
        type: form.type,
      });
      toast.success("Notificação enviada!");
      setForm({ user_id: "all", title: "", message: "", type: "info" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
          <p className="text-muted-foreground">Envie avisos para assistências cadastradas</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Send Form */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="w-4 h-4" />
                Enviar Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Destinatário</Label>
                  <Select value={form.user_id} onValueChange={(v) => setForm({ ...form, user_id: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os usuários</SelectItem>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.raw_user_meta_data.company_name || u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informação</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                      <SelectItem value="success">Sucesso</SelectItem>
                      <SelectItem value="error">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Título</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Aviso de manutenção" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Mensagem</Label>
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Digite a mensagem..." />
              </div>

              <Button className="w-full gradient-primary" onClick={handleSend} disabled={sendNotification.isPending}>
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </CardContent>
          </Card>

          {/* History */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {notifData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma notificação enviada</p>
              ) : (
                notifData.map((n: any) => {
                  const Icon = typeIcons[n.type] || Info;
                  return (
                    <div key={n.id} className="p-3 rounded-lg border border-border space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${typeColors[n.type]}`} />
                          <span className="text-sm font-medium text-foreground">{n.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(n.created_at), "dd/MM HH:mm")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {n.user_id ? "Individual" : "Global"}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
