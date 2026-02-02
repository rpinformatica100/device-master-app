import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Smartphone, 
  ShoppingCart, 
  Wrench, 
  DollarSign, 
  Clock,
  User,
  Calendar,
  FileText
} from "lucide-react";
import { 
  UsedEquipment,
  EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_STATUS_COLORS,
  EQUIPMENT_CONDITION_LABELS,
  EQUIPMENT_CATEGORY_LABELS,
  EquipmentStatus
} from "@/types/usedEquipment";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EquipmentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: UsedEquipment | null;
  onLoadDetails: (id: string) => Promise<UsedEquipment | null>;
}

export function EquipmentViewDialog({
  open,
  onOpenChange,
  equipment: initialEquipment,
  onLoadDetails,
}: EquipmentViewDialogProps) {
  const [equipment, setEquipment] = useState<UsedEquipment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && initialEquipment) {
      setLoading(true);
      onLoadDetails(initialEquipment.id).then((data) => {
        setEquipment(data);
        setLoading(false);
      });
    }
  }, [open, initialEquipment, onLoadDetails]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (!equipment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">{equipment.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs text-muted-foreground">{equipment.code}</span>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    EQUIPMENT_STATUS_COLORS[equipment.status as EquipmentStatus]
                  )}
                >
                  {EQUIPMENT_STATUS_LABELS[equipment.status as EquipmentStatus]}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-80px)]">
          <div className="px-4 pb-4 space-y-4">
            {/* Equipment Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {equipment.brand && (
                <div>
                  <span className="text-muted-foreground">Marca:</span>
                  <span className="ml-1 font-medium">{equipment.brand}</span>
                </div>
              )}
              {equipment.model && (
                <div>
                  <span className="text-muted-foreground">Modelo:</span>
                  <span className="ml-1 font-medium">{equipment.model}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Categoria:</span>
                <span className="ml-1 font-medium">
                  {EQUIPMENT_CATEGORY_LABELS[equipment.category as keyof typeof EQUIPMENT_CATEGORY_LABELS]}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Condição:</span>
                <span className="ml-1 font-medium">
                  {EQUIPMENT_CONDITION_LABELS[equipment.condition as keyof typeof EQUIPMENT_CONDITION_LABELS]}
                </span>
              </div>
              {equipment.serial_number && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Nº Série:</span>
                  <span className="ml-1 font-mono text-xs">{equipment.serial_number}</span>
                </div>
              )}
              {equipment.imei && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">IMEI:</span>
                  <span className="ml-1 font-mono text-xs">{equipment.imei}</span>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Resumo Financeiro</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compra:</span>
                  <span>{formatCurrency(Number(equipment.purchase_price))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reparos:</span>
                  <span>{formatCurrency(Number(equipment.repair_cost))}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Custo Total:</span>
                  <span>{formatCurrency(Number(equipment.total_cost))}</span>
                </div>
                {equipment.status === 'vendido' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venda:</span>
                      <span>{formatCurrency(Number(equipment.sale_price || 0))}</span>
                    </div>
                    <div className="col-span-2 flex justify-between pt-2 border-t border-border">
                      <span className="font-medium">Lucro:</span>
                      <span className={cn(
                        "font-bold",
                        (equipment.profit || 0) >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(Number(equipment.profit || 0))}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div>
              <h4 className="font-medium text-sm mb-3">Histórico</h4>
              <div className="space-y-3">
                {/* Purchases */}
                {equipment.purchases?.map((purchase) => (
                  <div key={purchase.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {purchase.source_type === 'compra' ? 'Compra' : 'Retirado de OS'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(Number(purchase.amount))}
                        {purchase.client && ` • De: ${purchase.client.name}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(purchase.created_at)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Repairs */}
                {equipment.repairs?.map((repair) => (
                  <div key={repair.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{repair.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Peças: {formatCurrency(Number(repair.parts_cost))} • 
                        MO: {formatCurrency(Number(repair.labor_cost))} • 
                        Total: {formatCurrency(Number(repair.total_cost))}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(repair.created_at)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Sale */}
                {equipment.sale && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Vendido</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(Number(equipment.sale.amount))}
                        {equipment.sale.client && ` • Para: ${equipment.sale.client.name}`}
                      </p>
                      {equipment.sale.warranty_days > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Garantia: {equipment.sale.warranty_days} dias
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(equipment.sale.created_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {equipment.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Observações
                  </h4>
                  <p className="text-sm text-muted-foreground">{equipment.notes}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
