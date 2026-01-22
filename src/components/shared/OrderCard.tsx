import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/database";
import { cn } from "@/lib/utils";
import { Eye, Edit, Trash2, CheckCircle, Clock, Smartphone, Laptop, Tablet, Monitor } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; className: string }> = {
  em_andamento: { label: "Em Andamento", className: "bg-info/20 text-info border-info/30" },
  aguardando: { label: "Aguardando", className: "bg-warning/20 text-warning border-warning/30" },
  concluido: { label: "Concluído", className: "bg-success/20 text-success border-success/30" },
  aguardando_peca: { label: "Aguard. Peça", className: "bg-muted text-muted-foreground border-muted" },
  entregue: { label: "Entregue", className: "bg-primary/20 text-primary border-primary/30" },
  cancelado: { label: "Cancelado", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  alta: { label: "Alta", className: "bg-destructive/20 text-destructive border-destructive/30" },
  media: { label: "Média", className: "bg-warning/20 text-warning border-warning/30" },
  baixa: { label: "Baixa", className: "bg-success/20 text-success border-success/30" },
};

const categoryIcons: Record<string, React.ElementType> = {
  smartphone: Smartphone,
  notebook: Laptop,
  tablet: Tablet,
  desktop: Monitor,
};

interface OrderCardProps {
  order: Order;
  paymentStatus?: string;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

export function OrderCard({ order, paymentStatus, onView, onEdit, onDelete }: OrderCardProps) {
  const status = statusConfig[order.status] || statusConfig.aguardando;
  const priority = priorityConfig[order.priority] || priorityConfig.media;
  const CategoryIcon = categoryIcons[order.category] || Smartphone;

  return (
    <div 
      className="glass rounded-xl p-4 space-y-3 cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => onView(order)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CategoryIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs text-primary">{order.os_number}</p>
            <p className="font-medium text-foreground truncate">{order.client?.name || "Sem cliente"}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("text-xs shrink-0", priority.className)}>
          {priority.label}
        </Badge>
      </div>

      {/* Device & Issue */}
      <div className="space-y-1">
        <p className="text-sm text-foreground">{order.device}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{order.issue}</p>
      </div>

      {/* Status & Payment */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={cn("text-xs", status.className)}>
          {status.label}
        </Badge>
        {(order.status === 'concluido' || order.status === 'entregue') && (
          paymentStatus === 'pago' ? (
            <Badge variant="outline" className="text-xs bg-success/20 text-success border-success/30 gap-1">
              <CheckCircle className="w-3 h-3" />
              Pago
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-warning/20 text-warning border-warning/30 gap-1">
              <Clock className="w-3 h-3" />
              Pendente
            </Badge>
          )
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {format(new Date(order.created_at), "dd/MM/yy", { locale: ptBR })}
          </span>
          <span className="font-medium text-foreground">
            R$ {Number(order.total_sale).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onView(order)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onEdit(order)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => onDelete(order)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
