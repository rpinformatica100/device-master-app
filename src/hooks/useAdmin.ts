import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  raw_user_meta_data: {
    full_name?: string;
    phone?: string;
    company_name?: string;
    cnpj?: string;
  };
  subscription?: {
    id: string;
    plan: string;
    status: string;
    starts_at: string | null;
    expires_at: string | null;
    notes: string | null;
  } | null;
}

export interface SubscriptionPayment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  payment_method: string | null;
  status: string;
  reference_month: string | null;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Get all users via edge function or auth admin
      // Since we can't query auth.users directly, we use company_settings + subscriptions
      const { data: settings, error: settingsError } = await supabase
        .from("company_settings")
        .select("*");
      
      if (settingsError) throw settingsError;

      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*");

      // Map settings to user format
      return (settings || []).map((s: any) => {
        const sub = (subs || []).find((sub: any) => sub.user_id === s.user_id);
        return {
          id: s.user_id,
          email: s.email || "",
          created_at: s.created_at,
          raw_user_meta_data: {
            full_name: s.nome_fantasia || s.razao_social || "",
            phone: s.telefone || "",
            company_name: s.nome_fantasia || "",
            cnpj: s.cnpj || "",
          },
          subscription: sub ? {
            id: sub.id,
            plan: sub.plan,
            status: sub.status,
            starts_at: sub.starts_at,
            expires_at: sub.expires_at,
            notes: sub.notes,
          } : null,
        } as AdminUser;
      });
    },
  });
}

export function useAdminSubscriptions() {
  const queryClient = useQueryClient();

  const upsertSubscription = useMutation({
    mutationFn: async (data: {
      user_id: string;
      plan: string;
      status: string;
      starts_at?: string | null;
      expires_at?: string | null;
      notes?: string | null;
      id?: string;
    }) => {
      if (data.id) {
        const { error } = await supabase
          .from("subscriptions")
          .update({
            plan: data.plan,
            status: data.status,
            starts_at: data.starts_at,
            expires_at: data.expires_at,
            notes: data.notes,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("subscriptions")
          .insert({
            user_id: data.user_id,
            plan: data.plan,
            status: data.status,
            starts_at: data.starts_at,
            expires_at: data.expires_at,
            notes: data.notes,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return { upsertSubscription };
}

export function useAdminPayments(filters?: { month?: string; status?: string; userId?: string }) {
  return useQuery({
    queryKey: ["admin-payments", filters],
    queryFn: async () => {
      let query = supabase
        .from("subscription_payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters?.month) {
        query = query.eq("reference_month", filters.month);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SubscriptionPayment[];
    },
  });
}

export function useAdminPaymentMutations() {
  const queryClient = useQueryClient();

  const createPayment = useMutation({
    mutationFn: async (data: Partial<SubscriptionPayment> & { user_id: string }) => {
      const { error } = await supabase.from("subscription_payments").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, ...data }: Partial<SubscriptionPayment> & { id: string }) => {
      const { error } = await supabase.from("subscription_payments").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subscription_payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    },
  });

  return { createPayment, updatePayment, deletePayment };
}

export function useAdminNotifications() {
  const queryClient = useQueryClient();

  const sendNotification = useMutation({
    mutationFn: async (data: { user_id?: string | null; title: string; message: string; type: string }) => {
      const { error } = await supabase.from("admin_notifications").insert({
        user_id: data.user_id || null,
        title: data.title,
        message: data.message,
        type: data.type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });

  const notifications = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  return { sendNotification, notifications };
}

export function useUserNotifications(userId?: string) {
  return useQuery({
    queryKey: ["user-notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .or(`user_id.eq.${userId},user_id.is.null`)
        .is("read_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    },
  });
}
