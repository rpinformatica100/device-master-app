

# Correção do Loop Infinito no useAuth

## Problema Identificado

O `useAuth.tsx` tem dois problemas críticos:

1. **`setLoading(true)` dentro do `onAuthStateChange`**: Cada evento de auth (incluindo refresh automático de token) define `loading=true`, o que faz o `AppRoutes` renderizar o spinner, desmontando todas as páginas. Quando `loading` volta a `false`, tudo remonta, podendo disparar novos eventos.

2. **Queries Supabase dentro do `onAuthStateChange`**: Fazer chamadas assíncronas ao banco (como `checkAdminAndSubscription`) dentro do callback do `onAuthStateChange` pode causar deadlocks. A documentação do Supabase recomenda usar `setTimeout` para adiar essas chamadas.

## Solução

Refatorar o `useAuth.tsx`:

- **Remover `setLoading(true)` do `onAuthStateChange`**: O loading só deve ser `true` no carregamento inicial. Eventos subsequentes (token refresh, etc.) atualizam user/session silenciosamente sem mostrar spinner.
- **Usar `setTimeout` para queries dentro do callback**: Adiar `checkAdminAndSubscription` para não bloquear o callback do auth.
- **Manter loading inicial**: Apenas o `getSession()` inicial controla o estado de loading.

## Arquivo Alterado

**`src/hooks/useAuth.tsx`** - Refatorar o `useEffect`:

```typescript
useEffect(() => {
  let mounted = true;
  let initialLoad = true;

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer DB calls to avoid deadlock
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
```

A mudanca principal: **nao** setar `loading=true` em eventos subsequentes de auth. O spinner so aparece no primeiro carregamento.

