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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Package, Wrench as WrenchIcon, PenLine } from "lucide-react";
import { UsedEquipment, RepairFormData } from "@/types/usedEquipment";
import { RepairItemFormData } from "@/types/repairItem";
import { useProducts } from "@/hooks/useProducts";
import { useServices } from "@/hooks/useServices";
import { cn } from "@/lib/utils";

interface RepairFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: UsedEquipment | null;
  onSubmit: (equipmentId: string, data: RepairFormData & { items?: RepairItemFormData[] }) => Promise<any>;
}

export function RepairFormDialog({
  open,
  onOpenChange,
  equipment,
  onSubmit,
}: RepairFormDialogProps) {
  const { products } = useProducts();
  const { services } = useServices();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RepairFormData>({
    description: "",
    parts_cost: 0,
    labor_cost: 0,
    notes: "",
  });

  const [items, setItems] = useState<RepairItemFormData[]>([]);
  const [addItemType, setAddItemType] = useState<'product' | 'service' | 'manual'>('product');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [manualName, setManualName] = useState('');
  const [manualCost, setManualCost] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        description: "",
        parts_cost: 0,
        labor_cost: 0,
        notes: "",
      });
      setItems([]);
      setSelectedItemId('');
      setManualName('');
      setManualCost(0);
      setQuantity(1);
    }
  }, [open]);

  const handleAddItem = () => {
    if (addItemType === 'manual') {
      if (!manualName.trim()) return;
      setItems([...items, {
        item_type: 'manual',
        name: manualName,
        quantity: 1,
        cost_price: manualCost,
      }]);
      setManualName('');
      setManualCost(0);
    } else if (addItemType === 'product') {
      const product = products.find(p => p.id === selectedItemId);
      if (!product) return;
      // Check if already added
      const existing = items.find(i => i.item_id === product.id && i.item_type === 'product');
      if (existing) {
        setItems(items.map(i => 
          i.item_id === product.id && i.item_type === 'product'
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ));
      } else {
        setItems([...items, {
          item_type: 'product',
          item_id: product.id,
          name: product.name,
          quantity,
          cost_price: Number(product.cost_price),
        }]);
      }
      setSelectedItemId('');
      setQuantity(1);
    } else if (addItemType === 'service') {
      const service = services.find(s => s.id === selectedItemId);
      if (!service) return;
      // Check if already added
      const existing = items.find(i => i.item_id === service.id && i.item_type === 'service');
      if (existing) return;
      setItems([...items, {
        item_type: 'service',
        item_id: service.id,
        name: service.name,
        quantity: 1,
        cost_price: Number(service.cost_price),
      }]);
      setSelectedItemId('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculate totals from items
  const partsCostFromItems = items
    .filter(i => i.item_type === 'product' || (i.item_type === 'manual' && !services.some(s => s.name === i.name)))
    .reduce((sum, i) => sum + (i.cost_price * i.quantity), 0);

  const laborCostFromItems = items
    .filter(i => i.item_type === 'service')
    .reduce((sum, i) => sum + i.cost_price, 0);

  const manualCosts = items
    .filter(i => i.item_type === 'manual')
    .reduce((sum, i) => sum + i.cost_price, 0);

  const totalCostFromItems = partsCostFromItems + laborCostFromItems + manualCosts;
  const totalCost = totalCostFromItems + (formData.parts_cost || 0) + (formData.labor_cost || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment) return;

    setLoading(true);
    try {
      await onSubmit(equipment.id, {
        ...formData,
        parts_cost: partsCostFromItems + (formData.parts_cost || 0),
        labor_cost: laborCostFromItems + (formData.labor_cost || 0),
        items,
      });
      onOpenChange(false);
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

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="w-3 h-3" />;
      case 'service': return <WrenchIcon className="w-3 h-3" />;
      default: return <PenLine className="w-3 h-3" />;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'service': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
              placeholder="Ex: Troca de tela e bateria"
              required
            />
          </div>

          {/* Add Items Section */}
          <div className="space-y-3">
            <Label>Peças e Serviços</Label>
            
            {/* Item Type Selector */}
            <div className="flex gap-1">
              <Button
                type="button"
                variant={addItemType === 'product' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddItemType('product')}
                className="flex-1"
              >
                <Package className="w-3 h-3 mr-1" />
                Estoque
              </Button>
              <Button
                type="button"
                variant={addItemType === 'service' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddItemType('service')}
                className="flex-1"
              >
                <WrenchIcon className="w-3 h-3 mr-1" />
                Serviço
              </Button>
              <Button
                type="button"
                variant={addItemType === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddItemType('manual')}
                className="flex-1"
              >
                <PenLine className="w-3 h-3 mr-1" />
                Manual
              </Button>
            </div>

            {/* Add Item Form */}
            <div className="flex gap-2">
              {addItemType === 'manual' ? (
                <>
                  <Input
                    placeholder="Nome do item"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Custo"
                    value={manualCost || ''}
                    onChange={(e) => setManualCost(Number(e.target.value) || 0)}
                    className="w-24"
                  />
                </>
              ) : addItemType === 'product' ? (
                <>
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecionar produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.stock > 0).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.stock} em estoque) - {formatCurrency(Number(p.cost_price))}
                        </SelectItem>
                      ))}
                      {products.filter(p => p.stock > 0).length === 0 && (
                        <SelectItem value="" disabled>Nenhum produto em estoque</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                    className="w-16"
                    placeholder="Qtd"
                  />
                </>
              ) : (
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecionar serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} - {formatCurrency(Number(s.cost_price))}
                      </SelectItem>
                    ))}
                    {services.length === 0 && (
                      <SelectItem value="" disabled>Nenhum serviço cadastrado</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={handleAddItem}
                disabled={
                  (addItemType === 'manual' && !manualName.trim()) ||
                  ((addItemType === 'product' || addItemType === 'service') && !selectedItemId)
                }
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div className="border rounded-lg divide-y">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Badge variant="secondary" className={cn("text-[9px] px-1", getItemColor(item.item_type))}>
                        {getItemIcon(item.item_type)}
                      </Badge>
                      <span className="text-sm truncate">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatCurrency(item.cost_price * item.quantity)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Additional Manual Costs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="parts_cost">Outras Peças (R$)</Label>
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
              <Label htmlFor="labor_cost">Outra Mão de Obra (R$)</Label>
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

          {/* Cost Summary */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-1">
            {items.length > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Itens do estoque/serviços:</span>
                <span>{formatCurrency(totalCostFromItems)}</span>
              </div>
            )}
            {((formData.parts_cost || 0) > 0 || (formData.labor_cost || 0) > 0) && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Custos adicionais:</span>
                <span>{formatCurrency((formData.parts_cost || 0) + (formData.labor_cost || 0))}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1 border-t">
              <span className="font-medium">Custo Total do Reparo:</span>
              <span className="font-semibold">{formatCurrency(totalCost)}</span>
            </div>
            {equipment && (
              <div className="flex justify-between items-center text-sm text-primary">
                <span>Novo Custo Total do Equipamento:</span>
                <span className="font-semibold">
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
