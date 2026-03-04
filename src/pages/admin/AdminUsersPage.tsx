import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminUsers } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, Search, Phone, Mail, Building2 } from "lucide-react";
import SubscriptionDialog from "@/components/admin/SubscriptionDialog";
import type { AdminUser } from "@/hooks/useAdmin";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  ativo: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  suspenso: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  expirado: "bg-destructive/10 text-destructive border-destructive/20",
  trial: "bg-primary/10 text-primary border-primary/20",
  aguardando: "bg-muted text-muted-foreground border-border",
};

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [subDialogOpen, setSubDialogOpen] = useState(false);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.raw_user_meta_data.company_name || "").toLowerCase().includes(q) ||
      (u.raw_user_meta_data.full_name || "").toLowerCase().includes(q) ||
      (u.raw_user_meta_data.cnpj || "").includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Assistências</h1>
            <p className="text-muted-foreground">{users.length} assistências cadastradas</p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, CNPJ..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Empresa / Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiração</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma assistência encontrada</TableCell></TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {user.raw_user_meta_data.company_name || user.raw_user_meta_data.full_name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.raw_user_meta_data.phone ? (
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {user.raw_user_meta_data.phone}
                        </span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {user.raw_user_meta_data.cnpj || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-foreground uppercase">
                        {user.subscription?.plan || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[user.subscription?.status || "aguardando"] || statusColors.aguardando}>
                        {user.subscription?.status || "aguardando"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {user.subscription?.expires_at 
                          ? format(new Date(user.subscription.expires_at), "dd/MM/yyyy")
                          : "—"
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setSubDialogOpen(true);
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <SubscriptionDialog
        open={subDialogOpen}
        onOpenChange={setSubDialogOpen}
        user={selectedUser}
      />
    </AdminLayout>
  );
}
