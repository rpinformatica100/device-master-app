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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Wrench, Loader2 } from "lucide-react";

interface ManualItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: {
    id: string;
    name: string;
    type: "product" | "service";
    cost_price: number;
    sale_price: number;
    quantity: number;
  }) => void;
}

export function ManualItemDialog({ open, onOpenChange, onAdd }: ManualItemDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"product" | "service">("service");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  const handleSubmit = () => {
    if (!name.trim() || !salePrice) return;

    const cost = parseFloat(costPrice) || 0;
    const sale = parseFloat(salePrice) || 0;
    const qty = parseInt(quantity) || 1;

    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      cost_price: cost,
      sale_price: sale,
      quantity: qty,
    });

    // Reset form
    setName("");
    setType("service");
    setCostPrice("");
    setSalePrice("");
    setQuantity("1");
    onOpenChange(false);
  };

  const profit = (parseFloat(salePrice) || 0) - (parseFloat(costPrice) || 0);
  const margin = (parseFloat(salePrice) || 0) > 0 
    ? (profit / (parseFloat(salePrice) || 1)) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Adicionar Item Manual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as "product" | "service")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-success" />
                    Serviço
                  </div>
                </SelectItem>
                <SelectItem value="product">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Produto
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nome / Descrição *</Label>
            <Input
              placeholder={type === "service" ? "Ex: Troca de tela" : "Ex: Película de vidro"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Custo (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Venda (R$) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quantidade</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Preview */}
          {(parseFloat(salePrice) || 0) > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg grid grid-cols-3 gap-2 text-sm text-center">
              <div>
                <p className="text-muted-foreground">Custo</p>
                <p className="font-medium text-destructive">R$ {(parseFloat(costPrice) || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lucro</p>
                <p className="font-medium text-success">R$ {profit.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Margem</p>
                <p className="font-medium text-primary">{margin.toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !salePrice}>
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
