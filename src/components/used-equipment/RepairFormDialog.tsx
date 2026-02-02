import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { UsedEquipment, RepairFormData } from "@/types/usedEquipment";

interface RepairFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: UsedEquipment | null;
  onSubmit: (equipmentId: string, data: RepairFormData) => Promise<any>;
}

export function RepairFormDialog({
  open,
  onOpenChange,
  equipment,
  onSubmit,
}: RepairFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RepairFormData>({
    description: "",
    parts_cost: 0,
    labor_cost: 0,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment) return;
    
    setLoading(true);
    try {
      await onSubmit(equipment.id, formData);
      onOpenChange(false);
      setFormData({
        description: "",
        parts_cost: 0,
        labor_cost: 0,
        notes: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalCost = (formData.parts_cost || 0) + (formData.labor_cost || 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Reparo</DialogTitle>
          {equipment && (
            <p className="text-sm text-muted-foreground">
              {equipment.code} - {equipment.name}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição do Reparo *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Troca de tela"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="parts_cost">Custo de Peças</Label>
              <Input
                id="parts_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.parts_cost || ""}
                onChange={(e) => setFormData({ ...formData, parts_cost: Number(e.target.value) || 0 })}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="labor_cost">Mão de Obra</Label>
              <Input
                id="labor_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.labor_cost || ""}
                onChange={(e) => setFormData({ ...formData, labor_cost: Number(e.target.value) || 0 })}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Custo Total do Reparo:</span>
              <span className="font-semibold">{formatCurrency(totalCost)}</span>
            </div>
            {equipment && (
              <div className="flex justify-between items-center mt-1 pt-1 border-t border-border">
                <span className="text-sm text-muted-foreground">Novo Custo Total do Equipamento:</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(Number(equipment.total_cost) + totalCost)}
                </span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalhes adicionais..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Registrar Reparo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
