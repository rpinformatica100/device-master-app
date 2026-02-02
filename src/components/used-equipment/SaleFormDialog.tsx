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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { UsedEquipment, SaleFormData } from "@/types/usedEquipment";
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_debito', label: 'Cartão Débito' },
  { value: 'cartao_credito', label: 'Cartão Crédito' },
  { value: 'transferencia', label: 'Transferência' },
];

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: UsedEquipment | null;
  onSubmit: (equipmentId: string, data: SaleFormData) => Promise<any>;
}

export function SaleFormDialog({
  open,
  onOpenChange,
  equipment,
  onSubmit,
}: SaleFormDialogProps) {
  const { clients } = useClients();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SaleFormData>({
    client_id: "",
    amount: 0,
    payment_method: "pix",
    warranty_days: 90,
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
        client_id: "",
        amount: 0,
        payment_method: "pix",
        warranty_days: 90,
        notes: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const profit = equipment ? formData.amount - Number(equipment.total_cost) : 0;
  const margin = equipment && formData.amount > 0 
    ? ((profit / formData.amount) * 100).toFixed(1)
    : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Venda</DialogTitle>
          {equipment && (
            <p className="text-sm text-muted-foreground">
              {equipment.code} - {equipment.name}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_id">Comprador</Label>
            <Select
              value={formData.client_id || "none"}
              onValueChange={(value) => setFormData({ ...formData, client_id: value === "none" ? "" : value })}
            >
              <SelectTrigger id="client_id">
                <SelectValue placeholder="Selecione o cliente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não informado</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="amount">Valor de Venda *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="payment_method">Forma de Pagamento *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger id="payment_method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="warranty_days">Garantia (dias)</Label>
            <Input
              id="warranty_days"
              type="number"
              value={formData.warranty_days}
              onChange={(e) => setFormData({ ...formData, warranty_days: Number(e.target.value) || 0 })}
              min={0}
            />
          </div>

          {/* Profit Preview */}
          {equipment && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Custo Total:</span>
                <span>{formatCurrency(Number(equipment.total_cost))}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Valor de Venda:</span>
                <span>{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-medium flex items-center gap-1">
                  {profit >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  Lucro:
                </span>
                <span className={cn(
                  "font-bold",
                  profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {formatCurrency(profit)} ({margin}%)
                </span>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais sobre a venda..."
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
            <Button 
              type="submit" 
              disabled={loading || formData.amount <= 0} 
              className="flex-1"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Venda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
