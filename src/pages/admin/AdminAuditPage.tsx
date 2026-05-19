import AdminLayout from "@/components/admin/AdminLayout";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShieldCheck } from "lucide-react";

const actionLabels: Record<string, { label: string; color: string }> = {
  reset_password: { label: "Reset de senha", color: "bg-blue-500/10 text-blue-600" },
  soft_delete: { label: "Suspensão", color: "bg-amber-500/10 text-amber-600" },
  reactivate: { label: "Reativação", color: "bg-emerald-500/10 text-emerald-600" },
  hard_delete: { label: "Exclusão permanente", color: "bg-destructive/10 text-destructive" },
};

export default function AdminAuditPage() {
  const { data: entries = [], isLoading } = useAuditLog(200);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Auditoria</h1>
            <p className="text-sm text-muted-foreground">Histórico de ações administrativas</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs">Admin</TableHead>
                <TableHead className="text-xs">Ação</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Recurso</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">Carregando...</TableCell></TableRow>
              ) : entries.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">Nenhuma ação registrada</TableCell></TableRow>
              ) : entries.map((e) => {
                const meta = actionLabels[e.action] || { label: e.action, color: "bg-muted text-muted-foreground" };
                return (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(e.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-xs">{e.actor_email || e.actor_id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${meta.color}`}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{e.resource_type}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell font-mono text-muted-foreground">
                      {e.resource_id?.slice(0, 8) || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
