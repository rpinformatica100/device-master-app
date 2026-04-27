import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditEntry {
  id: string;
  actor_id: string;
  actor_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_data: any;
  new_data: any;
  details: any;
  created_at: string;
}

export function useAuditLog(limit = 100) {
  return useQuery({
    queryKey: ["admin-audit-log", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as AuditEntry[];
    },
  });
}

export function useLogAuditEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      action: string;
      resource_type: string;
      resource_id?: string | null;
      old_data?: any;
      new_data?: any;
      details?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("admin_audit_log").insert({
        actor_id: user.id,
        actor_email: user.email,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id ?? null,
        old_data: entry.old_data ?? null,
        new_data: entry.new_data ?? null,
        details: entry.details ?? {},
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-audit-log"] }),
  });
}

export function useAdminUserActions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      action: "reset_password" | "soft_delete" | "hard_delete";
      target_user_id: string;
      new_password?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await supabase.functions.invoke("admin-user-actions", {
        body: input,
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.error) throw res.error;
      if ((res.data as any)?.error) throw new Error((res.data as any).error);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-audit-log"] });
    },
  });
}
