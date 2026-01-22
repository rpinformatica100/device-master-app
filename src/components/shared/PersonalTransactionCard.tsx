import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Edit, Trash2, TrendingUp, TrendingDown, ArrowUpCircle } from "lucide-react";
import { format } from "date-fns";
import { personalCategories, type PersonalTransaction } from "@/types/personal";

interface PersonalTransactionCardProps {
  transaction: PersonalTransaction;
  onEdit: (transaction: PersonalTransaction) => void;
  onDelete: (id: string) => void;
}

export function PersonalTransactionCard({ transaction, onEdit, onDelete }: PersonalTransactionCardProps) {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'receita':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs">Receita</Badge>;
      case 'despesa':
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs">Despesa</Badge>;
      case 'prolabore':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">Pro-labore</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return <Badge variant="secondary" className="text-xs">Pago</Badge>;
      case 'pendente':
        return <Badge variant="outline" className="text-xs">Pendente</Badge>;
      case 'cancelado':
        return <Badge variant="destructive" className="text-xs">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return null;
    return personalCategories.find(c => c.value === category)?.label || category;
  };

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'receita':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'despesa':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'prolabore':
        return <ArrowUpCircle className="w-5 h-5 text-primary" />;
      default:
        return <TrendingUp className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const isProlabore = transaction.type === 'prolabore';

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            transaction.type === 'receita' ? "bg-green-500/10" : 
            transaction.type === 'despesa' ? "bg-red-500/10" : "bg-primary/10"
          )}>
            {getTypeIcon()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{transaction.description}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(transaction.date), "dd/MM/yy")}
              {transaction.category && ` • ${getCategoryLabel(transaction.category)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Badges & Value */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getTypeBadge(transaction.type)}
          {getStatusBadge(transaction.status)}
        </div>
        <p className={cn(
          "font-semibold",
          transaction.type === 'despesa' ? "text-red-500" : "text-green-500"
        )}>
          {transaction.type === 'despesa' ? '-' : '+'}R$ {Number(transaction.amount).toFixed(2)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/50">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9" 
          onClick={() => onEdit(transaction)}
          disabled={isProlabore}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-destructive" 
          onClick={() => onDelete(transaction.id)}
          disabled={isProlabore}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
