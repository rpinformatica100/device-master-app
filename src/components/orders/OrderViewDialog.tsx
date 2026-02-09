import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  Mail, 
  Smartphone, 
  Calendar, 
  Package, 
  Wrench,
  FileText,
  Edit,
  Printer,
  Clock,
  Cpu,
  HardDrive,
  Monitor,
  CheckCircle,
  FileBarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentDialog, PaymentData } from "@/components/financial/PaymentDialog";
import { useOrders, PaymentInfo } from "@/hooks/useOrders";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  em_andamento: { label: "Em Andamento", className: "bg-info/20 text-info border-info/30" },
  aguardando: { label: "Aguardando", className: "bg-warning/20 text-warning border-warning/30" },
  concluido: { label: "Concluído", className: "bg-success/20 text-success border-success/30" },
  aguardando_peca: { label: "Aguard. Peça", className: "bg-muted text-muted-foreground border-muted" },
  entregue: { label: "Entregue", className: "bg-primary/20 text-primary border-primary/30" },
  cancelado: { label: "Cancelado", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const priorityConfig = {
  alta: { label: "Alta", className: "bg-destructive/20 text-destructive border-destructive/30" },
  media: { label: "Média", className: "bg-warning/20 text-warning border-warning/30" },
  baixa: { label: "Baixa", className: "bg-success/20 text-success border-success/30" },
};

// Campos específicos por categoria para exibição
const categoryDisplayFields: Record<string, { label: string; key: string; icon?: any }[]> = {
  smartphone: [
    { label: "IMEI", key: "imei" },
    { label: "Cor", key: "color" },
    { label: "Capacidade", key: "storage" },
  ],
  tablet: [
    { label: "IMEI", key: "imei" },
    { label: "Cor", key: "color" },
    { label: "Capacidade", key: "storage" },
  ],
  notebook: [
    { label: "Processador", key: "processor", icon: Cpu },
    { label: "Memória RAM", key: "ram" },
    { label: "Armazenamento", key: "storage", icon: HardDrive },
    { label: "Sistema Operacional", key: "os" },
  ],
  desktop: [
    { label: "Processador", key: "processor", icon: Cpu },
    { label: "Memória RAM", key: "ram" },
    { label: "Armazenamento", key: "storage", icon: HardDrive },
    { label: "Placa de Vídeo", key: "gpu" },
    { label: "Sistema Operacional", key: "os" },
  ],
  impressora: [
    { label: "Tipo", key: "printerType" },
    { label: "Conectividade", key: "connectivity" },
    { label: "Modelo do Cartucho/Toner", key: "cartridge" },
  ],
  monitor: [
    { label: "Tamanho", key: "screenSize", icon: Monitor },
    { label: "Resolução", key: "resolution" },
    { label: "Tipo de Painel", key: "panelType" },
  ],
  outros: [],
};

interface OrderViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onEdit: () => void;
  onOrderUpdated?: () => void;
}

export function OrderViewDialog({ open, onOpenChange, order, onEdit, onOrderUpdated }: OrderViewDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { updateOrder } = useOrders();
  const { settings: company } = useCompanySettings();
  const navigate = useNavigate();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  // Check if order can be finalized (not already completed/entregue/cancelado)
  const canFinalize = ['em_andamento', 'aguardando', 'aguardando_peca'].includes(order.status);

  const items = (order.items || []).map((item: any) => ({
    ...item,
    price: item.sale_price || item.price || 0,
  }));

  const total = items.reduce((sum: number, item: any) => sum + (item.price || 0) * item.quantity, 0);
  const categoryFields = categoryDisplayFields[order.category] || [];
  
  // Parse checklist from category_specific_fields
  const categorySpecificFields = order.category_specific_fields as Record<string, any> || {};
  let mobileChecklist: Record<string, boolean | null> = {};
  let checklistObservations = '';
  
  // Only parse checklist if category is mobile device
  const isMobileDevice = order.category === 'smartphone' || order.category === 'tablet';
  
  if (isMobileDevice && categorySpecificFields.mobile_checklist) {
    try {
      mobileChecklist = typeof categorySpecificFields.mobile_checklist === 'string' 
        ? JSON.parse(categorySpecificFields.mobile_checklist) 
        : categorySpecificFields.mobile_checklist;
    } catch { mobileChecklist = {}; }
  }
  if (isMobileDevice && categorySpecificFields.checklist_observations) {
    checklistObservations = categorySpecificFields.checklist_observations;
  }
  
  const hasChecklist = isMobileDevice && Object.keys(mobileChecklist).length > 0;

  // Checklist labels mapping
  const checklistLabels: Record<string, string> = {
    display: 'Tela/Display',
    touchscreen: 'Touchscreen',
    camera_frontal: 'Câmera Frontal',
    camera_traseira: 'Câmera Traseira',
    microfone: 'Microfone',
    alto_falante: 'Alto-falante',
    auricular: 'Auricular',
    wifi: 'Wi-Fi',
    bluetooth: 'Bluetooth',
    bateria: 'Bateria',
    biometria: 'Biometria',
    vibracao: 'Vibração',
    botoes: 'Botões',
    chip: 'Chip/SIM',
    sensores: 'Sensores',
  };

  // HTML escape function to prevent XSS attacks
  const escapeHtml = (text: string | null | undefined): string => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Print is now handled by dedicated pages (/ordens/:id/imprimir and /ordens/:id/orcamento)

  const handleFinalizeOrder = async (paymentData: PaymentData) => {
    setIsSubmitting(true);
    try {
      const paymentInfo: PaymentInfo = {
        payment_method: paymentData.payment_method,
        payment_details: paymentData.payment_details,
      };
      
      await updateOrder(
        order.id,
        { status: 'concluido' },
        undefined,
        paymentInfo,
        paymentData.payment_date
      );
      
      setShowPaymentDialog(false);
      onOrderUpdated?.();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{order.os_number || order.id}</DialogTitle>
              <Badge
                variant="outline"
                className={cn("text-xs", statusConfig[order.status as keyof typeof statusConfig]?.className)}
              >
                {statusConfig[order.status as keyof typeof statusConfig]?.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-xs", priorityConfig[order.priority as keyof typeof priorityConfig]?.className)}
              >
                {priorityConfig[order.priority as keyof typeof priorityConfig]?.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div ref={printRef} className="space-y-6 py-4">
          {/* Informações do Cliente */}
          <div className="glass rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados do Cliente
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nome</p>
                <p className="font-medium">{order.client?.name || "Não informado"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Telefone</p>
                <p className="font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {order.client?.phone || "Não informado"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {order.client?.email || "Não informado"}
                </p>
              </div>
            </div>
          </div>

          {/* Informações do Dispositivo */}
          <div className="glass rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Dados do Equipamento
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Dispositivo</p>
                <p className="font-medium">{order.device}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Categoria</p>
                <p className="font-medium capitalize">{order.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Número de Série</p>
                <p className="font-medium font-mono">{order.serial_number || "Não informado"}</p>
              </div>
              
              {/* Campos específicos da categoria */}
              {categoryFields.map((field) => {
                const value = categorySpecificFields[field.key] || order[field.key];
                if (!value) return null;
                const IconComponent = field.icon;
                return (
                  <div key={field.key}>
                    <p className="text-muted-foreground">{field.label}</p>
                    <p className="font-medium flex items-center gap-1">
                      {IconComponent && <IconComponent className="w-3 h-3" />}
                      {value}
                    </p>
                  </div>
                );
              })}

              <div>
                <p className="text-muted-foreground">Senha</p>
                <p className="font-medium">{order.password || "Não informado"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Acessórios</p>
                <p className="font-medium">{order.accessories || "Nenhum"}</p>
              </div>
            </div>
          </div>

          {/* Checklist de Entrada */}
          {hasChecklist && (
            <div className="glass rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Checklist de Entrada
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {Object.entries(mobileChecklist).map(([key, value]) => {
                  const label = checklistLabels[key] || key;
                  return (
                    <div key={key} className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                      value === true ? 'bg-success/20 text-success' : 
                      value === false ? 'bg-destructive/20 text-destructive' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {value === true ? '✓' : value === false ? '✗' : '-'} {label}
                    </div>
                  );
                })}
              </div>
              {checklistObservations && (
                <div className="p-2 bg-warning/10 rounded text-sm">
                  <strong>Obs:</strong> {checklistObservations}
                </div>
              )}
            </div>
          )}

          {/* Defeito */}
          <div className="glass rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Defeito Relatado
            </h3>
            <p className="text-sm text-foreground">{order.issue}</p>
          </div>

          {/* Produtos e Serviços */}
          <div className="glass rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produtos e Serviços
            </h3>
            <div className="border border-border rounded-lg divide-y divide-border">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    {item.item_type === "product" || item.type === "product" ? (
                      <Package className="w-4 h-4 text-info" />
                    ) : (
                      <Wrench className="w-4 h-4 text-success" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x R$ {(item.price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium">R$ {((item.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-secondary/30">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Timeline / Histórico */}
          <div className="glass rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Histórico
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-success mt-1.5" />
                <div>
                  <p className="font-medium">OS Criada</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {order.completed_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-info mt-1.5" />
                  <div>
                    <p className="font-medium">Concluído</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.completed_at).toLocaleDateString('pt-BR')} às {new Date(order.completed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-border">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/ordens/${order.id}/imprimir`)}>
              <Printer className="w-4 h-4" />
              Imprimir OS
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/ordens/${order.id}/orcamento`)}>
              <FileBarChart className="w-4 h-4" />
              Orçamento
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {canFinalize && (
              <Button 
                variant="default"
                className="gap-2 bg-success hover:bg-success/90"
                onClick={() => setShowPaymentDialog(true)}
                disabled={isSubmitting}
              >
                <CheckCircle className="w-4 h-4" />
                Finalizar OS
              </Button>
            )}
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button onClick={onEdit} className="gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Payment Dialog for finalizing order */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        title="Finalizar OS - Registrar Pagamento"
        amount={total}
        onConfirm={handleFinalizeOrder}
        isLoading={isSubmitting}
        showDateField={true}
      />
    </Dialog>
  );
}
