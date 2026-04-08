import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlanPricing {
  id: string;
  plan_key: string;
  name: string;
  price: number;
  period_label: string;
  description: string | null;
  features: string[];
  popular: boolean;
  active: boolean;
  updated_at: string;
}

export function usePlanPricing() {
  return useQuery({
    queryKey: ["plan-pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_pricing")
        .select("*")
        .eq("active", true)
        .order("price", { ascending: true });
      if (error) throw error;
      return (data as any[]).map((d) => ({
        ...d,
        features: Array.isArray(d.features) ? d.features : JSON.parse(d.features || "[]"),
      })) as PlanPricing[];
    },
  });
}

export function useUpdatePlanPricing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: Partial<PlanPricing> & { id: string }) => {
      const { id, ...updates } = plan;
      const { error } = await supabase
        .from("plan_pricing")
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan-pricing"] });
    },
  });
}
