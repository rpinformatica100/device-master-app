import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FinancialTransaction } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useFinancial() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*, clients(*), orders(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedData: FinancialTransaction[] = (data || []).map(t => ({
        ...t,
        client: t.clients as any,
        order: t.orders as any,
      }));
      
      setTransactions(formattedData);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar transações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (
    transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at' | 'client' | 'order' | 'user_id'>
  ) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      // Update state immediately without refetching
      setTransactions(prev => [{ ...data, client: null, order: null } as FinancialTransaction, ...prev]);
      toast({ title: 'Transação criada com sucesso!' });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao criar transação',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<FinancialTransaction>) => {
    try {
      // Remove joined data
      const cleanUpdates = { ...updates };
      delete cleanUpdates.client;
      delete cleanUpdates.order;

      const { data, error } = await supabase
        .from('financial_transactions')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      // Update state immediately without refetching
      setTransactions(prev => prev.map(t => 
        t.id === id ? { ...t, ...data } as FinancialTransaction : t
      ));
      toast({ title: 'Transação atualizada com sucesso!' });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar transação',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Transação excluída com sucesso!' });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir transação',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTransactions = transactions.filter(t => 
      new Date(t.created_at) >= startOfMonth
    );

    const totalReceitas = monthlyTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDespesas = monthlyTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalCustos = monthlyTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + Number(t.cost_amount), 0);

    const totalLucro = monthlyTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + Number(t.profit_amount), 0);

    const saldoAtual = totalReceitas - totalDespesas;

    const paidTransactions = transactions.filter(t => t.status === 'pago');
    const pendingTransactions = transactions.filter(t => t.status === 'pendente');

    const totalPago = paidTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPendente = pendingTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      saldoAtual,
      receitasMes: totalReceitas,
      despesasMes: totalDespesas,
      custosMes: totalCustos,
      lucroLiquido: totalLucro,
      totalPago,
      totalPendente,
      margemMedia: totalReceitas > 0 ? (totalLucro / totalReceitas) * 100 : 0,
    };
  }, [transactions]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    summary,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
