import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface CompanySettings {
  id: string;
  user_id: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | null;
  inscricao_estadual: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  created_at: string;
  updated_at: string;
}

export function useCompanySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching company settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (data: Partial<CompanySettings>) => {
    if (!user) return false;
    try {
      if (settings) {
        // Update existing
        const { error } = await supabase
          .from('company_settings')
          .update(data)
          .eq('id', settings.id);
        
        if (error) throw error;
        setSettings({ ...settings, ...data } as CompanySettings);
      } else {
        // Create new
        const { data: newSettings, error } = await supabase
          .from('company_settings')
          .insert({ ...data, user_id: user.id })
          .select()
          .single();
        
        if (error) throw error;
        setSettings(newSettings);
      }
      
      toast({ title: 'Configurações salvas com sucesso!' });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    saveSettings,
    fetchSettings,
  };
}
