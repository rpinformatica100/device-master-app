import { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuditLog, type AuditEntry } from "@/hooks/useAuditLog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDown, RefreshCw, ShieldCheck } from "lucide-react";

const actionLabels: Record<string, { label: string; color: string }> = {
  reset_password: { label: "Reset de senha", color: "bg-primary/10 text-primary" },
  soft_delete: { label: "Suspensão", color: "bg-accent text-accent-foreground" },
  reactivate: { label: "Reativação", color: "bg-secondary text-secondary-foreground" },
  hard_delete: { label: "Exclusão permanente", color: "bg-destructive/10 text-destructive" },
};

const metaFor = (a: string) => actionLabels[a] || { label: a, color: "bg-muted text-muted-foreground" };
const fullDate = (d: string) => format(new Date(d), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });

function Details({ e }: { e: AuditEntry }) {
  const payload = { details: e.details, old_data: e.old_data, new_data: e.new_data };
  const has = Object.values(payload).some((v) => v && (typeof v !== "object" || Object.keys(v).length));
  if (!has) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" aria-label={`Ver detalhes da ação ${metaFor(e.action).label} em ${fullDate(e.created_at)}`}>
          Detalhes <ChevronDown className="w-3 h-3" aria-hidden="true" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="mt-2 max-w-[60vw] md:max-w-md overflow-auto rounded-md bg-muted p-2 text-[10px] font-mono">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function AdminAuditPage() {
  const { data: entries = [], isLoading, isError, refetch, isFetching } = useAuditLog(1000);
  const [action, setAction] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (action !== "all" && e.action !== action) return false;
      if (!q) return true;
      return [e.actor_email, e.resource_id, e.resource_type, e.details?.target_email]
        .some((v) => String(v ?? "").toLowerCase().includes(q));
    });
  }, [entries, action, search]);

  const target = (e: AuditEntry) => e.details?.target_email || e.resource_id || "—";

  return (
    <AdminLayout>
      <section className="space-y-6" aria-labelledby="audit-title">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center" aria-hidden="true">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 id="audit-title" className="text-xl font-bold">Auditoria</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Todas as ações administrativas, incluindo suspensões e exclusões</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="text-xs gap-1">
            <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" /> Atualizar
          </Button>
        </header>

        <div className="grid gap-3 sm:grid-cols-2" role="search" aria-label="Filtrar registros de auditoria">
          <div className="space-y-1">
            <Label htmlFor="audit-search" className="text-xs">Buscar (admin, usuário afetado ou ID)</Label>
            <Input id="audit-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ex.: cliente@email.com" className="text-sm" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="audit-action" className="text-xs">Tipo de ação</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger id="audit-action" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {Object.entries(actionLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
          {isLoading ? "Carregando registros..." : `${filtered.length} de ${entries.length} registros`}
        </p>

        {isError && <p role="alert" className="text-sm text-destructive">Não foi possível carregar a auditoria.</p>}

        {/* Mobile cards */}
        <ul className="space-y-2 md:hidden" aria-label="Registros de auditoria">
          {filtered.map((e) => {
            const m = metaFor(e.action);
            return (
              <li key={e.id} className="bg-card border border-border rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={`text-[10px] ${m.color}`}>{m.label}</Badge>
                  <time dateTime={e.created_at} className="text-xs text-muted-foreground">{fullDate(e.created_at)}</time>
                </div>
                <p className="text-sm"><span className="text-muted-foreground">Afetado: </span>{target(e)}</p>
                <p className="text-xs text-muted-foreground">Por {e.actor_email || e.actor_id.slice(0, 8)}</p>
                <Details e={e} />
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableCaption className="sr-only">Registro de ações administrativas, do mais recente ao mais antigo</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="text-xs">Data e hora</TableHead>
                <TableHead scope="col" className="text-xs">Ação</TableHead>
                <TableHead scope="col" className="text-xs">Usuário afetado</TableHead>
                <TableHead scope="col" className="text-xs">Realizado por</TableHead>
                <TableHead scope="col" className="text-xs">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">Nenhuma ação encontrada</TableCell></TableRow>
              ) : filtered.map((e) => {
                const m = metaFor(e.action);
                return (
                  <TableRow key={e.id} className="align-top">
                    <TableCell className="text-xs whitespace-nowrap"><time dateTime={e.created_at}>{fullDate(e.created_at)}</time></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${m.color}`}>{m.label}</Badge></TableCell>
                    <TableCell className="text-xs">
                      <div>{e.details?.target_email || "—"}</div>
                      {e.resource_id && <div className="font-mono text-[10px] text-muted-foreground">{e.resource_id}</div>}
                    </TableCell>
                    <TableCell className="text-xs">{e.actor_email || e.actor_id.slice(0, 8)}</TableCell>
                    <TableCell><Details e={e} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </AdminLayout>
  );
}
