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
      "glass rounded-xl p-4 space-y-3",
      isLowStock && "border-destructive/50"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            isLowStock ? "bg-destructive/10" : "bg-primary/10"
          )}>
            {isLowStock ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <Package className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{product.name}</p>
            {product.sku && (
              <p className="text-xs font-mono text-muted-foreground">{product.sku}</p>
            )}
          </div>
        </div>
        {product.category && (
          <Badge 
            variant="outline" 
            className={cn("text-xs shrink-0 capitalize", productCategoryColors[product.category])}
          >
            {product.category}
          </Badge>
        )}
      </div>

      {/* Stock & Price */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Estoque</p>
          <p className={cn(
            "text-sm font-semibold",
            isLowStock ? "text-destructive" : "text-foreground"
          )}>
            {product.stock} / {product.min_stock}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Custo</p>
          <p className="text-sm text-muted-foreground">
            R$ {Number(product.cost_price).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Venda</p>
          <p className="text-sm font-medium text-foreground">
            R$ {Number(product.sale_price).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/50">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onEdit(product)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-destructive" 
          onClick={() => onDelete(product.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
