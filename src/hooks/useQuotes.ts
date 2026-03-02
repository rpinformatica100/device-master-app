import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Quote, QuoteItemInput } from '@/types/quote';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getUserFriendlyError } from '@/lib/errorMessages';

export function useQuotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, clients(*), quote_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map((q: any) => ({
        ...q,
        client: q.clients,
        items: q.quote_items,
      }));
      setQuotes(mapped);
    } catch (error) {
      toast({
        title: 'Erro ao carregar orçamentos',
        description: getUserFriendlyError(error, 'fetchQuotes'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (
    quoteData: {
      client_id?: string;
      title: string;
      description?: string;
      equipment_description?: string;
      problem_description?: string;
      solution_description?: string;
      validity_days?: number;
      interest_rate?: number;
      max_installments?: number;
      discount_percentage?: number;
      notes?: string;
      order_id?: string;
    },
    items: QuoteItemInput[]
  ) => {
    if (!user) return null;
    try {
      const { data: numData, error: numError } = await supabase.rpc('generate_next_quote_number');
      if (numError) throw numError;

      const totalCost = items.reduce((s, i) => s + i.cost_price * i.quantity, 0);
      const totalSale = items.reduce((s, i) => s + i.sale_price * i.quantity, 0);

      const { data, error } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
          quote_number: numData,
          client_id: quoteData.client_id || null,
          title: quoteData.title,
          description: quoteData.description || null,
          equipment_description: quoteData.equipment_description || null,
          problem_description: quoteData.problem_description || null,
          solution_description: quoteData.solution_description || null,
          validity_days: quoteData.validity_days || 7,
          interest_rate: quoteData.interest_rate || 2.99,
          max_installments: quoteData.max_installments || 12,
          discount_percentage: quoteData.discount_percentage || 0,
          notes: quoteData.notes || null,
          order_id: quoteData.order_id || null,
          total_cost: totalCost,
          total_sale: totalSale,
          total_profit: totalSale - totalCost,
        })
        .select()
        .single();

      if (error) throw error;

      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(items.map(i => ({
            quote_id: data.id,
            item_type: i.item_type,
            item_id: i.item_id || null,
            name: i.name,
            description: i.description || null,
            quantity: i.quantity,
            cost_price: i.cost_price,
            sale_price: i.sale_price,
          })));
        if (itemsError) throw itemsError;
      }

      toast({ title: 'Orçamento criado com sucesso!' });
      await fetchQuotes();
      return data;
    } catch (error) {
      toast({
        title: 'Erro ao criar orçamento',
        description: getUserFriendlyError(error, 'createQuote'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateQuote = async (
    id: string,
    quoteData: Partial<Quote>,
    items?: QuoteItemInput[]
  ) => {
    try {
      const updates: any = { ...quoteData };
      delete updates.client;
      delete updates.items;
      delete updates.id;
      delete updates.user_id;
      delete updates.created_at;

      if (items) {
        const totalCost = items.reduce((s, i) => s + i.cost_price * i.quantity, 0);
        const totalSale = items.reduce((s, i) => s + i.sale_price * i.quantity, 0);
        updates.total_cost = totalCost;
        updates.total_sale = totalSale;
        updates.total_profit = totalSale - totalCost;
      }

      const { error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      if (items) {
        await supabase.from('quote_items').delete().eq('quote_id', id);
        if (items.length > 0) {
          const { error: itemsError } = await supabase
            .from('quote_items')
            .insert(items.map(i => ({
              quote_id: id,
              item_type: i.item_type,
              item_id: i.item_id || null,
              name: i.name,
              description: i.description || null,
              quantity: i.quantity,
              cost_price: i.cost_price,
              sale_price: i.sale_price,
            })));
          if (itemsError) throw itemsError;
        }
      }

      toast({ title: 'Orçamento atualizado com sucesso!' });
      await fetchQuotes();
      return true;
    } catch (error) {
      toast({
        title: 'Erro ao atualizar orçamento',
        description: getUserFriendlyError(error, 'updateQuote'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateQuoteStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'aprovado') updates.approved_at = new Date().toISOString();
      if (status === 'rejeitado') updates.rejected_at = new Date().toISOString();

      const { error } = await supabase.from('quotes').update(updates).eq('id', id);
      if (error) throw error;

      setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
      toast({ title: `Orçamento ${status === 'aprovado' ? 'aprovado' : status === 'rejeitado' ? 'rejeitado' : 'atualizado'}!` });
      return true;
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: getUserFriendlyError(error, 'updateQuoteStatus'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      const { error } = await supabase.from('quotes').delete().eq('id', id);
      if (error) throw error;
      setQuotes(prev => prev.filter(q => q.id !== id));
      toast({ title: 'Orçamento excluído com sucesso!' });
      return true;
    } catch (error) {
      toast({
        title: 'Erro ao excluir orçamento',
        description: getUserFriendlyError(error, 'deleteQuote'),
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return {
    quotes,
    loading,
    fetchQuotes,
    createQuote,
    updateQuote,
    updateQuoteStatus,
    deleteQuote,
  };
}
