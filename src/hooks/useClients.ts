import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getUserFriendlyError } from '@/lib/errorMessages';

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      toast({
        title: 'Erro ao carregar clientes',
        description: getUserFriendlyError(error, 'fetchClients'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({ ...client, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      setClients(prev => [...prev, data]);
      toast({ title: 'Cliente cadastrado com sucesso!' });
      return data;
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar cliente',
        description: getUserFriendlyError(error, 'createClient'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setClients(prev => prev.map(c => c.id === id ? data : c));
      toast({ title: 'Cliente atualizado com sucesso!' });
      return data;
    } catch (error) {
      toast({
        title: 'Erro ao atualizar cliente',
        description: getUserFriendlyError(error, 'updateClient'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setClients(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Cliente excluído com sucesso!' });
      return true;
    } catch (error) {
      toast({
        title: 'Erro ao excluir cliente',
        description: getUserFriendlyError(error, 'deleteClient'),
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}
