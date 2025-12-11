import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRecentOrders } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-warning/20 text-warning border-warning/30" },
  em_andamento: { label: "Em Andamento", className: "bg-info/20 text-info border-info/30" },
  aguardando: { label: "Aguardando", className: "bg-warning/20 text-warning border-warning/30" },
  aguardando_peca: { label: "Aguard. Peça", className: "bg-muted text-muted-foreground border-muted" },
  concluido: { label: "Concluído", className: "bg-success/20 text-success border-success/30" },
  cancelado: { label: "Cancelado", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export function RecentOrders() {
  const { data: orders, isLoading } = useRecentOrders();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Ordens Recentes</h3>
        <a href="/ordens" className="text-sm text-primary hover:underline">
          Ver todas
        </a>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))
        ) : orders && orders.length > 0 ? (
          orders.map((order, index) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const clientName = (order.clients as { name: string } | null)?.name || "Cliente não informado";
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {order.os_number.split("-")[1] || order.os_number.slice(-3)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{clientName}</p>
                    <p className="text-sm text-muted-foreground">{order.device}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", status.className)}
                  >
                    {status.label}
                  </Badge>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma ordem de serviço encontrada
          </div>
        )}
      </div>
    </motion.div>
  );
}
