import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, UserPlus, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { OrderFormDialog } from "@/components/orders/OrderFormDialog";

const actions = [
  { icon: Plus, label: "Nova OS", variant: "default" as const, action: "new-order" },
  { icon: UserPlus, label: "Novo Cliente", variant: "secondary" as const, action: "new-client" },
  { icon: Package, label: "Estoque", variant: "secondary" as const, action: "inventory" },
  { icon: FileText, label: "Financeiro", variant: "secondary" as const, action: "financial" },
];

export function QuickActions() {
  const navigate = useNavigate();
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const handleAction = (action: string) => {
    switch (action) {
      case "new-order":
        setShowOrderDialog(true);
        break;
      case "new-client":
        navigate("/clientes");
        break;
      case "inventory":
        navigate("/estoque");
        break;
      case "financial":
        navigate("/financeiro");
        break;
    }
  };

  return (
    <>
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
                onClick={() => handleAction(action.action)}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <OrderFormDialog
        open={showOrderDialog}
        onOpenChange={setShowOrderDialog}
      />
    </>
  );
}
