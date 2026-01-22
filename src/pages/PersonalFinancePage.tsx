import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { usePersonalFinancial } from '@/hooks/usePersonalFinancial';
import { useIsMobile } from '@/hooks/use-mobile';
import { PersonalTransactionDialog } from '@/components/personal/PersonalTransactionDialog';
import { PersonalTransactionCard } from '@/components/shared/PersonalTransactionCard';
import { personalCategories, type PersonalTransaction } from '@/types/personal';
import ProLaborePage from './ProLaborePage';
import {
  Plus,
  Search,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
} from 'lucide-react';

export default function PersonalFinancePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<PersonalTransaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const isMobile = useIsMobile();

  const {
    transactions,
    loading,
    summary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = usePersonalFinancial();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const handleSubmit = async (data: Omit<PersonalTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await createTransaction(data);
    }
  };

  const handleEdit = (transaction: PersonalTransaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-8">
        <Tabs defaultValue="prolabore" className="space-y-4 md:space-y-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Finanças Pessoais</h1>
                <p className="text-sm text-muted-foreground hidden md:block">
                  Gerencie pro-labore e finanças pessoais
                </p>
              </div>
            </div>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="prolabore" className="flex-1 sm:flex-none">Pro-labore</TabsTrigger>
              <TabsTrigger value="transacoes" className="flex-1 sm:flex-none">Transações</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="prolabore" className="mt-4 md:mt-6">
            <ProLaborePage />
          </TabsContent>

          <TabsContent value="transacoes" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
            {/* Header with action */}
            <div className="flex justify-end">
              <Button onClick={() => setDialogOpen(true)} className="gap-2" size={isMobile ? "sm" : "default"}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Transação</span>
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <Card className="border-primary/50">
                <CardContent className="p-4 md:pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Saldo</p>
                      <p className={`text-lg md:text-2xl font-bold truncate ${summary.balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        R$ {summary.balance.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 md:p-3 rounded-full bg-primary/10 shrink-0">
                      <Wallet className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Receitas</p>
                      <p className="text-lg md:text-2xl font-bold text-green-500 truncate">
                        R$ {summary.monthlyIncome.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 md:p-3 rounded-full bg-green-500/10 shrink-0">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Despesas</p>
                      <p className="text-lg md:text-2xl font-bold text-red-500 truncate">
                        R$ {summary.monthlyExpenses.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 md:p-3 rounded-full bg-red-500/10 shrink-0">
                      <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Pro-labore</p>
                      <p className="text-lg md:text-2xl font-bold text-foreground truncate">
                        R$ {summary.totalProlabore.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 md:p-3 rounded-full bg-blue-500/10 shrink-0">
                      <ArrowUpCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="py-3 md:py-4">
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="receita">Receitas</SelectItem>
                        <SelectItem value="despesa">Despesas</SelectItem>
                        <SelectItem value="prolabore">Pro-labore</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {personalCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions */}
            <Card>
              <CardHeader className="py-3 md:py-6">
                <CardTitle className="text-base md:text-lg">Transações</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {filteredTransactions.length} transação(ões)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma transação encontrada.</p>
                  </div>
                ) : isMobile ? (
                  /* Mobile Cards */
                  <div className="space-y-3 -mx-2">
                    {filteredTransactions.map(transaction => (
                      <PersonalTransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={handleEdit}
                        onDelete={setDeleteId}
                      />
                    ))}
                  </div>
                ) : (
                  /* Desktop Table */
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Descrição</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tipo</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Categoria</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Valor</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map(transaction => (
                          <tr key={transaction.id} className="border-b border-border/50 hover:bg-secondary/30">
                            <td className="p-4 text-sm">{format(new Date(transaction.date), 'dd/MM/yyyy')}</td>
                            <td className="p-4 font-medium">{transaction.description}</td>
                            <td className="p-4 text-sm capitalize">{transaction.type}</td>
                            <td className="p-4 text-sm">
                              {personalCategories.find(c => c.value === transaction.category)?.label || '-'}
                            </td>
                            <td className={`p-4 text-right font-medium ${transaction.type === 'despesa' ? 'text-red-500' : 'text-green-500'}`}>
                              {transaction.type === 'despesa' ? '-' : '+'}R$ {Number(transaction.amount).toFixed(2)}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(transaction)}
                                  disabled={transaction.type === 'prolabore'}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteId(transaction.id)}
                                  className="text-destructive hover:text-destructive"
                                  disabled={transaction.type === 'prolabore'}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Transaction Dialog */}
        <PersonalTransactionDialog
          open={dialogOpen}
          onOpenChange={handleCloseDialog}
          transaction={editingTransaction}
          onSubmit={handleSubmit}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A transação será permanentemente excluída.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
