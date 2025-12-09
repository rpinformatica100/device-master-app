import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Filter, Eye, Edit, Trash2, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderFormDialog } from "@/components/orders/OrderFormDialog";
import { OrderViewDialog } from "@/components/orders/OrderViewDialog";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types/database";
import { format } from "date-fns";

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

export default function OrdersPage() {
  const { orders, loading, deleteOrder } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const clientName = order.client?.name || "";
    const matchesSearch =
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.os_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.device.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setFormMode("edit");
    setIsFormOpen(true);
    setIsViewOpen(false);
  };

  const handleNewOrder = () => {
    setSelectedOrder(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleDeleteClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    setIsDeleting(true);
    try {
      await deleteOrder(selectedOrder.id);
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ordens de Serviço</h1>
            <p className="text-muted-foreground mt-1">Gerencie todas as suas ordens de serviço</p>
          </div>
          <Button className="gap-2" onClick={handleNewOrder}>
            <Plus className="w-4 h-4" />
            Nova OS
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass rounded-xl p-4 mb-6 flex items-center gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, OS ou dispositivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="aguardando_peca">Aguard. Peça</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Empty State */}
        {orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma ordem de serviço</h3>
            <p className="text-muted-foreground mb-4">Crie sua primeira OS para começar</p>
            <Button onClick={handleNewOrder}>
              <Plus className="w-4 h-4 mr-2" />
              Nova OS
            </Button>
          </motion.div>
        )}

        {/* Orders Table */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">OS</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Dispositivo</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Defeito</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Prioridade</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Lucro</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => handleView(order)}
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-primary">{order.os_number}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{order.client?.name || "Cliente não informado"}</p>
                          <p className="text-xs text-muted-foreground">{order.client?.phone || ""}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-foreground">{order.device}</p>
                          <p className="text-xs text-muted-foreground capitalize">{order.category}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate">
                        {order.issue}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", statusConfig[order.status]?.className)}
                        >
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", priorityConfig[order.priority]?.className)}
                        >
                          {priorityConfig[order.priority]?.label || order.priority}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-foreground">
                          R$ {Number(order.total_sale).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "font-medium",
                          Number(order.total_profit) >= 0 ? "text-success" : "text-destructive"
                        )}>
                          R$ {Number(order.total_profit).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleView(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEdit(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteClick(order)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Dialogs */}
      <OrderFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        orderData={formMode === "edit" ? selectedOrder : undefined}
      />

      <OrderViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        order={selectedOrder}
        onEdit={() => selectedOrder && handleEdit(selectedOrder)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ordem de serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a OS "{selectedOrder?.os_number}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
