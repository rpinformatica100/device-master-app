import { useRef } from "react";
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
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function OrderViewDialog({ open, onOpenChange, order, onEdit }: OrderViewDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

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
  
  if (categorySpecificFields.mobile_checklist) {
    try {
      mobileChecklist = typeof categorySpecificFields.mobile_checklist === 'string' 
        ? JSON.parse(categorySpecificFields.mobile_checklist) 
        : categorySpecificFields.mobile_checklist;
    } catch { mobileChecklist = {}; }
  }
  if (categorySpecificFields.checklist_observations) {
    checklistObservations = categorySpecificFields.checklist_observations;
  }
  
  const hasChecklist = Object.keys(mobileChecklist).length > 0;

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

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = `
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0;
          color: #1a1a1a;
          line-height: 1.4;
          font-size: 11px;
          width: 210mm;
          min-height: 297mm;
        }
        .print-header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 12px;
          margin-bottom: 15px;
        }
        .print-header h1 {
          font-size: 20px;
          margin-bottom: 4px;
        }
        .print-header p {
          font-size: 10px;
          color: #666;
        }
        .os-number {
          font-size: 16px;
          font-weight: bold;
          color: #0066cc;
          margin: 8px 0;
        }
        .section {
          margin-bottom: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 10px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 11px;
          font-weight: bold;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 6px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .info-item {
          font-size: 10px;
        }
        .info-item label {
          display: block;
          color: #666;
          font-size: 9px;
          text-transform: uppercase;
          margin-bottom: 1px;
        }
        .info-item span {
          font-weight: 500;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        .items-table th, .items-table td {
          border: 1px solid #ddd;
          padding: 6px;
          text-align: left;
          font-size: 10px;
        }
        .items-table th {
          background: #f5f5f5;
          font-weight: 600;
        }
        .items-table .total-row {
          background: #f0f7ff;
          font-weight: bold;
        }
        .checklist-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 4px;
          font-size: 9px;
        }
        .checklist-item {
          padding: 4px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .checklist-ok {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .checklist-defect {
          background: #ffebee;
          color: #c62828;
        }
        .checklist-na {
          background: #f5f5f5;
          color: #666;
        }
        .checklist-observations {
          margin-top: 8px;
          padding: 8px;
          background: #fffde7;
          border-radius: 4px;
          font-size: 10px;
        }
        .signature-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 25px;
          padding-top: 15px;
        }
        .signature-box {
          text-align: center;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 40px;
          padding-top: 6px;
          font-size: 10px;
        }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 600;
          margin-left: 6px;
        }
        .badge-status {
          background: #e3f2fd;
          color: #1976d2;
        }
        .badge-priority-alta {
          background: #ffebee;
          color: #c62828;
        }
        .badge-priority-media {
          background: #fff3e0;
          color: #ef6c00;
        }
        .badge-priority-baixa {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .print-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 9px;
          color: #999;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        .defect-box {
          background: #fafafa;
          padding: 8px;
          border-radius: 4px;
          font-size: 11px;
        }
        .terms-text {
          font-size: 9px;
          color: #666;
          line-height: 1.4;
        }
        @media print {
          body { padding: 0; }
          .section { page-break-inside: avoid; }
        }
      </style>
    `;

    const priorityClass = `badge-priority-${order.priority}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OS ${order.id}</title>
          ${styles}
        </head>
        <body>
          <div class="print-header">
            <h1>ORDEM DE SERVIÇO</h1>
            <p>Assistência Técnica</p>
            <div class="os-number">
              ${order.os_number || order.id}
              <span class="badge badge-status">${statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}</span>
              <span class="badge ${priorityClass}">Prioridade: ${priorityConfig[order.priority as keyof typeof priorityConfig]?.label || order.priority}</span>
            </div>
            <p>Data de Abertura: ${new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
          </div>

          <div class="section">
            <div class="section-title">Dados do Cliente</div>
            <div class="info-grid">
              <div class="info-item">
                <label>Nome</label>
                <span>${order.client?.name || "Não informado"}</span>
              </div>
              <div class="info-item">
                <label>Telefone</label>
                <span>${order.client?.phone || "Não informado"}</span>
              </div>
              <div class="info-item">
                <label>Email</label>
                <span>${order.client?.email || "Não informado"}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Dados do Equipamento</div>
            <div class="info-grid">
              <div class="info-item">
                <label>Dispositivo</label>
                <span>${order.device}</span>
              </div>
              <div class="info-item">
                <label>Categoria</label>
                <span>${order.category}</span>
              </div>
              <div class="info-item">
                <label>Número de Série</label>
                <span>${order.serial_number || "Não informado"}</span>
              </div>
              ${categoryFields.map(field => {
                const value = categorySpecificFields[field.key] || order[field.key];
                return `
                <div class="info-item">
                  <label>${field.label}</label>
                  <span>${value || "Não informado"}</span>
                </div>
              `;
              }).join('')}
              <div class="info-item">
                <label>Senha</label>
                <span>${order.password || "Não informado"}</span>
              </div>
              <div class="info-item">
                <label>Acessórios</label>
                <span>${order.accessories || "Nenhum"}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Defeito Relatado</div>
            <div class="defect-box">${order.issue}</div>
          </div>

          ${hasChecklist ? `
          <div class="section">
            <div class="section-title">Checklist de Entrada</div>
            <div class="checklist-grid">
              ${Object.entries(mobileChecklist).map(([key, value]) => {
                const label = checklistLabels[key] || key;
                const statusClass = value === true ? 'checklist-ok' : value === false ? 'checklist-defect' : 'checklist-na';
                const statusText = value === true ? '✓' : value === false ? '✗' : '-';
                return `<div class="checklist-item ${statusClass}">${statusText} ${label}</div>`;
              }).join('')}
            </div>
            ${checklistObservations ? `
            <div class="checklist-observations">
              <strong>Observações:</strong> ${checklistObservations}
            </div>
            ` : ''}
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Produtos e Serviços</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Tipo</th>
                  <th style="text-align: center;">Qtd</th>
                  <th style="text-align: right;">Valor Unit.</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item: any) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.item_type === 'product' || item.type === 'product' ? 'Produto' : 'Serviço'}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">R$ ${(item.price || 0).toFixed(2)}</td>
                    <td style="text-align: right;">R$ ${((item.price || 0) * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;">TOTAL</td>
                  <td style="text-align: right;">R$ ${total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Termos e Condições</div>
            <p style="font-size: 11px; color: #666;">
              1. O prazo para retirada do equipamento é de 90 dias após a conclusão do serviço.<br>
              2. Equipamentos não retirados serão descartados conforme legislação vigente.<br>
              3. A garantia do serviço é de 90 dias para peças e mão de obra.<br>
              4. Não nos responsabilizamos por dados armazenados no equipamento.
            </p>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">Assinatura do Cliente</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Assinatura do Técnico</div>
            </div>
          </div>

          <div class="print-footer">
            <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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

        <div className="flex justify-between gap-3 pt-4 border-t border-border">
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <div className="flex gap-3">
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
    </Dialog>
  );
}
