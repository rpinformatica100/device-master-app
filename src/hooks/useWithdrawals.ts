import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError } from '@/lib/errorMessages';
import type { Withdrawal } from '@/types/personal';

export function useWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching withdrawals:', error);
        throw error;
      }

      setWithdrawals((data as Withdrawal[]) || []);
    } catch (error: any) {
      console.error('Error in fetchWithdrawals:', error);
      toast({
        title: 'Erro ao carregar retiradas',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createWithdrawal = async (
    amount: number,
    referenceMonth: Date,
    description?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Create financial transaction (business expense)
      const { data: financialTx, error: financialError } = await supabase
        .from('financial_transactions')
        .insert([{
          user_id: user.id,
          description: description || 'Pro-labore',
          type: 'despesa',
          category: 'prolabore',
          amount: amount,
          cost_amount: amount,
          profit_amount: 0,
          status: 'pago',
          paid_at: new Date().toISOString(),
          payment_method: 'transferencia',
        }])
        .select()
        .single();

      if (financialError) {
        console.error('Error creating financial transaction:', financialError);
        throw financialError;
      }

      // 2. Create personal transaction (personal income)
      const { data: personalTx, error: personalError } = await supabase
        .from('personal_transactions')
        .insert([{
          user_id: user.id,
          description: description || 'Pro-labore',
          type: 'prolabore',
          category: 'prolabore',
          amount: amount,
          status: 'pago',
          payment_method: 'transferencia',
          date: new Date().toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (personalError) {
        console.error('Error creating personal transaction:', personalError);
        throw personalError;
      }

      // 3. Create withdrawal record
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert([{
          user_id: user.id,
          amount: amount,
          description: description || 'Pro-labore',
          reference_month: referenceMonth.toISOString().split('T')[0],
          status: 'confirmado',
          confirmed_at: new Date().toISOString(),
          financial_transaction_id: financialTx.id,
          personal_transaction_id: personalTx.id,
        }])
        .select()
        .single();

      if (withdrawalError) {
        console.error('Error creating withdrawal:', withdrawalError);
        throw withdrawalError;
      }

      // 4. Update personal transaction with withdrawal reference
      await supabase
        .from('personal_transactions')
        .update({ source_withdrawal_id: withdrawal.id })
        .eq('id', personalTx.id);

      setWithdrawals(prev => [withdrawal as Withdrawal, ...prev]);

      toast({
        title: 'Sucesso',
        description: `Retirada de R$ ${amount.toFixed(2)} realizada com sucesso!`,
      });

      return withdrawal;
    } catch (error: any) {
      console.error('Error in createWithdrawal:', error);
      toast({
        title: 'Erro ao realizar retirada',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const cancelWithdrawal = async (id: string) => {
    try {
      const withdrawal = withdrawals.find(w => w.id === id);
      if (!withdrawal) throw new Error('Retirada não encontrada');

      // Update withdrawal status
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .update({ status: 'cancelado' })
        .eq('id', id);

      if (withdrawalError) throw withdrawalError;

      // Update financial transaction status
      if (withdrawal.financial_transaction_id) {
        await supabase
          .from('financial_transactions')
          .update({ status: 'cancelado' })
          .eq('id', withdrawal.financial_transaction_id);
      }

      // Update personal transaction status
      if (withdrawal.personal_transaction_id) {
        await supabase
          .from('personal_transactions')
          .update({ status: 'cancelado' })
          .eq('id', withdrawal.personal_transaction_id);
      }

      setWithdrawals(prev =>
        prev.map(w => (w.id === id ? { ...w, status: 'cancelado' as const } : w))
      );

      toast({
        title: 'Sucesso',
        description: 'Retirada cancelada com sucesso!',
      });
    } catch (error: any) {
      console.error('Error in cancelWithdrawal:', error);
      toast({
        title: 'Erro ao cancelar retirada',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getWithdrawalsForMonth = (month: Date) => {
    const monthStr = month.toISOString().slice(0, 7); // YYYY-MM
    return withdrawals.filter(w => 
      w.reference_month.startsWith(monthStr) && w.status === 'confirmado'
    );
  };

  const getTotalWithdrawnForMonth = (month: Date) => {
    return getWithdrawalsForMonth(month).reduce((sum, w) => sum + Number(w.amount), 0);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return {
    withdrawals,
    loading,
    createWithdrawal,
    cancelWithdrawal,
    getWithdrawalsForMonth,
    getTotalWithdrawnForMonth,
    refetch: fetchWithdrawals,
  };
}
