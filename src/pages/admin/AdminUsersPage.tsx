import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useNonAdminUsers } from "@/hooks/useAdmin";
import { useAdminUserActions } from "@/hooks/useAuditLog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, Search, Phone, Mail, MapPin, Clock, MoreVertical, KeyRound, Ban, Trash2 } from "lucide-react";
import SubscriptionDialog from "@/components/admin/SubscriptionDialog";
import type { AdminUser } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  ativo: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  suspenso: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  expirado: "bg-destructive/10 text-destructive border-destructive/20",
  trial: "bg-primary/10 text-primary border-primary/20",
  aguardando: "bg-muted text-muted-foreground border-border",
};

export default function AdminUsersPage() {
  const { data: nonAdminUsers = [], isLoading } = useNonAdminUsers();
  const userActions = useAdminUserActions();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const filtered = nonAdminUsers.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.email.toLowerCase().includes(q) ||
      (u.company_settings?.nome_fantasia || "").toLowerCase().includes(q) ||
      (u.raw_user_meta_data.full_name || "").toLowerCase().includes(q) ||
      (u.raw_user_meta_data.company_name || "").toLowerCase().includes(q) ||
      (u.company_settings?.cnpj || "").includes(q) ||
      (u.raw_user_meta_data.cnpj || "").includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (u.subscription?.status || "aguardando") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getUserDisplayName = (user: AdminUser) => {
    return (
      user.company_settings?.nome_fantasia ||
      user.raw_user_meta_data.company_name ||
      user.raw_user_meta_data.full_name ||
      user.email.split("@")[0]
    );
  };

  const getUserPhone = (user: AdminUser) => {
    return user.company_settings?.telefone || user.raw_user_meta_data.phone || null;
  };

  const getUserCnpj = (user: AdminUser) => {
    return user.company_settings?.cnpj || user.raw_user_meta_data.cnpj || null;
  };

  const getUserLocation = (user: AdminUser) => {
    if (user.company_settings?.cidade && user.company_settings?.estado) {
      return `${user.company_settings.cidade}/${user.company_settings.estado}`;
    }
    return null;
  };

  // Stats
  const stats = {
    total: nonAdminUsers.length,
    ativos: nonAdminUsers.filter((u) => u.subscription?.status === "ativo").length,
    aguardando: nonAdminUsers.filter((u) => !u.subscription || u.subscription.status === "aguardando").length,
    expirados: nonAdminUsers.filter((u) => u.subscription?.status === "expirado").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Assistências</h1>
          <p className="text-muted-foreground">{stats.total} assistências cadastradas</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-500">{stats.ativos}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{stats.aguardando}</p>
            <p className="text-xs text-muted-foreground">Aguardando</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.expirados}</p>
            <p className="text-xs text-muted-foreground">Expirados</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, CNPJ..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
              <SelectItem value="expirado">Expirado</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Empresa / Nome</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="hidden lg:table-cell">CNPJ</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Expiração</TableHead>
                <TableHead className="hidden lg:table-cell">Último acesso</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma assistência encontrada</TableCell></TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {getUserDisplayName(user)}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                        {getUserLocation(user) && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {getUserLocation(user)}
                          </p>
                        )}
                        {!user.email_confirmed_at && (
                          <Badge variant="outline" className="mt-1 text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                            Email não confirmado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getUserPhone(user) ? (
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {getUserPhone(user)}
                        </span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {getUserCnpj(user) || "—"}
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
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {user.subscription?.expires_at
                          ? format(new Date(user.subscription.expires_at), "dd/MM/yyyy")
                          : "—"
                        }
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {user.last_sign_in_at
                          ? format(new Date(user.last_sign_in_at), "dd/MM/yy HH:mm")
                          : "Nunca"
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => { setSelectedUser(user); setSubDialogOpen(true); }}>
                            <Settings className="w-4 h-4 mr-2" />
                            Gerenciar assinatura
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setResetUser(user); setNewPassword(""); }}>
                            <KeyRound className="w-4 h-4 mr-2" />
                            Resetar senha
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              if (!confirm(`Suspender ${user.email}? O acesso será bloqueado.`)) return;
                              try {
                                await userActions.mutateAsync({ action: "soft_delete", target_user_id: user.id });
                                toast.success("Usuário suspenso");
                              } catch (e: any) { toast.error(e.message); }
                            }}
                          >
                            <Ban className="w-4 h-4 mr-2 text-amber-500" />
                            Suspender acesso
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={async () => {
                              if (!confirm(`EXCLUIR PERMANENTEMENTE ${user.email}? Esta ação não pode ser desfeita.`)) return;
                              try {
                                await userActions.mutateAsync({ action: "hard_delete", target_user_id: user.id });
                                toast.success("Usuário excluído");
                              } catch (e: any) { toast.error(e.message); }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir permanente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Reset password dialog */}
      <Dialog open={!!resetUser} onOpenChange={(o) => !o && setResetUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Resetar senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{resetUser?.email}</p>
            <div className="space-y-1.5">
              <Label className="text-xs">Nova senha (mín. 8 caracteres)</Label>
              <Input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetUser(null)}>Cancelar</Button>
            <Button
              className="gradient-primary"
              disabled={newPassword.length < 8 || userActions.isPending}
              onClick={async () => {
                if (!resetUser) return;
                try {
                  await userActions.mutateAsync({
                    action: "reset_password",
                    target_user_id: resetUser.id,
                    new_password: newPassword,
                  });
                  toast.success("Senha alterada!");
                  setResetUser(null);
                } catch (e: any) { toast.error(e.message); }
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
