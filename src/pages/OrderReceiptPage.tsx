import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Printer, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import * as P from "@/lib/printTheme";

interface OrderData {
  id: string;
  os_number: string;
  device: string;
  category: string;
  serial_number?: string;
  password?: string;
  accessories?: string;
  issue: string;
  internal_notes?: string;
  status: string;
  priority: string;
  created_at: string;
  completed_at?: string;
  total_cost: number;
  total_sale: number;
  total_profit: number;
  category_specific_fields?: Record<string, any>;
  client?: {
    name: string;
    phone?: string;
    email?: string;
    cpf?: string;
    cnpj?: string;
    address?: string;
    numero?: string;
    bairro?: string;
    city?: string;
    state?: string;
  };
  items?: Array<{
    id: string;
    name: string;
    item_type: string;
    quantity: number;
    sale_price: number;
  }>;
}

const statusLabels: Record<string, string> = {
  em_andamento: "Em Andamento",
  aguardando: "Aguardando",
  concluido: "Concluído",
  aguardando_peca: "Aguard. Peça",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const priorityLabels: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const checklistLabels: Record<string, string> = {
  display: "Tela/Display",
  touchscreen: "Touchscreen",
  camera_frontal: "Câm. Frontal",
  camera_traseira: "Câm. Traseira",
  microfone: "Microfone",
  alto_falante: "Alto-falante",
  auricular: "Auricular",
  wifi: "Wi-Fi",
  bluetooth: "Bluetooth",
  bateria: "Bateria",
  biometria: "Biometria",
  vibracao: "Vibração",
  botoes: "Botões",
  chip: "Chip/SIM",
  sensores: "Sensores",
};

const truncate = (text: string | undefined, max: number) => {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
};

const generatePDF = async (elementId: string, filename: string) => {
  try {
    const html2canvasModule = await import("html2canvas");
    const html2canvas = html2canvasModule.default;
    const jspdfModule = await import("jspdf");
    const jsPDF = jspdfModule.jsPDF;
    const el = document.getElementById(elementId);
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/jpeg", 0.85);
    const pdf = new jsPDF("p", "mm", "a4");
    const imgW = 210;
    const imgH = (canvas.height * imgW) / canvas.width;
    const pageH = 297;
    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
    }
    pdf.save(filename);
  } catch (err) {
    console.error("PDF generation error:", err);
  }
};

const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");

export default function OrderReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings: company } = useCompanySettings();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, clients(*), order_items(*)')
          .eq('id', id)
          .single();
        if (error) throw error;
        setOrder({ ...data, client: data.clients, items: data.order_items } as OrderData);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const companyName = company?.nome_fantasia || company?.razao_social || "Assistência Técnica";

  const handleDownloadPDF = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const fname = `OS-${order.os_number}_${sanitizeFilename(companyName)}.pdf`;
      await generatePDF("os-print-content", fname);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!order) return;
    const prev = document.title;
    document.title = `OS-${order.os_number} - ${companyName}`;
    window.print();
    document.title = prev;
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">OS não encontrada</p></div>;

  const items = order.items || [];
  const total = items.reduce((s, i) => s + (Number(i.sale_price) || 0) * i.quantity, 0);
  const csf = order.category_specific_fields || {};
  const isMobile = order.category === 'smartphone' || order.category === 'tablet';
  let checklist: Record<string, boolean | null> = {};
  if (isMobile && csf.mobile_checklist) {
    try { checklist = typeof csf.mobile_checklist === 'string' ? JSON.parse(csf.mobile_checklist) : csf.mobile_checklist; } catch { checklist = {}; }
  }
  const hasChecklist = isMobile && Object.keys(checklist).length > 0;
  const companyAddr = company ? [company.rua, company.numero, company.bairro, company.cidade, company.estado, company.cep].filter(Boolean).join(', ') : '';
  const clientAddr = order.client ? [order.client.address, order.client.numero, order.client.bairro, order.client.city, order.client.state].filter(Boolean).join(', ') : '';

  const lbl = P.label;
  const val = P.value;

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Action Bar */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b p-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/ordens')}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Baixar PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Imprimir</Button>
        </div>
      </div>

      {/* A4 Content */}
      <div id="os-print-content" style={P.printPage}>
        {/* Header */}
        <div style={P.printHeader}>
          <div>
            <h1 style={P.companyTitle}>{companyName}</h1>
            {company?.cnpj && <p style={P.companyLine}>CNPJ {company.cnpj}</p>}
            <p style={P.companyLine}>
              {[company?.telefone, company?.email].filter(Boolean).join('  ·  ')}
            </p>
            {companyAddr && <p style={P.companyLine}>{truncate(companyAddr, 70)}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={P.docBadge}>Ordem de Serviço</span>
            <p style={P.docNumber}>{order.os_number}</p>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', marginBottom: '4px' }}>
              <span style={P.docBadge}>{statusLabels[order.status] || order.status}</span>
              <span style={P.docBadge}>Prioridade {priorityLabels[order.priority] || order.priority}</span>
            </div>
            <p style={{ fontSize: '8.5px', color: P.printColors.muted, margin: 0 }}>
              Abertura: {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Client + Equipment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div style={P.card}>
            <h3 style={P.sectionTitle}>Cliente</h3>
            <div style={{ ...P.cardBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div style={{ gridColumn: 'span 2' }}><span style={lbl}>Nome</span><span style={val}>{truncate(order.client?.name, 50)}</span></div>
              <div><span style={lbl}>Telefone</span><span style={val}>{order.client?.phone || '—'}</span></div>
              <div><span style={lbl}>Email</span><span style={val}>{truncate(order.client?.email, 30)}</span></div>
              {order.client?.cpf && <div><span style={lbl}>CPF</span><span style={val}>{order.client.cpf}</span></div>}
              {order.client?.cnpj && <div><span style={lbl}>CNPJ</span><span style={val}>{order.client.cnpj}</span></div>}
              {clientAddr && <div style={{ gridColumn: 'span 2' }}><span style={lbl}>Endereço</span><span style={val}>{truncate(clientAddr, 60)}</span></div>}
            </div>
          </div>

          <div style={P.card}>
            <h3 style={P.sectionTitle}>Equipamento</h3>
            <div style={{ ...P.cardBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div><span style={lbl}>Dispositivo</span><span style={val}>{truncate(order.device, 30)}</span></div>
              <div><span style={lbl}>Categoria</span><span style={{ ...val, textTransform: 'capitalize' }}>{order.category}</span></div>
              <div><span style={lbl}>Nº Série</span><span style={{ ...val, fontFamily: 'monospace' }}>{truncate(order.serial_number, 25)}</span></div>
              {csf.brand && <div><span style={lbl}>Marca</span><span style={val}>{csf.brand}</span></div>}
              {csf.model && <div><span style={lbl}>Modelo</span><span style={val}>{truncate(csf.model, 25)}</span></div>}
              {csf.imei && <div><span style={lbl}>IMEI</span><span style={{ ...val, fontFamily: 'monospace' }}>{csf.imei}</span></div>}
              {csf.color && <div><span style={lbl}>Cor</span><span style={val}>{csf.color}</span></div>}
              {csf.storage && <div><span style={lbl}>Capacidade</span><span style={val}>{csf.storage}</span></div>}
              {order.password && <div><span style={lbl}>Senha</span><span style={val}>{order.password}</span></div>}
              {order.accessories && <div style={{ gridColumn: 'span 2' }}><span style={lbl}>Acessórios</span><span style={val}>{truncate(order.accessories, 50)}</span></div>}
            </div>
          </div>
        </div>

        {/* Defect */}
        <div style={{ ...P.card, marginBottom: '8px' }}>
          <h3 style={P.sectionTitle}>Defeito Relatado</h3>
          <p style={{ ...P.cardBody, fontSize: '10px', margin: 0, whiteSpace: 'pre-wrap' }}>{order.issue}</p>
        </div>

        {/* Checklist */}
        {hasChecklist && (
          <div style={{ ...P.card, marginBottom: '8px' }}>
            <h3 style={P.sectionTitle}>Checklist de Entrada</h3>
            <div style={P.cardBody}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', fontSize: '8.5px' }}>
                {Object.entries(checklist).map(([key, value]) => (
                  <div key={key} style={{
                    padding: '3px 5px', borderRadius: '4px', textAlign: 'center',
                    border: `1px solid ${value === true ? '#bbf7d0' : value === false ? '#fecaca' : P.printColors.line}`,
                    background: value === true ? P.printColors.positiveSoft : value === false ? P.printColors.negativeSoft : P.printColors.soft,
                    color: value === true ? P.printColors.positive : value === false ? P.printColors.negative : P.printColors.muted,
                  }}>
                    {value === true ? '✓' : value === false ? '✗' : '—'} {checklistLabels[key] || key}
                  </div>
                ))}
              </div>
              {csf.checklist_observations && (
                <div style={{ marginTop: '6px', padding: '5px 7px', background: P.printColors.warnSoft, border: '1px solid #fde68a', borderRadius: '4px', fontSize: '8.5px', color: P.printColors.body }}>
                  <strong>Observações:</strong> {csf.checklist_observations}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ ...P.card, marginBottom: '8px' }}>
          <h3 style={P.sectionTitle}>Produtos e Serviços</h3>
          <table style={P.tableStyle}>
            <thead>
              <tr>
                <th style={P.th}>Item</th>
                <th style={{ ...P.th, textAlign: 'center', width: '60px' }}>Tipo</th>
                <th style={{ ...P.th, textAlign: 'center', width: '38px' }}>Qtd</th>
                <th style={{ ...P.th, textAlign: 'right', width: '75px' }}>Vlr Unit.</th>
                <th style={{ ...P.th, textAlign: 'right', width: '80px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} style={{ ...P.td, textAlign: 'center', color: P.printColors.faint }}>Nenhum item lançado</td></tr>
              ) : items.map((item, i) => (
                <tr key={item.id} style={{ background: i % 2 === 1 ? P.printColors.soft : '#fff' }}>
                  <td style={P.td}>{truncate(item.name, 45)}</td>
                  <td style={{ ...P.td, textAlign: 'center', color: P.printColors.muted }}>{item.item_type === 'product' ? 'Produto' : 'Serviço'}</td>
                  <td style={{ ...P.td, textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ ...P.td, textAlign: 'right' }}>{fmt(Number(item.sale_price))}</td>
                  <td style={{ ...P.td, textAlign: 'right', fontWeight: 600 }}>{fmt(Number(item.sale_price) * item.quantity)}</td>
                </tr>
              ))}
              <tr style={P.totalRow}>
                <td colSpan={4} style={{ padding: '7px 9px', textAlign: 'right', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total</td>
                <td style={{ padding: '7px 9px', textAlign: 'right', fontSize: '12px' }}>{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms */}
        <div style={{ ...P.card, marginBottom: '10px' }}>
          <h3 style={P.sectionTitle}>Termos e Condições</h3>
          <ol style={{ ...P.termsList, padding: '7px 9px 7px 22px' }}>
            <li>Prazo para retirada: 90 dias após conclusão do serviço.</li>
            <li>Equipamentos não retirados serão descartados conforme legislação.</li>
            <li>Garantia de 90 dias para peças e mão de obra, exceto mau uso.</li>
            <li>Não nos responsabilizamos por dados armazenados no equipamento.</li>
            <li>Orçamento com validade de 7 dias.</li>
          </ol>
        </div>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '16px' }}>
          <div style={P.signatureLine}>
            <p style={{ fontSize: '9px', fontWeight: 600, margin: 0, color: P.printColors.ink }}>{companyName}</p>
            <p style={{ fontSize: '7.5px', color: P.printColors.faint, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Responsável Técnico</p>
          </div>
          <div style={P.signatureLine}>
            <p style={{ fontSize: '9px', fontWeight: 600, margin: 0, color: P.printColors.ink }}>{order.client?.name || 'Cliente'}</p>
            <p style={{ fontSize: '7.5px', color: P.printColors.faint, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cliente</p>
          </div>
        </div>

        {/* Footer */}
        <div style={P.footerNote}>
          {companyName} · Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
        </div>
      </div>
    </div>
  );
}
