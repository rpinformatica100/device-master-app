import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCompanySettings } from "@/hooks/useCompanySettings";

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

export default function OrderReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings: company } = useCompanySettings();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Action Bar */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b p-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/ordens')}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Imprimir</Button>
      </div>

      {/* A4 Content */}
      <div className="max-w-[210mm] mx-auto px-[15mm] py-[10mm] text-black bg-white print:px-0 print:py-0" style={{ fontSize: '11px', lineHeight: '1.5' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '14px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
            {company?.nome_fantasia || company?.razao_social || 'Assistência Técnica'}
          </h1>
          {company?.cnpj && <p style={{ fontSize: '10px', color: '#555', margin: '2px 0' }}>CNPJ: {company.cnpj}</p>}
          {company?.telefone && <p style={{ fontSize: '10px', color: '#555', margin: '2px 0' }}>Tel: {company.telefone}</p>}
          {company?.email && <p style={{ fontSize: '10px', color: '#555', margin: '2px 0' }}>Email: {company.email}</p>}
          {companyAddr && <p style={{ fontSize: '10px', color: '#555', margin: '2px 0' }}>{companyAddr}</p>}
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', border: '2px solid #000', display: 'inline-block', padding: '4px 24px' }}>ORDEM DE SERVIÇO</h2>
          <div style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{order.os_number}</span>
            <span style={{ marginLeft: '12px', fontSize: '10px', border: '1px solid #999', borderRadius: '3px', padding: '1px 6px' }}>{statusLabels[order.status] || order.status}</span>
            <span style={{ marginLeft: '8px', fontSize: '10px', border: '1px solid #999', borderRadius: '3px', padding: '1px 6px' }}>Prior: {priorityLabels[order.priority] || order.priority}</span>
          </div>
          <p style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>
            Abertura: {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {/* Client */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>DADOS DO CLIENTE</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '10px' }}>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Nome:</span><br/><strong>{order.client?.name || '—'}</strong></div>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Telefone:</span><br/><strong>{order.client?.phone || '—'}</strong></div>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Email:</span><br/><strong>{order.client?.email || '—'}</strong></div>
            {order.client?.cpf && <div><span style={{ color: '#777', fontSize: '9px' }}>CPF:</span><br/><strong>{order.client.cpf}</strong></div>}
            {order.client?.cnpj && <div><span style={{ color: '#777', fontSize: '9px' }}>CNPJ:</span><br/><strong>{order.client.cnpj}</strong></div>}
            {clientAddr && <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#777', fontSize: '9px' }}>Endereço:</span><br/><strong>{clientAddr}</strong></div>}
          </div>
        </div>

        {/* Equipment */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>DADOS DO EQUIPAMENTO</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '10px' }}>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Dispositivo:</span><br/><strong>{order.device}</strong></div>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Categoria:</span><br/><strong style={{ textTransform: 'capitalize' }}>{order.category}</strong></div>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Nº Série:</span><br/><strong style={{ fontFamily: 'monospace' }}>{order.serial_number || '—'}</strong></div>
            {csf.brand && <div><span style={{ color: '#777', fontSize: '9px' }}>Marca:</span><br/><strong>{csf.brand}</strong></div>}
            {csf.model && <div><span style={{ color: '#777', fontSize: '9px' }}>Modelo:</span><br/><strong>{csf.model}</strong></div>}
            {csf.imei && <div><span style={{ color: '#777', fontSize: '9px' }}>IMEI:</span><br/><strong style={{ fontFamily: 'monospace' }}>{csf.imei}</strong></div>}
            {csf.color && <div><span style={{ color: '#777', fontSize: '9px' }}>Cor:</span><br/><strong>{csf.color}</strong></div>}
            {csf.storage && <div><span style={{ color: '#777', fontSize: '9px' }}>Capacidade:</span><br/><strong>{csf.storage}</strong></div>}
            {order.password && <div><span style={{ color: '#777', fontSize: '9px' }}>Senha:</span><br/><strong>{order.password}</strong></div>}
            {order.accessories && <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#777', fontSize: '9px' }}>Acessórios:</span><br/><strong>{order.accessories}</strong></div>}
          </div>
        </div>

        {/* Defect */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>DEFEITO RELATADO</h3>
          <p style={{ fontSize: '11px' }}>{order.issue}</p>
        </div>

        {/* Checklist */}
        {hasChecklist && (
          <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>CHECKLIST DE ENTRADA</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px', fontSize: '9px' }}>
              {Object.entries(checklist).map(([key, value]) => (
                <div key={key} style={{
                  padding: '3px 5px', borderRadius: '3px', textAlign: 'center',
                  background: value === true ? '#e8f5e9' : value === false ? '#ffebee' : '#f5f5f5',
                  color: value === true ? '#2e7d32' : value === false ? '#c62828' : '#666',
                }}>
                  {value === true ? '✓' : value === false ? '✗' : '—'} {checklistLabels[key] || key}
                </div>
              ))}
            </div>
            {csf.checklist_observations && (
              <div style={{ marginTop: '6px', padding: '6px', background: '#fffde7', borderRadius: '3px', fontSize: '10px' }}>
                <strong>Obs:</strong> {csf.checklist_observations}
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', background: '#f0f0f0', padding: '6px 10px', borderBottom: '1px solid #000' }}>PRODUTOS E SERVIÇOS</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '5px 8px', borderRight: '1px solid #ddd' }}>Item</th>
                <th style={{ textAlign: 'center', padding: '5px', borderRight: '1px solid #ddd', width: '60px' }}>Tipo</th>
                <th style={{ textAlign: 'center', padding: '5px', borderRight: '1px solid #ddd', width: '40px' }}>Qtd</th>
                <th style={{ textAlign: 'right', padding: '5px', borderRight: '1px solid #ddd', width: '80px' }}>Vlr Unit.</th>
                <th style={{ textAlign: 'right', padding: '5px 8px', width: '80px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '10px', textAlign: 'center', color: '#999' }}>Nenhum item</td></tr>
              ) : items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? '1px solid #eee' : 'none' }}>
                  <td style={{ padding: '5px 8px', borderRight: '1px solid #eee' }}>{item.name}</td>
                  <td style={{ padding: '5px', textAlign: 'center', borderRight: '1px solid #eee' }}>{item.item_type === 'product' ? 'Produto' : 'Serviço'}</td>
                  <td style={{ padding: '5px', textAlign: 'center', borderRight: '1px solid #eee' }}>{item.quantity}</td>
                  <td style={{ padding: '5px', textAlign: 'right', borderRight: '1px solid #eee' }}>{fmt(Number(item.sale_price))}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmt(Number(item.sale_price) * item.quantity)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid #000', background: '#f0f0f0', fontWeight: 'bold' }}>
                <td colSpan={4} style={{ padding: '6px 8px', textAlign: 'right' }}>TOTAL:</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>TERMOS E CONDIÇÕES</h3>
          <ol style={{ fontSize: '9px', color: '#555', paddingLeft: '14px', margin: 0 }}>
            <li>Prazo para retirada: 90 dias após conclusão do serviço.</li>
            <li>Equipamentos não retirados serão descartados conforme legislação.</li>
            <li>Garantia de 90 dias para peças e mão de obra, exceto mau uso.</li>
            <li>Não nos responsabilizamos por dados armazenados no equipamento.</li>
            <li>Orçamento com validade de 7 dias.</li>
          </ol>
        </div>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '6px', marginTop: '50px' }}>
              <p style={{ fontSize: '10px', fontWeight: '500' }}>{company?.nome_fantasia || 'Responsável Técnico'}</p>
              <p style={{ fontSize: '9px', color: '#777' }}>Assinatura</p>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '6px', marginTop: '50px' }}>
              <p style={{ fontSize: '10px', fontWeight: '500' }}>{order.client?.name || 'Cliente'}</p>
              <p style={{ fontSize: '9px', color: '#777' }}>Assinatura</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '8px', borderTop: '1px solid #ddd', fontSize: '9px', color: '#aaa' }}>
          Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
        </div>
      </div>
    </div>
  );
}
