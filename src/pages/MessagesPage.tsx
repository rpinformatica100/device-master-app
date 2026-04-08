import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useUserMessages, useMarkMessageRead, useSendReply, useMessageReplies } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Info, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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

function MessageItem({ msg }: { msg: any }) {
  const { user } = useAuth();
  const markRead = useMarkMessageRead();
  const sendReply = useSendReply();
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { data: replies = [] } = useMessageReplies(expanded ? msg.id : null);

  const Icon = typeIcons[msg.type] || Info;
  const isUnread = !msg.read_at && msg.sender_id !== user?.id;
  const isClosed = msg.status === "encerrado";

  const handleExpand = () => {
    if (!expanded && isUnread) {
      markRead.mutate(msg.id);
    }
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
    <Card className={`bg-card border-border transition-all ${isUnread ? "border-l-4 border-l-primary" : ""} ${isClosed ? "opacity-70" : ""}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between cursor-pointer" onClick={handleExpand}>
          <div className="flex items-center gap-2 flex-1">
            <Icon className={`w-5 h-5 flex-shrink-0 ${typeColors[msg.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{msg.message}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(msg.created_at), "dd/MM/yyyy HH:mm")}
                </span>
                {!msg.recipient_id && <Badge variant="outline" className="text-[10px]">Global</Badge>}
                {isClosed && (
                  <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">
                    <Lock className="w-2.5 h-2.5 mr-0.5" />
                    Encerrado
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isUnread && <span className="w-2 h-2 rounded-full bg-primary" />}
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {expanded && (
          <div className="space-y-3 pt-2 border-t border-border">
            {replies.length > 0 && (
              <div className="space-y-2">
                {replies.map((r: any) => (
                  <div key={r.id} className={`p-2 rounded-lg text-sm ${r.sender_id === user?.id ? "bg-primary/10 ml-4" : "bg-muted/50 mr-4"}`}>
                    <p className="text-foreground">{r.message}</p>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(r.created_at), "dd/MM HH:mm")}</span>
                  </div>
                ))}
              </div>
            )}
            {isClosed ? (
              <p className="text-xs text-muted-foreground italic text-center py-2">
                <Lock className="w-3 h-3 inline mr-1" />
                Este chamado foi encerrado
              </p>
            ) : (
              <div className="flex gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escreva uma resposta..."
                  rows={2}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleReply} disabled={sendReply.isPending} className="gradient-primary self-end">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MessagesPage() {
  const { data: messages = [], isLoading } = useUserMessages();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mensagens</h1>
          <p className="text-muted-foreground">Comunicação com o suporte TechOS</p>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-12">Carregando...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhuma mensagem recebida</p>
            </div>
          ) : (
            messages.map((msg) => <MessageItem key={msg.id} msg={msg} />)
          )}
        </div>
      </div>
    </MainLayout>
  );
}
