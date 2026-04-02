import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  subscriptionStatus: string | null;
  subscriptionExpiresAt: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string, metadata?: { phone?: string; company_name?: string; cnpj?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);

  const checkAdminAndSubscription = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      const adminRole = (roles || []).some((r: any) => r.role === "admin");
      setIsAdmin(adminRole);

      if (adminRole) {
        // Admins always have full access - no subscription needed
        setSubscriptionStatus("ativo");
        setSubscriptionExpiresAt(null);
        return;
      }

      // For regular users, check subscription
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("status, expires_at, plan")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (subs && subs.length > 0) {
        let status = subs[0].status;
        const expiresAt = subs[0].expires_at;
        setSubscriptionExpiresAt(expiresAt);

        // If status is "ativo" but expires_at has passed, treat as expired
        if (status === "ativo" && expiresAt && new Date(expiresAt) < new Date()) {
          status = "expirado";
        }
        
        // If status is "ativo" and no expires_at, still allow access (admin activated without date)
        setSubscriptionStatus(status);
      } else {
        // No subscription record = new user waiting activation
        setSubscriptionStatus("aguardando");
        setSubscriptionExpiresAt(null);
      }
    } catch (err) {
      console.error("Error checking admin/subscription:", err);
      setSubscriptionStatus(null);
      setSubscriptionExpiresAt(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    let initialLoad = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer DB calls to avoid deadlock with auth callback
          setTimeout(async () => {
            if (!mounted) return;
            await checkAdminAndSubscription(session.user.id);
            if (mounted && initialLoad) {
              initialLoad = false;
              setLoading(false);
            }
          }, 0);
        } else {
          setIsAdmin(false);
          setSubscriptionStatus(null);
          setSubscriptionExpiresAt(null);
          if (initialLoad) {
            initialLoad = false;
            setLoading(false);
          }
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkAdminAndSubscription(session.user.id);
      }
      if (mounted) {
        initialLoad = false;
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, name?: string, metadata?: { phone?: string; company_name?: string; cnpj?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { 
          full_name: name,
          phone: metadata?.phone,
          company_name: metadata?.company_name,
          cnpj: metadata?.cnpj
        }
      }
    });

    if (!error && data.user) {
      try {
        await supabase.from('company_settings').insert({
          user_id: data.user.id,
          nome_fantasia: metadata?.company_name || null,
          cnpj: metadata?.cnpj || null,
          telefone: metadata?.phone || null,
          email: email,
        });
      } catch (e) {
        console.error('Error creating initial company settings:', e);
      }
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, subscriptionStatus, subscriptionExpiresAt, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
