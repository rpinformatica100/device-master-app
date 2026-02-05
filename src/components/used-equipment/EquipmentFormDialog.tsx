import { useState, useEffect } from "react";
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
import { Loader2, ClipboardCheck, X } from "lucide-react";
import { 
  UsedEquipment,
  EquipmentFormData,
  PurchaseFormData,
  EQUIPMENT_CATEGORY_LABELS,
  EQUIPMENT_CONDITION_LABELS 
} from "@/types/usedEquipment";
import { useClients } from "@/hooks/useClients";
import { MobileChecklist } from "@/components/orders/MobileChecklist";

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: UsedEquipment | null;
  onSubmit: (data: EquipmentFormData & PurchaseFormData & { checklist?: Record<string, boolean | null>; checklist_observations?: string }) => Promise<any>;
}

export function EquipmentFormDialog({
  open,
  onOpenChange,
  equipment,
  onSubmit,
}: EquipmentFormDialogProps) {
  const { clients } = useClients();
  const [loading, setLoading] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [mobileChecklist, setMobileChecklist] = useState<Record<string, boolean | null>>({});
  const [checklistObservations, setChecklistObservations] = useState("");
  
  const [formData, setFormData] = useState<EquipmentFormData & PurchaseFormData>({
    name: "",
    brand: "",
    model: "",
    serial_number: "",
    imei: "",
    category: "smartphone",
    condition: "bom",
    notes: "",
    source_type: "compra",
    amount: 0,
    client_id: "",
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        brand: equipment.brand || "",
        model: equipment.model || "",
        serial_number: equipment.serial_number || "",
        imei: equipment.imei || "",
        category: equipment.category,
        condition: equipment.condition,
        notes: equipment.notes || "",
        source_type: "compra",
        amount: Number(equipment.purchase_price),
        client_id: "",
      });
      // Load existing checklist if any
      if (equipment.checklist) {
        const checklistData = typeof equipment.checklist === 'string' 
          ? JSON.parse(equipment.checklist) 
          : equipment.checklist;
        if (checklistData.items) {
          setMobileChecklist(checklistData.items);
        }
        if (checklistData.observations) {
          setChecklistObservations(checklistData.observations);
        }
      }
    } else {
      setFormData({
        name: "",
        brand: "",
        model: "",
        serial_number: "",
        imei: "",
        category: "smartphone",
        condition: "bom",
        notes: "",
        source_type: "compra",
        amount: 0,
        client_id: "",
      });
      setMobileChecklist({});
      setChecklistObservations("");
    }
  }, [equipment, open]);

  const handleChecklistSave = (checklist: Record<string, boolean | null>, observations: string) => {
    setMobileChecklist(checklist);
    setChecklistObservations(observations);
  };

  const hasChecklist = Object.values(mobileChecklist).some(v => v !== null);
  const checklistDefects = Object.values(mobileChecklist).filter(v => v === false).length;
  const isMobileCategory = formData.category === 'smartphone' || formData.category === 'tablet';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        checklist: hasChecklist ? mobileChecklist : undefined,
        checklist_observations: hasChecklist ? checklistObservations : undefined,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!equipment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Equipamento" : "Cadastrar Equipamento Seminovo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Nome/Descrição *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: iPhone 12 Pro Max 256GB"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Apple"
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="A2411"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EQUIPMENT_CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="condition">Condição *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EQUIPMENT_CONDITION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="serial_number">Nº de Série</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="XXXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="imei">IMEI</Label>
                <Input
                  id="imei"
                  value={formData.imei}
                  onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                  placeholder="000000000000000"
                />
              </div>
            </div>
          </div>

          {/* Purchase Info - Only for new equipment */}
          {!isEditing && (
            <div className="space-y-3 pt-3 border-t">
              <h4 className="font-medium text-sm">Informações de Aquisição</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="source_type">Origem *</Label>
                  <Select
                    value={formData.source_type}
                    onValueChange={(value: 'compra' | 'os') => setFormData({ ...formData, source_type: value })}
                  >
                    <SelectTrigger id="source_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compra">Compra Direta</SelectItem>
                      <SelectItem value="os">Retirado de OS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Valor Pago *</Label>
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
              </div>

              <div>
                <Label htmlFor="client_id">Fornecedor/Comprado de</Label>
                <Select
                  value={formData.client_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger id="client_id">
                    <SelectValue placeholder="Selecione..." />
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
            </div>
          )}

          {/* Mobile Checklist - Only for mobile categories */}
          {isMobileCategory && (
            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-xs">
                  <ClipboardCheck className="w-4 h-4" />
                  Checklist de Entrada (Opcional)
                </Label>
                <div className="flex gap-2">
                  {hasChecklist && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive h-7 text-xs"
                      onClick={() => {
                        setMobileChecklist({});
                        setChecklistObservations("");
                      }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpar
                    </Button>
                  )}
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowChecklist(true)}
                  >
                    <ClipboardCheck className="w-3 h-3 mr-1" />
                    {hasChecklist ? "Editar" : "Fazer Checklist"}
                  </Button>
                </div>
              </div>
              {hasChecklist && (
                <div className="p-2 bg-muted/50 rounded-lg text-xs">
                  <div className="flex gap-4">
                    <span className="text-success">
                      ✓ {Object.values(mobileChecklist).filter(v => v === true).length} OK
                    </span>
                    <span className="text-destructive">
                      ✗ {checklistDefects} Defeitos
                    </span>
                  </div>
                  {checklistObservations && (
                    <p className="text-muted-foreground mt-1">{checklistObservations}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="notes" className="text-xs">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais..."
              rows={2}
              className="text-sm"
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
              {isEditing ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Mobile Checklist Dialog */}
      <MobileChecklist
        open={showChecklist}
        onOpenChange={setShowChecklist}
        onSave={handleChecklistSave}
        initialChecklist={mobileChecklist}
        initialObservations={checklistObservations}
      />
    </Dialog>
  );
}
