import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Package, Wrench, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { FinancialTransaction } from "@/types/database";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
            costPerUnit: item.cost,
            totalCost: item.cost * (item.quantity || 1),
            salePrice: item.sale * (item.quantity || 1),
            profit: item.profit,
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
      className="glass rounded-lg overflow-hidden mb-4 sm:mb-6"
    >
      <div 
        className="p-3 sm:p-4 border-b border-border flex items-center justify-between cursor-pointer hover:bg-secondary/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground">Mapa de Custos</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Custos por OS, produto e serviço
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {!isMobile && (
            <div className="flex gap-3 text-xs">
              <div className="text-center">
                <p className="text-muted-foreground">Produtos</p>
                <p className="font-semibold text-destructive">R$ {totalCosts.productsCost.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Serviços</p>
                <p className="font-semibold text-destructive">R$ {totalCosts.servicesCost.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold text-destructive">R$ {totalCosts.totalCost.toFixed(2)}</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Summary */}
      {isMobile && isExpanded && (
        <div className="p-3 border-b border-border bg-secondary/10">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div>
              <p className="text-muted-foreground">Produtos</p>
              <p className="font-semibold text-destructive">R$ {totalCosts.productsCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Serviços</p>
              <p className="font-semibold text-destructive">R$ {totalCosts.servicesCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-semibold text-destructive">R$ {totalCosts.totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        isMobile ? (
          // Mobile: Card view
          <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
            {costBreakdown.map((item, index) => (
              <div key={`${item.osNumber}-${item.itemName}-${index}`} className="p-2 rounded-lg bg-secondary/20 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                    {item.osNumber}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0",
                      item.itemType === 'product'
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-info/20 text-info border-info/30"
                    )}
                  >
                    {item.itemType === 'product' ? <Package className="w-2.5 h-2.5 mr-0.5" /> : <Wrench className="w-2.5 h-2.5 mr-0.5" />}
                    {item.itemType === 'product' ? 'Prod' : 'Serv'}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-foreground truncate">{item.itemName}</p>
                <div className="grid grid-cols-4 gap-1 text-center text-[9px]">
                  <div>
                    <p className="text-muted-foreground">Qtd</p>
                    <p className="font-medium">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Custo</p>
                    <p className="font-medium text-destructive">R${item.totalCost.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Venda</p>
                    <p className="font-medium text-success">R${item.salePrice.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lucro</p>
                    <p className="font-medium text-primary">R${item.profit.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop: Table view
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/20">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">OS</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Item</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Tipo</th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground">Qtd</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground">Custo Unit.</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground">Custo Total</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground">Venda</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground">Lucro</th>
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
                    <td className="p-3">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {item.osNumber}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs font-medium text-foreground">{item.itemName}</td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
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
                    <td className="p-3 text-center text-xs text-muted-foreground">{item.quantity}</td>
                    <td className="p-3 text-right text-xs text-muted-foreground">
                      R$ {item.costPerUnit.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-xs font-semibold text-destructive">
                      R$ {item.totalCost.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-xs text-success">
                      R$ {item.salePrice.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-xs font-semibold text-primary">
                      R$ {item.profit.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-secondary/30 border-t-2 border-border">
                  <td colSpan={5} className="p-3 text-right text-xs font-semibold text-foreground">
                    TOTAIS:
                  </td>
                  <td className="p-3 text-right text-xs font-bold text-destructive">
                    R$ {totalCosts.totalCost.toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-xs font-bold text-success">
                    R$ {costBreakdown.reduce((sum, c) => sum + c.salePrice, 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-xs font-bold text-primary">
                    R$ {totalCosts.totalProfit.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )
      )}
    </motion.div>
  );
}
