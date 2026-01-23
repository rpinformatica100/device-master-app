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
      className="glass rounded-lg p-3 space-y-2"
      onClick={() => onView(transaction)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            isReceita ? "bg-success/10" : "bg-destructive/10"
          )}>
            {isReceita ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{transaction.description}</p>
            <p className="text-[10px] text-muted-foreground">
              {format(new Date(transaction.created_at), "dd/MM/yy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] shrink-0 px-1.5 py-0",
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
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div>
          <p className="text-[9px] text-muted-foreground">Custo</p>
          <p className="text-[10px] font-medium text-muted-foreground">
            R$ {Number(transaction.cost_amount).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground">Valor</p>
          <p className={cn("text-[10px] font-semibold", isReceita ? "text-success" : "text-destructive")}>
            {isReceita ? "+" : "-"} R$ {Number(transaction.amount).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground">Lucro</p>
          <p className="text-[10px] font-semibold text-primary">
            R$ {Number(transaction.profit_amount).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-0.5 pt-1.5 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(transaction)}>
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-destructive" 
          onClick={() => onDelete(transaction)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
