import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wrench,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Ordens de Serviço", path: "/ordens" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: Package, label: "Estoque", path: "/estoque" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "US";

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";
  const userEmail = user?.email || "";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Wrench className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-foreground">TechOS</span>
          )}
        </motion.div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <motion.span
                    initial={false}
                    animate={{ opacity: collapsed ? 0 : 1 }}
                    className="font-medium text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer with User Info and Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-xs font-semibold text-sidebar-accent-foreground">{userInitials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <span className="font-medium text-sm">Sair</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
