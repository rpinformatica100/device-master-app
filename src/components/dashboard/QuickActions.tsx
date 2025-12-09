import { motion } from "framer-motion";
import { Plus, UserPlus, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "Nova OS", variant: "default" as const },
  { icon: UserPlus, label: "Novo Cliente", variant: "secondary" as const },
  { icon: Package, label: "Entrada Estoque", variant: "secondary" as const },
  { icon: FileText, label: "Relatório", variant: "secondary" as const },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
          >
            <Button
              variant={action.variant}
              className="w-full h-auto py-4 flex flex-col gap-2"
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
