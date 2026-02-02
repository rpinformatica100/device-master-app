import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Smartphone,
  Package,
  DollarSign,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { StatCard } from "@/components/dashboard/StatCard";
import { UsedEquipmentCard } from "@/components/shared/UsedEquipmentCard";
import { EquipmentFormDialog } from "@/components/used-equipment/EquipmentFormDialog";
import { RepairFormDialog } from "@/components/used-equipment/RepairFormDialog";
import { SaleFormDialog } from "@/components/used-equipment/SaleFormDialog";
import { EquipmentViewDialog } from "@/components/used-equipment/EquipmentViewDialog";
import { useUsedEquipment } from "@/hooks/useUsedEquipment";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  UsedEquipment,
  EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_CATEGORY_LABELS,
  EquipmentStatus,
} from "@/types/usedEquipment";
import { cn } from "@/lib/utils";

export default function UsedEquipmentPage() {
  const isMobile = useIsMobile();
  const {
    equipment,
    loading,
    summary,
    createEquipment,
    updateEquipment,
    addRepair,
    sellEquipment,
    deleteEquipment,
    fetchEquipmentWithDetails,
  } = useUsedEquipment();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [repairDialogOpen, setRepairDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<UsedEquipment | null>(null);

  // Filter equipment
  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch =
      search === "" ||
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.code.toLowerCase().includes(search.toLowerCase()) ||
      eq.brand?.toLowerCase().includes(search.toLowerCase()) ||
      eq.model?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || eq.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || eq.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleView = (eq: UsedEquipment) => {
    setSelectedEquipment(eq);
    setViewDialogOpen(true);
  };

  const handleEdit = (eq: UsedEquipment) => {
    setSelectedEquipment(eq);
    setFormDialogOpen(true);
  };

  const handleRepair = (eq: UsedEquipment) => {
    setSelectedEquipment(eq);
    setRepairDialogOpen(true);
  };

  const handleSell = (eq: UsedEquipment) => {
    setSelectedEquipment(eq);
    setSaleDialogOpen(true);
  };

  const handleDelete = (eq: UsedEquipment) => {
    setSelectedEquipment(eq);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedEquipment) {
      await deleteEquipment(selectedEquipment.id);
      setDeleteDialogOpen(false);
      setSelectedEquipment(null);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedEquipment) {
      await updateEquipment(selectedEquipment.id, data);
    } else {
      await createEquipment(data);
    }
    setSelectedEquipment(null);
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Seminovos</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Gerencie equipamentos usados
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedEquipment(null);
              setFormDialogOpen(true);
            }}
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="w-4 h-4 mr-1" />
            Cadastrar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            title="Em Estoque"
            value={summary.disponivel.toString()}
            icon={Package}
            change="Disponíveis para venda"
            changeType="neutral"
          />
          <StatCard
            title="Em Reparo"
            value={summary.emReparo.toString()}
            icon={Wrench}
            change="Aguardando conserto"
            changeType="neutral"
          />
          <StatCard
            title="Valor Estoque"
            value={formatCurrency(summary.valorEstoque)}
            icon={DollarSign}
            change="Custo total investido"
            changeType="neutral"
          />
          <StatCard
            title="Lucro Total"
            value={formatCurrency(summary.lucroTotal)}
            icon={TrendingUp}
            change={`${summary.vendido} vendidos`}
            changeType={summary.lucroTotal > 0 ? "positive" : "neutral"}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, código, marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(EQUIPMENT_CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Equipment List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">
              {search || statusFilter !== "all" || categoryFilter !== "all"
                ? "Nenhum equipamento encontrado"
                : "Nenhum equipamento cadastrado"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== "all" || categoryFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Comece cadastrando seu primeiro equipamento seminovo"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredEquipment.map((eq) => (
              <UsedEquipmentCard
                key={eq.id}
                equipment={eq}
                onView={handleView}
                onEdit={handleEdit}
                onRepair={handleRepair}
                onSell={handleSell}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EquipmentFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        equipment={selectedEquipment}
        onSubmit={handleFormSubmit}
      />

      <RepairFormDialog
        open={repairDialogOpen}
        onOpenChange={setRepairDialogOpen}
        equipment={selectedEquipment}
        onSubmit={addRepair}
      />

      <SaleFormDialog
        open={saleDialogOpen}
        onOpenChange={setSaleDialogOpen}
        equipment={selectedEquipment}
        onSubmit={sellEquipment}
      />

      <EquipmentViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        equipment={selectedEquipment}
        onLoadDetails={fetchEquipmentWithDetails}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Equipamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{selectedEquipment?.name}"? Esta ação não
              pode ser desfeita e todo o histórico será perdido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
