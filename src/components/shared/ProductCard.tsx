import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Edit, Trash2, AlertTriangle, Package } from "lucide-react";

const productCategoryColors: Record<string, string> = {
  smartphone: "bg-info/20 text-info border-info/30",
  notebook: "bg-success/20 text-success border-success/30",
  tablet: "bg-warning/20 text-warning border-warning/30",
  desktop: "bg-primary/20 text-primary border-primary/30",
};

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  stock: number;
  min_stock: number;
  cost_price: number;
  sale_price: number;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const isLowStock = product.stock <= product.min_stock;

  return (
    <div className={cn(
      "glass rounded-lg p-3 space-y-2",
      isLowStock && "border-destructive/50"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            isLowStock ? "bg-destructive/10" : "bg-primary/10"
          )}>
            {isLowStock ? (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            ) : (
              <Package className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
            {product.sku && (
              <p className="text-[10px] font-mono text-muted-foreground">{product.sku}</p>
            )}
          </div>
        </div>
        {product.category && (
          <Badge 
            variant="outline" 
            className={cn("text-[10px] shrink-0 capitalize px-1.5 py-0", productCategoryColors[product.category])}
          >
            {product.category}
          </Badge>
        )}
      </div>

      {/* Stock & Price */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div>
          <p className="text-[9px] text-muted-foreground">Estoque</p>
          <p className={cn(
            "text-[10px] font-semibold",
            isLowStock ? "text-destructive" : "text-foreground"
          )}>
            {product.stock} / {product.min_stock}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground">Custo</p>
          <p className="text-[10px] text-muted-foreground">
            R$ {Number(product.cost_price).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground">Venda</p>
          <p className="text-[10px] font-medium text-foreground">
            R$ {Number(product.sale_price).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-0.5 pt-1.5 border-t border-border/50">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(product)}>
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-destructive" 
          onClick={() => onDelete(product.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
