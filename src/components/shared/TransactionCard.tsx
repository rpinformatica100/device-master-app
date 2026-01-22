import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FinancialTransaction } from "@/types/database";
import { cn } from "@/lib/utils";
import { Eye, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionCardProps {
  transaction: FinancialTransaction;
  onView: (transaction: FinancialTransaction) => void;
  onDelete: (transaction: FinancialTransaction) => void;
}

export function TransactionCard({ transaction, onView, onDelete }: TransactionCardProps) {
  const isReceita = transaction.type === "receita";

  return (
    <div 
      className="glass rounded-xl p-4 space-y-3"
      onClick={() => onView(transaction)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            isReceita ? "bg-success/10" : "bg-destructive/10"
          )}>
            {isReceita ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{transaction.description}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(transaction.created_at), "dd/MM/yy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs shrink-0",
            transaction.status === "pago"
              ? "bg-success/20 text-success border-success/30"
              : transaction.status === "pendente"
              ? "bg-warning/20 text-warning border-warning/30"
              : "bg-muted text-muted-foreground border-muted"
          )}
        >
          {transaction.status}
        </Badge>
      </div>

      {/* Values */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Custo</p>
          <p className="text-sm font-medium text-muted-foreground">
            R$ {Number(transaction.cost_amount).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Valor</p>
          <p className={cn("text-sm font-semibold", isReceita ? "text-success" : "text-destructive")}>
            {isReceita ? "+" : "-"} R$ {Number(transaction.amount).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Lucro</p>
          <p className="text-sm font-semibold text-primary">
            R$ {Number(transaction.profit_amount).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onView(transaction)}>
          <Eye className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-destructive" 
          onClick={() => onDelete(transaction)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
