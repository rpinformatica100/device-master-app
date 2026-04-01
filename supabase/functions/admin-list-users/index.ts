import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create client with user's token to check role
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roles } = await userClient.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = (roles || []).some((r: any) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to list ALL auth users
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const allUsers: any[] = [];
    let page = 1;
    const perPage = 100;
    while (true) {
      const { data: { users }, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) throw error;
      if (!users || users.length === 0) break;
      allUsers.push(...users);
      if (users.length < perPage) break;
      page++;
    }

    // Get subscriptions and company_settings
    const { data: subs } = await adminClient.from("subscriptions").select("*");
    const { data: settings } = await adminClient.from("company_settings").select("*");
    const { data: userRoles } = await adminClient.from("user_roles").select("*");

    // Map users
    const result = allUsers.map((u: any) => {
      const sub = (subs || []).find((s: any) => s.user_id === u.id);
      const cs = (settings || []).find((s: any) => s.user_id === u.id);
      const roles = (userRoles || []).filter((r: any) => r.user_id === u.id).map((r: any) => r.role);

      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        email_confirmed_at: u.email_confirmed_at,
        last_sign_in_at: u.last_sign_in_at,
        raw_user_meta_data: u.user_metadata || {},
        roles,
        subscription: sub ? {
          id: sub.id,
          plan: sub.plan,
          status: sub.status,
          starts_at: sub.starts_at,
          expires_at: sub.expires_at,
          notes: sub.notes,
        } : null,
        company_settings: cs ? {
          nome_fantasia: cs.nome_fantasia,
          razao_social: cs.razao_social,
          cnpj: cs.cnpj,
          telefone: cs.telefone,
          email: cs.email,
          cidade: cs.cidade,
          estado: cs.estado,
        } : null,
      };
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
