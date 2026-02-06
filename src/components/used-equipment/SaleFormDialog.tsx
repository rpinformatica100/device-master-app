import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, ClipboardCheck } from "lucide-react";
import { UsedEquipment, SaleFormData } from "@/types/usedEquipment";
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";
import { MobileChecklist } from "@/components/orders/MobileChecklist";

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

export function SaleFormDialog({ open, onOpenChange, equipment, onSubmit }: SaleFormDialogProps) {
  const { clients } = useClients();
  const [loading, setLoading] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [saleChecklist, setSaleChecklist] = useState<Record<string, boolean | null>>({});
  const [checklistObservations, setChecklistObservations] = useState("");
  const [formData, setFormData] = useState<SaleFormData>({
    client_id: "", amount: 0, payment_method: "pix", warranty_days: 90, notes: "",
  });

  const isMobile = equipment?.category === 'smartphone' || equipment?.category === 'tablet';
  const hasChecklist = Object.values(saleChecklist).some(v => v !== null);

  const handleChecklistSave = (checklist: Record<string, boolean | null>, obs: string) => {
    setSaleChecklist(checklist);
    setChecklistObservations(obs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment) return;
    setLoading(true);
    try {
      // Include sale checklist in notes or as separate data
      const saleData = {
        ...formData,
        notes: formData.notes + (hasChecklist ? `\n[CHECKLIST_SAIDA:${JSON.stringify(saleChecklist)}]` : ''),
      };
      await onSubmit(equipment.id, saleData);
      onOpenChange(false);
      setFormData({ client_id: "", amount: 0, payment_method: "pix", warranty_days: 90, notes: "" });
      setSaleChecklist({});
      setChecklistObservations("");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const profit = equipment ? formData.amount - Number(equipment.total_cost) : 0;
  const margin = equipment && formData.amount > 0 ? ((profit / formData.amount) * 100).toFixed(1) : "0";

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">Registrar Venda</DialogTitle>
          {equipment && <p className="text-xs text-muted-foreground">{equipment.code} - {equipment.name}</p>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">Comprador</Label>
            <Select value={formData.client_id || "none"} onValueChange={(v) => setFormData({ ...formData, client_id: v === "none" ? "" : v })}>
              <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não informado</SelectItem>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Valor de Venda *</Label>
              <Input type="number" step="0.01" min="0" className="text-sm h-9" value={formData.amount || ""} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })} placeholder="0,00" />
            </div>
            <div>
              <Label className="text-xs">Forma de Pagamento *</Label>
              <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Garantia (dias)</Label>
            <Input type="number" className="text-sm h-9" value={formData.warranty_days} onChange={(e) => setFormData({ ...formData, warranty_days: Number(e.target.value) || 0 })} min={0} />
          </div>

          {/* Checklist de Saída */}
          {isMobile && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs flex items-center gap-1.5">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Checklist de Saída
                </Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowChecklist(true)}>
                  {hasChecklist ? "Editar" : "Fazer Checklist"}
                </Button>
              </div>
              {hasChecklist && (
                <div className="p-2 bg-muted/50 rounded-lg text-xs">
                  <span className="text-green-600">✓ {Object.values(saleChecklist).filter(v => v === true).length} OK</span>
                  <span className="ml-3 text-red-600">✗ {Object.values(saleChecklist).filter(v => v === false).length} Defeitos</span>
                </div>
              )}
            </div>
          )}

          {equipment && (
            <div className="p-2 bg-muted/50 rounded-lg space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Custo Total:</span><span>{formatCurrency(Number(equipment.total_cost))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Valor de Venda:</span><span>{formatCurrency(formData.amount)}</span></div>
              <div className="flex justify-between pt-1 border-t border-border">
                <span className="font-medium flex items-center gap-1">
                  {profit >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-green-600" /> : <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
                  Lucro:
                </span>
                <span className={cn("font-bold", profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  {formatCurrency(profit)} ({margin}%)
                </span>
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs">Observações</Label>
            <Textarea className="text-sm" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Informações adicionais..." rows={2} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 text-xs h-9">Cancelar</Button>
            <Button type="submit" disabled={loading || formData.amount <= 0} className="flex-1 text-xs h-9">
              {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Confirmar Venda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <MobileChecklist
      open={showChecklist}
      onOpenChange={setShowChecklist}
      onSave={handleChecklistSave}
      initialChecklist={saleChecklist}
      initialObservations={checklistObservations}
    />
    </>
  );
}
