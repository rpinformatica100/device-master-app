import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import * as P from "@/lib/printTheme";

interface OrderData {
  id: string;
  os_number: string;
  device: string;
  category: string;
  serial_number?: string;
  issue: string;
  status: string;
  priority: string;
  created_at: string;
  total_sale: number;
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

export default function OrderQuotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings: company } = useCompanySettings();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestRate, setInterestRate] = useState(2.99);
  const [maxInstallments, setMaxInstallments] = useState(12);

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

  const calcInstallment = (total: number, n: number, rate: number) => {
    if (n <= 1) return total;
    const r = rate / 100;
    return total * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">OS não encontrada</p></div>;

  const items = order.items || [];
  const total = items.reduce((s, i) => s + (Number(i.sale_price) || 0) * i.quantity, 0);
  const csf = order.category_specific_fields || {};
  const companyAddr = company ? [company.rua, company.numero, company.bairro, company.cidade, company.estado, company.cep].filter(Boolean).join(', ') : '';
  const lbl = { ...P.label, display: 'block' };
  const val = P.value;
  const installmentOptions = [2, 3, 4, 5, 6, 10, 12].filter(n => n <= maxInstallments);

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Action Bar */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b p-3 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/ordens')}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Juros (% a.m.):</Label>
            <Input type="number" step="0.01" min="0" max="20" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value) || 0)} className="w-20 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Máx. parcelas:</Label>
            <Input type="number" min="2" max="24" value={maxInstallments} onChange={(e) => setMaxInstallments(Number(e.target.value) || 12)} className="w-16 h-8 text-sm" />
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Imprimir</Button>
        </div>
      </div>

      {/* A4 Content */}
      <div style={P.printPage}>
        <div style={P.printHeader}>
          <div style={{ minWidth: 0 }}>
            <h1 style={P.companyTitle}>{company?.nome_fantasia || company?.razao_social || 'Assistência Técnica'}</h1>
            {company?.cnpj && <p style={P.companyLine}>CNPJ {company.cnpj}</p>}
            {(company?.telefone || company?.email) && <p style={P.companyLine}>{[company?.telefone, company?.email].filter(Boolean).join(' · ')}</p>}
            {companyAddr && <p style={P.companyLine}>{companyAddr}</p>}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={P.docBadge}>Orçamento</span>
            <p style={P.docNumber}>{order.os_number}</p>
            <p style={{ fontSize: '8.5px', color: P.printColors.muted, margin: 0 }}>
              {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} · Validade 7 dias
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div style={P.card}>
            <h3 style={P.sectionTitle}>Cliente</h3>
            <div style={{ ...P.cardBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div style={{ gridColumn: 'span 2' }}><span style={lbl}>Nome</span><span style={{ ...val, whiteSpace: 'normal' }}>{order.client?.name || '—'}</span></div>
              <div><span style={lbl}>Telefone</span><span style={val}>{order.client?.phone || '—'}</span></div>
              <div><span style={lbl}>Email</span><span style={val}>{order.client?.email || '—'}</span></div>
            </div>
          </div>
          <div style={P.card}>
            <h3 style={P.sectionTitle}>Equipamento</h3>
            <div style={{ ...P.cardBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div><span style={lbl}>Dispositivo</span><span style={val}>{order.device}</span></div>
              <div><span style={lbl}>Categoria</span><span style={{ ...val, textTransform: 'capitalize' }}>{order.category}</span></div>
              {csf.brand && <div><span style={lbl}>Marca</span><span style={val}>{csf.brand}</span></div>}
              {csf.model && <div><span style={lbl}>Modelo</span><span style={val}>{csf.model}</span></div>}
            </div>
          </div>
        </div>

        <div style={{ ...P.card, marginBottom: '8px' }}>
          <h3 style={P.sectionTitle}>Defeito relatado</h3>
          <p style={{ ...P.cardBody, margin: 0, fontSize: '10px' }}>{order.issue}</p>
        </div>

        <div style={{ ...P.card, marginBottom: '8px' }}>
          <h3 style={P.sectionTitle}>Serviços e produtos</h3>
          <table style={P.tableStyle}>
            <thead>
              <tr>
                <th style={P.th}>Item</th>
                <th style={{ ...P.th, textAlign: 'center', width: '60px' }}>Tipo</th>
                <th style={{ ...P.th, textAlign: 'center', width: '40px' }}>Qtd</th>
                <th style={{ ...P.th, textAlign: 'right', width: '80px' }}>Vlr Unit.</th>
                <th style={{ ...P.th, textAlign: 'right', width: '80px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} style={{ ...P.td, textAlign: 'center', color: P.printColors.faint }}>Nenhum item</td></tr>
              ) : items.map((item, i) => (
                <tr key={item.id} style={{ background: i % 2 ? P.printColors.soft : '#fff' }}>
                  <td style={P.td}>{item.name}</td>
                  <td style={{ ...P.td, textAlign: 'center', color: P.printColors.muted }}>{item.item_type === 'product' ? 'Produto' : 'Serviço'}</td>
                  <td style={{ ...P.td, textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ ...P.td, textAlign: 'right' }}>{fmt(Number(item.sale_price))}</td>
                  <td style={{ ...P.td, textAlign: 'right', fontWeight: 600 }}>{fmt(Number(item.sale_price) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ ...P.card, marginBottom: '10px' }}>
          <h3 style={P.sectionTitle}>Condições de pagamento</h3>
          <div style={{ padding: '10px 12px', background: P.printColors.positiveSoft, borderBottom: `1px solid ${P.printColors.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: P.printColors.ink, letterSpacing: '0.04em' }}>À VISTA</span>
              <p style={{ fontSize: '8.5px', color: P.printColors.muted, margin: '2px 0 0' }}>PIX, dinheiro ou débito</p>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: P.printColors.positive }}>{fmt(total)}</span>
          </div>
          {interestRate > 0 && installmentOptions.length > 0 && (
            <div style={{ padding: '10px 12px' }}>
              <p style={{ fontSize: '8.5px', color: P.printColors.muted, textAlign: 'center', margin: '0 0 8px' }}>
                Parcelamento no cartão de crédito ({interestRate}% a.m.)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {installmentOptions.map(n => {
                  const pmt = calcInstallment(total, n, interestRate);
                  return (
                    <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', border: `1px solid ${P.printColors.line}`, borderRadius: '6px', fontSize: '9.5px' }}>
                      <span style={{ color: P.printColors.muted }}>{n}x</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: P.printColors.ink }}>{fmt(pmt)}</span>
                        <p style={{ fontSize: '7.5px', color: P.printColors.faint, margin: 0 }}>Total {fmt(pmt * n)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={P.card}>
          <h3 style={P.sectionTitle}>Observações</h3>
          <div style={P.cardBody}>
            <ol style={P.termsList}>
              <li>Orçamento válido por 7 dias a partir da emissão.</li>
              <li>Valores sujeitos a alteração após o prazo de validade.</li>
              <li>Prazo de execução a combinar após aprovação.</li>
              <li>Garantia de 90 dias para peças e mão de obra, exceto mau uso.</li>
              <li>Não nos responsabilizamos por dados armazenados no equipamento.</li>
            </ol>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div style={P.signatureLine}>
            <p style={{ fontSize: '9.5px', fontWeight: 600, color: P.printColors.ink, margin: 0 }}>{company?.nome_fantasia || 'Responsável Técnico'}</p>
            <p style={{ ...lbl, margin: 0 }}>Responsável</p>
          </div>
          <div style={P.signatureLine}>
            <p style={{ fontSize: '9.5px', fontWeight: 600, color: P.printColors.ink, margin: 0 }}>{order.client?.name || 'Cliente'}</p>
            <p style={{ ...lbl, margin: 0 }}>Cliente</p>
          </div>
        </div>

        <div style={P.footerNote}>
          {company?.nome_fantasia || 'Assistência Técnica'} · Orçamento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
        </div>
      </div>
    </div>
  );
}
