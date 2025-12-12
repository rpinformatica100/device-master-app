import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar produtos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({ ...product, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      setProducts(prev => [...prev, data]);
      toast({ title: 'Produto cadastrado com sucesso!' });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao cadastrar produto',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === id ? data : p));
      toast({ title: 'Produto atualizado com sucesso!' });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar produto',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Produto excluído com sucesso!' });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir produto',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
