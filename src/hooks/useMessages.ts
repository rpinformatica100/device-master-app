import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  message: string;
  type: string;
  read_at: string | null;
  parent_message_id: string | null;
  created_at: string;
}

// For user side: get messages sent to me or global
export function useUserMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-messages", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`recipient_id.eq.${user!.id},recipient_id.is.null`)
        .is("parent_message_id", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Message[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("user-messages-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["user-messages"] });
        queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  return query;
}

export function useUnreadCount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["unread-count", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .or(`recipient_id.eq.${user!.id},recipient_id.is.null`)
        .is("read_at", null)
        .is("parent_message_id", null)
        .neq("sender_id", user!.id);
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  // Realtime
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("unread-count-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "messages",
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  return query;
}

export function useMessageReplies(parentId: string | null) {
  return useQuery({
    queryKey: ["message-replies", parentId],
    enabled: !!parentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("parent_message_id", parentId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-messages"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });
}

export function useSendReply() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ parentId, message }: { parentId: string; message: string }) => {
      const { error } = await supabase.from("messages").insert({
        sender_id: user!.id,
        recipient_id: null, // admin will see via parent
        message,
        type: "reply",
        parent_message_id: parentId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-replies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });
}

// Admin side: get all messages
export function useAdminMessages() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .is("parent_message_id", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Message[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-messages-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "messages",
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
        queryClient.invalidateQueries({ queryKey: ["message-replies"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}

export function useAdminSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { recipient_id: string | null; message: string; type: string; parent_message_id?: string | null }) => {
      const { error } = await supabase.from("messages").insert({
        sender_id: user!.id,
        recipient_id: data.recipient_id,
        message: data.message,
        type: data.type,
        parent_message_id: data.parent_message_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });
}
