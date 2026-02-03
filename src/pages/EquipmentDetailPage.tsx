import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Smartphone,
  Wrench,
  DollarSign,
  ShoppingCart,
  FileText,
  Edit,
  MoreVertical,
  Trash2,
  Calendar,
  Package,
  User,
  Clock,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { EquipmentFormDialog } from "@/components/used-equipment/EquipmentFormDialog";
import { RepairFormDialog } from "@/components/used-equipment/RepairFormDialog";
import { SaleFormDialog } from "@/components/used-equipment/SaleFormDialog";
import { useUsedEquipment } from "@/hooks/useUsedEquipment";
import {
  UsedEquipment,
  EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_STATUS_COLORS,
  EQUIPMENT_CONDITION_LABELS,
  EQUIPMENT_CATEGORY_LABELS,
  EquipmentStatus,
  EquipmentCondition,
  EquipmentCategory,
} from "@/types/usedEquipment";
import { cn } from "@/lib/utils";

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    fetchEquipmentWithDetails,
    updateEquipment,
    addRepair,
    sellEquipment,
    deleteEquipment,
  } = useUsedEquipment();

  const [equipment, setEquipment] = useState<UsedEquipment | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [repairDialogOpen, setRepairDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadEquipment = async () => {
    if (!id) return;
    setLoading(true);
    const data = await fetchEquipmentWithDetails(id);
    setEquipment(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEquipment();
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatDateTime = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const handleEdit = async (data: any) => {
    if (!equipment) return;
    await updateEquipment(equipment.id, data);
    loadEquipment();
  };

  const handleRepair = async (equipmentId: string, data: any) => {
    await addRepair(equipmentId, data);
    loadEquipment();
  };

  const handleSell = async (equipmentId: string, data: any) => {
    await sellEquipment(equipmentId, data);
    loadEquipment();
  };

  const handleDelete = async () => {
    if (!equipment) return;
    await deleteEquipment(equipment.id);
    navigate("/seminovos");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-3 sm:p-4 lg:p-6 flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!equipment) {
    return (
      <MainLayout>
        <div className="p-3 sm:p-4 lg:p-6 text-center">
          <p className="text-muted-foreground">Equipamento não encontrado</p>
          <Button variant="outline" onClick={() => navigate("/seminovos")} className="mt-4">
            Voltar
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isAvailable = equipment.status === "disponivel";
  const isSold = equipment.status === "vendido";

  // Build timeline events
  const timelineEvents: Array<{
    type: "purchase" | "repair" | "sale";
    date: string;
    title: string;
    description: string;
    amount?: number;
    icon: React.ReactNode;
    color: string;
  }> = [];

  if (equipment.purchases?.[0]) {
    const p = equipment.purchases[0];
    timelineEvents.push({
      type: "purchase",
      date: p.created_at,
      title: "Aquisição",
      description: p.client ? `Comprado de ${p.client.name}` : p.source_type === 'os' ? 'Retirado de OS' : "Compra direta",
      amount: p.amount,
      icon: <ShoppingCart className="w-4 h-4" />,
      color: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
    });
  }

  equipment.repairs?.forEach((r) => {
    timelineEvents.push({
      type: "repair",
      date: r.created_at,
      title: "Reparo",
      description: r.description,
      amount: r.total_cost,
      icon: <Wrench className="w-4 h-4" />,
      color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
    });
  });

  if (equipment.sale) {
    timelineEvents.push({
      type: "sale",
      date: equipment.sale.created_at,
      title: "Venda",
      description: equipment.sale.client ? `Vendido para ${equipment.sale.client.name}` : "Venda direta",
      amount: equipment.sale.amount,
      icon: <DollarSign className="w-4 h-4" />,
      color: "text-green-500 bg-green-100 dark:bg-green-900/30",
    });
  }

  timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <MainLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/seminovos")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">{equipment.code}</span>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", EQUIPMENT_STATUS_COLORS[equipment.status as EquipmentStatus])}
                >
                  {EQUIPMENT_STATUS_LABELS[equipment.status as EquipmentStatus]}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{equipment.name}</h1>
            </div>
          </div>

          <div className="flex gap-2">
            {!isSold && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRepairDialogOpen(true)}
                >
                  <Wrench className="w-4 h-4 mr-1" />
                  Reparo
                </Button>
                {isAvailable && (
                  <Button size="sm" onClick={() => setSaleDialogOpen(true)}>
                    <DollarSign className="w-4 h-4 mr-1" />
                    Vender
                  </Button>
                )}
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isSold && (
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate(`/seminovos/recibo/${equipment.id}?type=compra&details=true`)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Recibo de Compra
                </DropdownMenuItem>
                {isSold && (
                  <DropdownMenuItem onClick={() => navigate(`/seminovos/recibo/${equipment.id}?type=venda&details=true&history=true`)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Recibo de Venda
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Equipment Info */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Informações do Equipamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Marca</p>
                  <p className="font-medium">{equipment.brand || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Modelo</p>
                  <p className="font-medium">{equipment.model || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Categoria</p>
                  <p className="font-medium">
                    {EQUIPMENT_CATEGORY_LABELS[equipment.category as EquipmentCategory] || equipment.category}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Condição</p>
                  <p className="font-medium">
                    {EQUIPMENT_CONDITION_LABELS[equipment.condition as EquipmentCondition] || equipment.condition}
                  </p>
                </div>
                {equipment.serial_number && (
                  <div>
                    <p className="text-xs text-muted-foreground">Nº de Série</p>
                    <p className="font-mono text-sm">{equipment.serial_number}</p>
                  </div>
                )}
                {equipment.imei && (
                  <div>
                    <p className="text-xs text-muted-foreground">IMEI</p>
                    <p className="font-mono text-sm">{equipment.imei}</p>
                  </div>
                )}
              </div>

              {equipment.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm">{equipment.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Financial Summary */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Resumo Financeiro</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Aquisição</p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(Number(equipment.purchase_price))}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Reparos</p>
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(Number(equipment.repair_cost))}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Custo Total</p>
                    <p className="font-semibold">
                      {formatCurrency(Number(equipment.total_cost))}
                    </p>
                  </div>
                  {isSold && equipment.profit !== null && (
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Lucro</p>
                      <p className={cn("font-semibold", Number(equipment.profit) >= 0 ? "text-green-600" : "text-red-600")}>
                        {formatCurrency(Number(equipment.profit))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timelineEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum evento registrado
                </p>
              ) : (
                <div className="relative space-y-4">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", event.color)}>
                        {event.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm">{event.title}</p>
                          {event.amount !== undefined && (
                            <p className="text-sm font-medium">{formatCurrency(event.amount)}</p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(event.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <EquipmentFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        equipment={equipment}
        onSubmit={handleEdit}
      />

      <RepairFormDialog
        open={repairDialogOpen}
        onOpenChange={setRepairDialogOpen}
        equipment={equipment}
        onSubmit={handleRepair}
      />

      <SaleFormDialog
        open={saleDialogOpen}
        onOpenChange={setSaleDialogOpen}
        equipment={equipment}
        onSubmit={handleSell}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Equipamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{equipment.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
