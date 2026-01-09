import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError } from '@/lib/errorMessages';
import type { PersonalTransaction, PersonalSummary } from '@/types/personal';

export function usePersonalFinancial() {
  const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('personal_transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching personal transactions:', error);
        throw error;
      }

      setTransactions((data as PersonalTransaction[]) || []);
    } catch (error: any) {
      console.error('Error in fetchTransactions:', error);
      toast({
        title: 'Erro ao carregar transações pessoais',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (
    transaction: Omit<PersonalTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('personal_transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating personal transaction:', error);
        throw error;
      }

      setTransactions(prev => [data as PersonalTransaction, ...prev]);
      toast({
        title: 'Sucesso',
        description: 'Transação pessoal criada com sucesso!',
      });

      return data;
    } catch (error: any) {
      console.error('Error in createTransaction:', error);
      toast({
        title: 'Erro ao criar transação',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<Omit<PersonalTransaction, 'id' | 'user_id' | 'created_at'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('personal_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating personal transaction:', error);
        throw error;
      }

      setTransactions(prev =>
        prev.map(t => (t.id === id ? (data as PersonalTransaction) : t))
      );

      toast({
        title: 'Sucesso',
        description: 'Transação atualizada com sucesso!',
      });

      return data;
    } catch (error: any) {
      console.error('Error in updateTransaction:', error);
      toast({
        title: 'Erro ao atualizar transação',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('personal_transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting personal transaction:', error);
        throw error;
      }

      setTransactions(prev => prev.filter(t => t.id !== id));

      toast({
        title: 'Sucesso',
        description: 'Transação excluída com sucesso!',
      });
    } catch (error: any) {
      console.error('Error in deleteTransaction:', error);
      toast({
        title: 'Erro ao excluir transação',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const summary = useMemo<PersonalSummary>(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalProlabore = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactions.forEach(t => {
      if (t.status === 'cancelado') return;

      const transactionDate = new Date(t.date);
      const isCurrentMonth =
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear;

      if (t.type === 'receita' || t.type === 'prolabore') {
        totalIncome += Number(t.amount);
        if (t.type === 'prolabore') totalProlabore += Number(t.amount);
        if (isCurrentMonth) monthlyIncome += Number(t.amount);
      } else if (t.type === 'despesa') {
        totalExpenses += Number(t.amount);
        if (isCurrentMonth) monthlyExpenses += Number(t.amount);
      }
    });

    return {
      balance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      totalProlabore,
      monthlyIncome,
      monthlyExpenses,
    };
  }, [transactions]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    summary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}
