import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminUsers } from "@/hooks/useAdmin";
import { useAdminMessages, useAdminSendMessage, useMessageReplies } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Info, AlertTriangle, CheckCircle, XCircle, Check, CheckCheck, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const typeIcons: Record<string, any> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
  reply: MessageCircle,
};

const typeColors: Record<string, string> = {
  info: "text-primary",
  warning: "text-amber-500",
  success: "text-emerald-500",
  error: "text-destructive",
  reply: "text-muted-foreground",
};

function AdminMessageItem({ msg, users }: { msg: any; users: any[] }) {
  const { user: admin } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const { data: replies = [] } = useMessageReplies(expanded ? msg.id : null);
  const sendReply = useAdminSendMessage();
  const [replyText, setReplyText] = useState("");

  const Icon = typeIcons[msg.type] || Info;
  const recipientName = msg.recipient_id
    ? users.find((u) => u.id === msg.recipient_id)?.raw_user_meta_data?.company_name || "Usuário"
    : "Todos";

  const hasUnreadReplies = replies.some((r: any) => r.sender_id !== admin?.id && !r.read_at);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await sendReply.mutateAsync({
        recipient_id: msg.recipient_id,
        message: replyText.trim(),
        type: "reply",
        parent_message_id: msg.id,
      });
      setReplyText("");
      toast.success("Resposta enviada!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="p-3 rounded-lg border border-border space-y-2">
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2 flex-1">
          <Icon className={`w-4 h-4 ${typeColors[msg.type]}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{msg.message}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px]">{recipientName}</Badge>
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(msg.created_at), "dd/MM HH:mm")}
              </span>
              {/* Read receipt */}
              {msg.recipient_id && (
                msg.read_at
                  ? <CheckCheck className="w-3 h-3 text-primary" />
                  : <Check className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasUnreadReplies && <span className="w-2 h-2 rounded-full bg-primary" />}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="space-y-2 pt-2 border-t border-border">
          {replies.map((r: any) => {
            const isAdmin = r.sender_id === admin?.id;
            const senderName = isAdmin ? "Você" : users.find(u => u.id === r.sender_id)?.raw_user_meta_data?.company_name || "Assistência";
            return (
              <div key={r.id} className={`p-2 rounded-lg text-sm ${isAdmin ? "bg-primary/10 ml-4" : "bg-muted/50 mr-4"}`}>
                <p className="text-[10px] font-medium text-muted-foreground mb-0.5">{senderName}</p>
                <p className="text-foreground">{r.message}</p>
                <span className="text-[10px] text-muted-foreground">{format(new Date(r.created_at), "dd/MM HH:mm")}</span>
              </div>
            );
          })}
          {msg.recipient_id && (
            <div className="flex gap-2">
              <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Responder..." rows={2} className="flex-1" />
              <Button size="icon" onClick={handleReply} disabled={sendReply.isPending} className="gradient-primary self-end">
                <Send className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminNotificationsPage() {
  const { data: users = [] } = useAdminUsers();
  const { data: messages = [] } = useAdminMessages();
  const sendMessage = useAdminSendMessage();

  const [form, setForm] = useState({
    user_id: "all",
    message: "",
    type: "info",
  });

  const handleSend = async () => {
    if (!form.message) {
      toast.error("Preencha a mensagem");
      return;
    }
    try {
      await sendMessage.mutateAsync({
        recipient_id: form.user_id === "all" ? null : form.user_id,
        message: form.message,
        type: form.type,
      });
      toast.success("Mensagem enviada!");
      setForm({ user_id: "all", message: "", type: "info" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Central de Mensagens</h1>
          <p className="text-muted-foreground">Comunicação bidirecional com as assistências</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="w-4 h-4" />
                Enviar Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Destinatário</Label>
                  <Select value={form.user_id} onValueChange={(v) => setForm({ ...form, user_id: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
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
                <Label className="text-xs">Mensagem</Label>
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Digite a mensagem..." />
              </div>

              <Button className="w-full gradient-primary" onClick={handleSend} disabled={sendMessage.isPending}>
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Conversas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem enviada</p>
              ) : (
                messages.map((m) => <AdminMessageItem key={m.id} msg={m} users={users} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
