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
    <div className="glass rounded-lg p-3 space-y-2">
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-success" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground">{service.name}</p>
          {service.description && (
            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{service.description}</p>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-1.5 text-center">
        <div>
          <p className="text-[9px] text-muted-foreground">Custo</p>
          <p className="text-[10px] text-muted-foreground">
            R$ {Number(service.cost_price).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground">Venda</p>
          <p className="text-[10px] font-medium text-foreground">
            R$ {Number(service.sale_price).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-0.5 pt-1.5 border-t border-border/50">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(service)}>
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-destructive" 
          onClick={() => onDelete(service.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
