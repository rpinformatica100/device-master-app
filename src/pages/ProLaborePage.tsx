import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFinancial } from '@/hooks/useFinancial';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { WithdrawalDialog } from '@/components/personal/WithdrawalDialog';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from 'lucide-react';

export default function ProLaborePage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);

  const { transactions, summary } = useFinancial();
  const { withdrawals, createWithdrawal, cancelWithdrawal, getTotalWithdrawnForMonth } = useWithdrawals();

  // Calculate monthly profit
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  const monthlyData = transactions.reduce(
    (acc, t) => {
      if (t.status === 'cancelado') return acc;
      const transactionDate = new Date(t.created_at);
      if (transactionDate >= monthStart && transactionDate <= monthEnd) {
        if (t.type === 'receita') {
          acc.revenue += Number(t.amount);
          acc.profit += Number(t.profit_amount);
        } else if (t.type === 'despesa' && t.category !== 'prolabore') {
          acc.expenses += Number(t.amount);
        }
      }
      return acc;
    },
    { revenue: 0, expenses: 0, profit: 0 }
  );

  const totalWithdrawn = getTotalWithdrawnForMonth(selectedMonth);
  const availableProfit = monthlyData.profit - totalWithdrawn;

  // Get withdrawals for selected month
  const monthWithdrawals = withdrawals.filter(w => {
    const wMonth = new Date(w.reference_month);
    return (
      wMonth.getMonth() === selectedMonth.getMonth() &&
      wMonth.getFullYear() === selectedMonth.getFullYear()
    );
  });

  const handlePrevMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleWithdrawal = async (amount: number, description?: string) => {
    await createWithdrawal(amount, selectedMonth, description);
  };

  const handleCancelWithdrawal = async (id: string) => {
    await cancelWithdrawal(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Confirmado</Badge>;
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pro-labore</h1>
          <p className="text-muted-foreground">
            Gerencie suas retiradas de lucro para conta pessoal
          </p>
        </div>
        <Button
          onClick={() => setWithdrawalDialogOpen(true)}
          className="gap-2"
          disabled={availableProfit <= 0}
        >
          <Wallet className="h-4 w-4" />
          Fazer Retirada
        </Button>
      </div>

      {/* Month Selector */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-medium capitalize">
                {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita do Mês</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {monthlyData.revenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro do Mês</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {monthlyData.profit.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Já Retirado</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {totalWithdrawn.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/10">
                <ArrowDownCircle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponível</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {availableProfit.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Retiradas</CardTitle>
          <CardDescription>
            Todas as retiradas realizadas neste mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthWithdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma retirada realizada neste mês.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthWithdrawals.map(withdrawal => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      {format(new Date(withdrawal.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{withdrawal.description}</TableCell>
                    <TableCell className="font-medium">
                      R$ {Number(withdrawal.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell className="text-right">
                      {withdrawal.status === 'confirmado' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelWithdrawal(withdrawal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Dialog */}
      <WithdrawalDialog
        open={withdrawalDialogOpen}
        onOpenChange={setWithdrawalDialogOpen}
        availableProfit={availableProfit}
        referenceMonth={selectedMonth}
        onConfirm={handleWithdrawal}
      />
    </div>
  );
}
