import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { StatCard } from "@/components/dashboard/StatCard";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { CostBreakdownSection } from "@/components/financial/CostBreakdownSection";
import { TransactionCard } from "@/components/shared/TransactionCard";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Loader2, Eye, Receipt, Package, Plus, CreditCard, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useFinancial } from "@/hooks/useFinancial";
import { FinancialTransaction } from "@/types/database";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TransactionFormDialog } from "@/components/financial/TransactionFormDialog";
import { PaymentDialog, PaymentData } from "@/components/financial/PaymentDialog";
import { FinancialFilters, FilterState, defaultFilters } from "@/components/financial/FinancialFilters";
import { exportToExcel, exportToPDF } from "@/lib/exportFinancial";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function FinancialPage() {
  const { transactions, loading, summary, createTransaction, updateTransaction, deleteTransaction } = useFinancial();
  const isMobile = useIsMobile();
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<FinancialTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Filtered transactions based on filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Date filter
      if (filters.startDate && filters.endDate) {
        const transactionDate = new Date(t.created_at);
        if (
          !isWithinInterval(transactionDate, {
            start: startOfDay(filters.startDate),
            end: endOfDay(filters.endDate),
          })
        ) {
          return false;
        }
      }

      // Type filter
      if (filters.type !== "all" && t.type !== filters.type) {
        return false;
      }

      // Status filter
      if (filters.status !== "all" && t.status !== filters.status) {
        return false;
      }

      // Category filter
      if (filters.category !== "all" && t.category !== filters.category) {
        return false;
      }

      // Search term filter
      if (
        filters.searchTerm &&
        !t.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);

  // Filtered summary
  const filteredSummary = useMemo(() => {
    const totalReceitas = filteredTransactions
      .filter((t) => t.type === "receita")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDespesas = filteredTransactions
      .filter((t) => t.type === "despesa")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalCustos = filteredTransactions
      .filter((t) => t.type === "receita")
      .reduce((sum, t) => sum + Number(t.cost_amount), 0);

    const totalLucro = filteredTransactions
      .filter((t) => t.type === "receita")
      .reduce((sum, t) => sum + Number(t.profit_amount), 0);

    return {
      totalReceitas,
      totalDespesas,
      totalCustos,
      totalLucro,
      saldo: totalReceitas - totalDespesas,
      margemMedia: totalReceitas > 0 ? (totalLucro / totalReceitas) * 100 : 0,
    };
  }, [filteredTransactions]);

  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "Nenhuma transação para exportar",
        description: "Ajuste os filtros para incluir transações.",
        variant: "destructive",
      });
      return;
    }
    exportToExcel({
      transactions: filteredTransactions,
      startDate: filters.startDate,
      endDate: filters.endDate,
      summary: filteredSummary,
    });
    toast({ title: "Exportação iniciada!" });
  };

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "Nenhuma transação para exportar",
        description: "Ajuste os filtros para incluir transações.",
        variant: "destructive",
      });
      return;
    }
    exportToPDF({
      transactions: filteredTransactions,
      startDate: filters.startDate,
      endDate: filters.endDate,
      summary: filteredSummary,
    });
  };

  const handleViewDetails = (transaction: FinancialTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };

  const handleMarkAsPaid = () => {
    if (!selectedTransaction) return;
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = async (paymentData: PaymentData) => {
    if (!selectedTransaction) return;
    
    const currentDetails = (selectedTransaction.details as any) || {};
    await updateTransaction(selectedTransaction.id, {
      status: 'pago',
      paid_at: new Date().toISOString(),
      payment_method: paymentData.payment_method,
      details: {
        ...currentDetails,
        payment: paymentData.payment_details,
      },
    });
    setIsPaymentDialogOpen(false);
    setIsDetailOpen(false);
  };

  const handleDeleteClick = (transaction: FinancialTransaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(transactionToDelete.id);
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const details = selectedTransaction?.details as any;

  return (
    <MainLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Financeiro</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Acompanhe receitas, despesas e lucros</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="sm" className="h-8 text-xs sm:text-sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Novo Lançamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
          <StatCard
            title="Saldo (Período)"
            value={`R$ ${filteredSummary.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="Receitas - Despesas"
            changeType={filteredSummary.saldo >= 0 ? "positive" : "negative"}
            icon={Wallet}
            delay={0}
          />
          <StatCard
            title="Receitas"
            value={`R$ ${filteredSummary.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={`${filteredSummary.margemMedia.toFixed(1)}% margem`}
            changeType="positive"
            icon={TrendingUp}
            delay={0.1}
          />
          <StatCard
            title="Custos"
            value={`R$ ${filteredSummary.totalCustos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="Produtos/serviços"
            changeType="neutral"
            icon={TrendingDown}
            delay={0.2}
          />
          <StatCard
            title="Lucro Líquido"
            value={`R$ ${filteredSummary.totalLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={`${filteredTransactions.length} transações`}
            changeType="positive"
            icon={DollarSign}
            delay={0.3}
          />
        </div>

        {/* Filters */}
        <FinancialFilters
          filters={filters}
          onFiltersChange={setFilters}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          transactions={filteredTransactions}
        />

        {/* Chart */}
        <div className="mb-4">
          <FinancialChart />
        </div>

        {/* Cost Breakdown - Use filtered transactions */}
        <CostBreakdownSection transactions={filteredTransactions} />

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass rounded-lg overflow-hidden"
        >
          <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold text-foreground">Transações</h3>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {filteredTransactions.length} transação(ões)
            </span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-6 text-center">
              <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma transação encontrada</p>
              <p className="text-xs text-muted-foreground mt-1">
                {transactions.length > 0 
                  ? "Tente ajustar os filtros" 
                  : "Transações são criadas quando uma OS é concluída"}
              </p>
            </div>
          ) : isMobile ? (
            // Mobile: Card view
            <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onView={handleViewDetails}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            // Desktop: Table view
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Descrição</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Data</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground">Custo</th>
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground">Receita</th>
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground">Lucro</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="p-3 text-xs font-medium text-foreground">{transaction.description}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), "dd/MM/yy", { locale: ptBR })}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] capitalize",
                            transaction.type === "receita"
                              ? "bg-success/20 text-success border-success/30"
                              : "bg-destructive/20 text-destructive border-destructive/30"
                          )}
                        >
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] capitalize",
                            transaction.status === "pago"
                              ? "bg-success/20 text-success border-success/30"
                              : transaction.status === "pendente"
                              ? "bg-warning/20 text-warning border-warning/30"
                              : "bg-muted text-muted-foreground border-muted"
                          )}
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right text-xs text-muted-foreground">
                        R$ {Number(transaction.cost_amount).toFixed(2)}
                      </td>
                      <td
                        className={cn(
                          "p-3 text-right text-xs font-semibold",
                          transaction.type === "receita" ? "text-success" : "text-destructive"
                        )}
                      >
                        {transaction.type === "receita" ? "+" : "-"} R$ {Number(transaction.amount).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-xs font-semibold text-primary">
                        R$ {Number(transaction.profit_amount).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleViewDetails(transaction)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(transaction)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6 py-4">
              {/* Transaction Info */}
              <div className="glass rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{selectedTransaction.description}</h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      selectedTransaction.status === "pago"
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-warning/20 text-warning border-warning/30"
                    )}
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {format(new Date(selectedTransaction.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipo</p>
                    <p className="font-medium capitalize">{selectedTransaction.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Categoria</p>
                    <p className="font-medium">{selectedTransaction.category || "OS"}</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="glass rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-4">Resumo Financeiro</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Custo</p>
                    <p className="text-xl font-bold text-destructive">
                      R$ {Number(selectedTransaction.cost_amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Receita</p>
                    <p className="text-xl font-bold text-success">
                      R$ {Number(selectedTransaction.amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Lucro</p>
                    <p className="text-xl font-bold text-primary">
                      R$ {Number(selectedTransaction.profit_amount).toFixed(2)}
                    </p>
                  </div>
                </div>
                {details?.totals?.margin_percent && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Margem de lucro: {details.totals.margin_percent}%
                  </p>
                )}
              </div>

              {/* Payment Info */}
              {(selectedTransaction?.payment_method || details?.payment) && (
                <div className="glass rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Dados do Pagamento
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Forma de Pagamento</p>
                      <p className="font-medium">
                        {details?.payment?.method_label || selectedTransaction?.payment_method || "Não informado"}
                      </p>
                    </div>
                    {details?.payment?.installments && details.payment.installments > 1 && (
                      <div>
                        <p className="text-muted-foreground">Parcelas</p>
                        <p className="font-medium">{details.payment.installments}x</p>
                      </div>
                    )}
                    {details?.payment?.card_brand && (
                      <div>
                        <p className="text-muted-foreground">Bandeira</p>
                        <p className="font-medium">{details.payment.card_brand}</p>
                      </div>
                    )}
                    {details?.payment?.card_last_digits && (
                      <div>
                        <p className="text-muted-foreground">Final do Cartão</p>
                        <p className="font-medium font-mono">**** {details.payment.card_last_digits}</p>
                      </div>
                    )}
                    {details?.payment?.pix_key && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Chave PIX</p>
                        <p className="font-medium">{details.payment.pix_key}</p>
                      </div>
                    )}
                    {details?.payment?.bank_name && (
                      <div>
                        <p className="text-muted-foreground">Banco</p>
                        <p className="font-medium">{details.payment.bank_name}</p>
                      </div>
                    )}
                    {details?.payment?.notes && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Observações</p>
                        <p className="font-medium">{details.payment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Client Info */}
              {details?.client && (
                <div className="glass rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3">Cliente</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nome</p>
                      <p className="font-medium">{details.client.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Telefone</p>
                      <p className="font-medium">{details.client.phone || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{details.client.email || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CPF</p>
                      <p className="font-medium">{details.client.cpf || "Não informado"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Device Info */}
              {details?.device && (
                <div className="glass rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3">Equipamento</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dispositivo</p>
                      <p className="font-medium">{details.device.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Categoria</p>
                      <p className="font-medium capitalize">{details.device.category}</p>
                    </div>
                    {details.device.serial_number && (
                      <div>
                        <p className="text-muted-foreground">Número de Série</p>
                        <p className="font-medium font-mono">{details.device.serial_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              {details?.items && details.items.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Produtos e Serviços
                  </h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2">Item</th>
                        <th className="text-left py-2">Tipo</th>
                        <th className="text-right py-2">Custo</th>
                        <th className="text-right py-2">Venda</th>
                        <th className="text-center py-2">Qtd</th>
                        <th className="text-right py-2">Lucro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.items.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-border/50">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2">
                            <Badge variant="outline" className="text-xs">
                              {item.type === 'product' ? 'Produto' : 'Serviço'}
                            </Badge>
                          </td>
                          <td className="py-2 text-right text-muted-foreground">
                            R$ {item.cost.toFixed(2)}
                          </td>
                          <td className="py-2 text-right">R$ {item.sale.toFixed(2)}</td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-right text-success">
                            R$ {item.profit.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Actions */}
              {selectedTransaction.status === 'pendente' && (
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                    Fechar
                  </Button>
                  <Button onClick={handleMarkAsPaid}>
                    Marcar como Pago
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transaction Form Dialog */}
      <TransactionFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={createTransaction}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        title="Registrar Pagamento"
        amount={Number(selectedTransaction?.amount || 0)}
        onConfirm={handlePaymentConfirm}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{transactionToDelete?.description}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
