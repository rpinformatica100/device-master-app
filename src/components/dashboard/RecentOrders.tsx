import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const orders = [
  { id: "OS-001", client: "João Silva", device: "iPhone 14 Pro", status: "em_andamento", date: "09/12/2024" },
  { id: "OS-002", client: "Maria Santos", device: "MacBook Air M2", status: "aguardando", date: "08/12/2024" },
  { id: "OS-003", client: "Pedro Costa", device: "Samsung S23", status: "concluido", date: "08/12/2024" },
  { id: "OS-004", client: "Ana Oliveira", device: "Dell XPS 15", status: "em_andamento", date: "07/12/2024" },
  { id: "OS-005", client: "Carlos Lima", device: "iPad Pro", status: "aguardando_peca", date: "07/12/2024" },
];

const statusConfig = {
  em_andamento: { label: "Em Andamento", className: "bg-info/20 text-info border-info/30" },
  aguardando: { label: "Aguardando", className: "bg-warning/20 text-warning border-warning/30" },
  concluido: { label: "Concluído", className: "bg-success/20 text-success border-success/30" },
  aguardando_peca: { label: "Aguard. Peça", className: "bg-muted text-muted-foreground border-muted" },
};

export function RecentOrders() {
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
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{order.id.split("-")[1]}</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{order.client}</p>
                <p className="text-sm text-muted-foreground">{order.device}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">{order.date}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  statusConfig[order.status as keyof typeof statusConfig].className
                )}
              >
                {statusConfig[order.status as keyof typeof statusConfig].label}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
