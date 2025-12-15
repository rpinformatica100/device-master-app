import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Package, Wrench, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { FinancialTransaction } from "@/types/database";

interface CostBreakdownSectionProps {
  transactions: FinancialTransaction[];
}

interface CostItem {
  osNumber: string;
  osId: string;
  description: string;
  itemName: string;
  itemType: 'product' | 'service';
  quantity: number;
  costPerUnit: number;
  totalCost: number;
  salePrice: number;
  profit: number;
  date: string;
}

export function CostBreakdownSection({ transactions }: CostBreakdownSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const costBreakdown = useMemo(() => {
    const items: CostItem[] = [];
    
    transactions.forEach((transaction) => {
      if (transaction.type !== 'receita') return;
      
      const details = transaction.details as any;
      if (!details?.items || !Array.isArray(details.items)) return;
      
      details.items.forEach((item: any) => {
        if (item.cost > 0) {
          items.push({
            osNumber: details.os_number || transaction.description.replace('OS Finalizada - ', ''),
            osId: transaction.order_id || '',
            description: transaction.description,
            itemName: item.name,
            itemType: item.type === 'product' ? 'product' : 'service',
            quantity: item.quantity || 1,
            costPerUnit: item.cost / (item.quantity || 1),
            totalCost: item.cost * (item.quantity || 1),
            salePrice: item.sale * (item.quantity || 1),
            profit: item.profit * (item.quantity || 1),
            date: transaction.created_at,
          });
        }
      });
    });
    
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const totalCosts = useMemo(() => {
    const products = costBreakdown.filter(c => c.itemType === 'product');
    const services = costBreakdown.filter(c => c.itemType === 'service');
    
    return {
      productsCost: products.reduce((sum, c) => sum + c.totalCost, 0),
      servicesCost: services.reduce((sum, c) => sum + c.totalCost, 0),
      totalCost: costBreakdown.reduce((sum, c) => sum + c.totalCost, 0),
      totalProfit: costBreakdown.reduce((sum, c) => sum + c.profit, 0),
    };
  }, [costBreakdown]);

  if (costBreakdown.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass rounded-xl overflow-hidden mb-8"
    >
      <div 
        className="p-6 border-b border-border flex items-center justify-between cursor-pointer hover:bg-secondary/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Mapa de Custos Detalhado</h3>
            <p className="text-sm text-muted-foreground">
              Custos por OS, produto e serviço
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Produtos</p>
              <p className="font-semibold text-destructive">R$ {totalCosts.productsCost.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Serviços</p>
              <p className="font-semibold text-destructive">R$ {totalCosts.servicesCost.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Total Custos</p>
              <p className="font-semibold text-destructive">R$ {totalCosts.totalCost.toFixed(2)}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">OS</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Item</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tipo</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Qtd</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Custo Unit.</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Custo Total</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Venda</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Lucro</th>
              </tr>
            </thead>
            <tbody>
              {costBreakdown.map((item, index) => (
                <motion.tr
                  key={`${item.osNumber}-${item.itemName}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="p-4">
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.osNumber}
                    </Badge>
                  </td>
                  <td className="p-4 font-medium text-foreground">{item.itemName}</td>
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        item.itemType === 'product'
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-info/20 text-info border-info/30"
                      )}
                    >
                      {item.itemType === 'product' ? (
                        <><Package className="w-3 h-3 mr-1" /> Produto</>
                      ) : (
                        <><Wrench className="w-3 h-3 mr-1" /> Serviço</>
                      )}
                    </Badge>
                  </td>
                  <td className="p-4 text-center text-muted-foreground">{item.quantity}</td>
                  <td className="p-4 text-right text-muted-foreground">
                    R$ {item.costPerUnit.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-semibold text-destructive">
                    R$ {item.totalCost.toFixed(2)}
                  </td>
                  <td className="p-4 text-right text-success">
                    R$ {item.salePrice.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-semibold text-primary">
                    R$ {item.profit.toFixed(2)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-secondary/30 border-t-2 border-border">
                <td colSpan={5} className="p-4 text-right font-semibold text-foreground">
                  TOTAIS:
                </td>
                <td className="p-4 text-right font-bold text-destructive">
                  R$ {totalCosts.totalCost.toFixed(2)}
                </td>
                <td className="p-4 text-right font-bold text-success">
                  R$ {costBreakdown.reduce((sum, c) => sum + c.salePrice, 0).toFixed(2)}
                </td>
                <td className="p-4 text-right font-bold text-primary">
                  R$ {totalCosts.totalProfit.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </motion.div>
  );
}