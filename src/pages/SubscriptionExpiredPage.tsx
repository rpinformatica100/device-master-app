import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserMessages, useMarkMessageRead, useSendReply, useMessageReplies } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MessageCircle, LogOut, Send, Info, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

function ExpiredMessageItem({ msg }: { msg: any }) {
  const { user } = useAuth();
  const markRead = useMarkMessageRead();
  const sendReply = useSendReply();
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { data: replies = [] } = useMessageReplies(expanded ? msg.id : null);

  const isUnread = !msg.read_at && msg.sender_id !== user?.id;

  const handleExpand = () => {
    if (!expanded && isUnread) markRead.mutate(msg.id);
    setExpanded(!expanded);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await sendReply.mutateAsync({ parentId: msg.id, message: replyText.trim() });
      setReplyText("");
      toast.success("Resposta enviada!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <Card className={`bg-card/50 border-border ${isUnread ? "border-l-4 border-l-primary" : ""}`}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between cursor-pointer" onClick={handleExpand}>
          <div className="flex items-center gap-2 flex-1">
            <Info className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">{msg.message}</p>
          </div>
          <div className="flex items-center gap-1">
            {isUnread && <span className="w-2 h-2 rounded-full bg-primary" />}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground">{format(new Date(msg.created_at), "dd/MM/yyyy HH:mm")}</span>

        {expanded && (
          <div className="space-y-2 pt-2 border-t border-border">
            {replies.map((r: any) => (
              <div key={r.id} className={`p-2 rounded-lg text-sm ${r.sender_id === user?.id ? "bg-primary/10 ml-4" : "bg-muted/50 mr-4"}`}>
                <p className="text-foreground">{r.message}</p>
                <span className="text-[10px] text-muted-foreground">{format(new Date(r.created_at), "dd/MM HH:mm")}</span>
              </div>
            ))}
            <div className="flex gap-2">
              <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Responder..." rows={2} className="flex-1" />
              <Button size="icon" onClick={handleReply} disabled={sendReply.isPending} className="gradient-primary self-end">
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SubscriptionExpiredPage() {
  const { signOut, isAdmin, subscriptionStatus, subscriptionExpiresAt } = useAuth();
  const { data: messages = [] } = useUserMessages();

  // Admin never gets stuck here
  if (isAdmin) {
    window.location.href = "/admin";
    return null;
  }

  const whatsappUrl = "https://wa.me/5500000000000?text=Olá! Gostaria de renovar minha assinatura do TechOS.";

  const statusLabel: Record<string, string> = {
    expirado: "Expirada",
    suspenso: "Suspensa",
    aguardando: "Aguardando Ativação",
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Assinatura Inativa</h1>
            <p className="text-muted-foreground">
              Sua assinatura do TechOS {statusLabel[subscriptionStatus || ""] ? `está: ${statusLabel[subscriptionStatus || ""]}` : "expirou ou ainda não foi ativada"}.
            </p>
            {subscriptionExpiresAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Expirou em: {format(new Date(subscriptionExpiresAt), "dd/MM/yyyy")}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                Falar no WhatsApp
              </a>
            </Button>

            <Button variant="outline" className="w-full" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Messages from admin */}
        {messages.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Mensagens do Suporte ({messages.length})
            </h2>
            {messages.slice(0, 5).map((msg) => (
              <ExpiredMessageItem key={msg.id} msg={msg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
