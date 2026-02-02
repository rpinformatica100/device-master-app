import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Menu,
  X,
  LogOut,
  Settings,
  Wallet,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const menuItems = [
    { icon: Smartphone, label: "Seminovos", path: "/seminovos" },
    { icon: Wallet, label: "Pessoal", path: "/pessoal" },
    { icon: Settings, label: "Configurações", path: "/configuracoes" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-card/90 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <Wrench className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-base text-foreground">TechOS</span>
            </div>

            {/* User Avatar & Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xs font-semibold text-foreground">{userInitials}</span>
              </div>
              {isMenuOpen ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[60px] right-4 z-50 w-56 md:hidden"
            >
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {/* User Info */}
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-border py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
