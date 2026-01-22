import { Button } from "@/components/ui/button";
import { Edit, Trash2, Wrench } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description?: string | null;
  cost_price: number;
  sale_price: number;
}

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5 text-success" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{service.name}</p>
          {service.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{service.description}</p>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Custo</p>
          <p className="text-sm text-muted-foreground">
            R$ {Number(service.cost_price).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Venda</p>
          <p className="text-sm font-medium text-foreground">
            R$ {Number(service.sale_price).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/50">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onEdit(service)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-destructive" 
          onClick={() => onDelete(service.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
