import { useMemo, useState } from 'react';
import { format, endOfMonth, startOfMonth } from 'date-fns';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFinancial } from '@/hooks/useFinancial';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { useBreakpoint } from '@/hooks/use-mobile';
import { WithdrawalDialog } from '@/components/personal/WithdrawalDialog';
import { cn } from '@/lib/utils';
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

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function ProLaborePage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { transactions, fetchTransactions } = useFinancial();
  const {
    withdrawals,
    createWithdrawal,
    cancelWithdrawal,
    getTotalWithdrawnForMonth,
    getTotalWithdrawnUntil,
  } = useWithdrawals();
  const { isDesktop } = useBreakpoint();

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  // Lucro do mês selecionado + lucro acumulado (desde sempre até o fim do mês)
  const { monthly, accumulatedProfit } = useMemo(() => {
    const monthly = { revenue: 0, expenses: 0, profit: 0 };
    let accumulatedProfit = 0;

    transactions.forEach(t => {
      if (t.status === 'cancelado') return;
      const date = new Date(t.created_at);
      if (date > monthEnd) return;

      if (t.type === 'receita') {
        accumulatedProfit += Number(t.profit_amount);
      } else if (t.type === 'despesa' && t.category !== 'prolabore') {
        // Despesas operacionais reduzem o lucro real disponível
        accumulatedProfit -= Number(t.amount);
      }

      if (date >= monthStart) {
        if (t.type === 'receita') {
          monthly.revenue += Number(t.amount);
          monthly.profit += Number(t.profit_amount);
        } else if (t.type === 'despesa' && t.category !== 'prolabore') {
          monthly.expenses += Number(t.amount);
          monthly.profit -= Number(t.amount);
        }
      }
    });

    return { monthly, accumulatedProfit };
  }, [transactions, monthStart.getTime(), monthEnd.getTime()]);

  const withdrawnInMonth = getTotalWithdrawnForMonth(selectedMonth);
  const withdrawnTotal = getTotalWithdrawnUntil(selectedMonth);
  const availableBalance = accumulatedProfit - withdrawnTotal;

  const monthWithdrawals = withdrawals.filter(w => {
    const [y, m] = w.reference_month.split('-');
    return (
      Number(y) === selectedMonth.getFullYear() &&
      Number(m) === selectedMonth.getMonth() + 1
    );
  });

  const handlePrevMonth = () =>
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handleWithdrawal = async (amount: number, description?: string) => {
    await createWithdrawal(amount, selectedMonth, description);
    await fetchTransactions();
  };

  const handleConfirmCancel = async () => {
    if (!cancelId) return;
    await cancelWithdrawal(cancelId);
    setCancelId(null);
    await fetchTransactions();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <Badge className="bg-success/10 text-success hover:bg-success/20 text-[10px] px-1.5 py-0">Confirmado</Badge>;
      case 'pendente':
        return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Pendente</Badge>;
      case 'cancelado':
        return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">{status}</Badge>;
    }
  };

  const stats = [
    {
      label: 'Receita do Mês',
      value: monthly.revenue,
      icon: DollarSign,
      tone: 'text-blue-500 bg-blue-500/10',
      valueClass: 'text-foreground',
    },
    {
      label: 'Lucro do Mês',
      value: monthly.profit,
      icon: TrendingUp,
      tone: 'text-success bg-success/10',
      valueClass: monthly.profit >= 0 ? 'text-foreground' : 'text-destructive',
    },
    {
      label: 'Retirado no Mês',
      value: withdrawnInMonth,
      icon: ArrowDownCircle,
      tone: 'text-orange-500 bg-orange-500/10',
      valueClass: 'text-foreground',
    },
    {
      label: 'Saldo Acumulado',
      value: availableBalance,
      icon: Wallet,
      tone: 'text-primary bg-primary/10',
      valueClass: availableBalance >= 0 ? 'text-primary' : 'text-destructive',
      highlight: true,
    },
  ];

  return (
    <div className="p-3 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Pro-labore</h1>
          <p className="text-xs text-muted-foreground">
            Retiradas de lucro da empresa para sua conta pessoal
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setWithdrawalDialogOpen(true)}
          className="gap-2 text-xs"
          disabled={availableBalance <= 0}
        >
          <Wallet className="h-3.5 w-3.5" />
          Fazer Retirada
        </Button>
      </div>

      {/* Month Selector */}
      <Card>
        <CardContent className="py-2.5">
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium capitalize">
                {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.label} className={cn(stat.highlight && 'border-primary/50')}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  <p className={cn('text-base md:text-xl font-bold', stat.valueClass)}>
                    {brl(stat.value)}
                  </p>
                </div>
                <div className={cn('p-2 rounded-lg shrink-0', stat.tone)}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Explicação do saldo */}
      <Card className="bg-muted/40">
        <CardContent className="p-3 text-xs text-muted-foreground">
          O <strong className="text-foreground">Saldo Acumulado</strong> soma todo o lucro da empresa
          até {format(monthEnd, "dd/MM/yyyy")} e desconta todas as retiradas já realizadas
          ({brl(withdrawnTotal)} no total). Se você não retirar nada em um mês, o valor permanece
          disponível nos meses seguintes.
        </CardContent>
      </Card>

      {/* Withdrawals */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">Retiradas do Mês</CardTitle>
          <CardDescription className="text-xs">
            Retiradas registradas em {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {monthWithdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Nenhuma retirada registrada neste mês.</p>
            </div>
          ) : isDesktop ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Descrição</TableHead>
                  <TableHead className="text-xs">Valor</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthWithdrawals.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="text-xs">
                      {format(new Date(w.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-xs">{w.description}</TableCell>
                    <TableCell className="text-xs font-semibold">{brl(Number(w.amount))}</TableCell>
                    <TableCell>{getStatusBadge(w.status)}</TableCell>
                    <TableCell className="text-right">
                      {w.status === 'confirmado' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelId(w.id)}
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-2">
              {monthWithdrawals.map(w => (
                <div key={w.id} className="glass rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{w.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(w.created_at), 'dd/MM/yy HH:mm')}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-primary">{brl(Number(w.amount))}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                    {getStatusBadge(w.status)}
                    {w.status === 'confirmado' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => setCancelId(w.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WithdrawalDialog
        open={withdrawalDialogOpen}
        onOpenChange={setWithdrawalDialogOpen}
        availableProfit={availableBalance}
        monthProfit={monthly.profit}
        referenceMonth={selectedMonth}
        onConfirm={handleWithdrawal}
      />

      <AlertDialog open={!!cancelId} onOpenChange={open => !open && setCancelId(null)}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Cancelar retirada?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              A retirada será cancelada e os lançamentos financeiro e pessoal vinculados também.
              O valor volta a ficar disponível no saldo acumulado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Voltar</AlertDialogCancel>
            <AlertDialogAction className="text-xs" onClick={handleConfirmCancel}>
              Cancelar retirada
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
