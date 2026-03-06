import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useMessages";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: FileText, label: "Ordens", path: "/ordens" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: Package, label: "Estoque", path: "/estoque" },
  { icon: MessageCircle, label: "Mensagens", path: "/mensagens", hasBadge: true },
];

export function MobileBottomNav() {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      {/* Blur background */}
      <div className="absolute inset-0 bg-card/90 backdrop-blur-xl border-t border-border" />
      
      {/* Safe area padding for devices with home indicator */}
      <div className="relative flex items-center justify-around px-1 py-1.5 pb-[env(safe-area-inset-bottom,4px)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 min-w-[52px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-1 rounded-lg transition-all duration-200",
                  isActive && "bg-primary/10"
                )}>
                  <item.icon className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                </div>
                <span className={cn(
                  "text-[9px] font-medium transition-all duration-200",
                  isActive && "text-primary font-semibold"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
}
