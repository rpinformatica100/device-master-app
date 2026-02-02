import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  MoreVertical, 
  Wrench, 
  DollarSign, 
  Eye,
  Trash2,
  Edit,
  Tag
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  UsedEquipment, 
  EQUIPMENT_STATUS_LABELS, 
  EQUIPMENT_STATUS_COLORS,
  EQUIPMENT_CONDITION_LABELS,
  EquipmentStatus 
} from "@/types/usedEquipment";
import { cn } from "@/lib/utils";

interface UsedEquipmentCardProps {
  equipment: UsedEquipment;
  onView: (equipment: UsedEquipment) => void;
  onEdit: (equipment: UsedEquipment) => void;
  onRepair: (equipment: UsedEquipment) => void;
  onSell: (equipment: UsedEquipment) => void;
  onDelete: (equipment: UsedEquipment) => void;
}

export function UsedEquipmentCard({
  equipment,
  onView,
  onEdit,
  onRepair,
  onSell,
  onDelete,
}: UsedEquipmentCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isAvailable = equipment.status === 'disponivel';
  const isSold = equipment.status === 'vendido';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {equipment.code}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-[9px] px-1.5 py-0",
                      EQUIPMENT_STATUS_COLORS[equipment.status as EquipmentStatus]
                    )}
                  >
                    {EQUIPMENT_STATUS_LABELS[equipment.status as EquipmentStatus]}
                  </Badge>
                </div>
                <p className="font-medium text-sm truncate">{equipment.name}</p>
                {(equipment.brand || equipment.model) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {[equipment.brand, equipment.model].filter(Boolean).join(' ')}
                  </p>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onView(equipment)}>
                  <Eye className="w-3.5 h-3.5 mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
                {!isSold && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(equipment)}>
                      <Edit className="w-3.5 h-3.5 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRepair(equipment)}>
                      <Wrench className="w-3.5 h-3.5 mr-2" />
                      Registrar Reparo
                    </DropdownMenuItem>
                    {isAvailable && (
                      <DropdownMenuItem onClick={() => onSell(equipment)}>
                        <DollarSign className="w-3.5 h-3.5 mr-2" />
                        Vender
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(equipment)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Info Row */}
          <div className="mt-2 pt-2 border-t border-border grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Custo</p>
              <p className="text-xs font-medium">{formatCurrency(Number(equipment.total_cost))}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Condição</p>
              <p className="text-xs font-medium">
                {EQUIPMENT_CONDITION_LABELS[equipment.condition as keyof typeof EQUIPMENT_CONDITION_LABELS] || equipment.condition}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">
                {isSold ? 'Lucro' : 'Reparo'}
              </p>
              <p className={cn(
                "text-xs font-medium",
                isSold && equipment.profit && equipment.profit > 0 && "text-green-600 dark:text-green-400"
              )}>
                {isSold 
                  ? formatCurrency(Number(equipment.profit || 0))
                  : formatCurrency(Number(equipment.repair_cost))
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
