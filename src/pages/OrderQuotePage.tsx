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
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', border: '2px solid #000', display: 'inline-block', padding: '4px 24px' }}>ORÇAMENTO</h2>
          <div style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{order.os_number}</span>
          </div>
          <p style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>
            Data: {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <p style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>Validade: 7 dias</p>
        </div>

        {/* Client */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>DADOS DO CLIENTE</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '10px' }}>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Nome:</span><br/><strong>{order.client?.name || '—'}</strong></div>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Telefone:</span><br/><strong>{order.client?.phone || '—'}</strong></div>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Email:</span><br/><strong>{order.client?.email || '—'}</strong></div>
          </div>
        </div>

        {/* Equipment */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>EQUIPAMENTO</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '10px' }}>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Dispositivo:</span><br/><strong>{order.device}</strong></div>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Categoria:</span><br/><strong style={{ textTransform: 'capitalize' }}>{order.category}</strong></div>
            {csf.brand && <div><span style={{ color: '#777', fontSize: '9px' }}>Marca:</span><br/><strong>{csf.brand}</strong></div>}
            {csf.model && <div><span style={{ color: '#777', fontSize: '9px' }}>Modelo:</span><br/><strong>{csf.model}</strong></div>}
          </div>
        </div>

        {/* Defect */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>DEFEITO RELATADO</h3>
          <p style={{ fontSize: '11px' }}>{order.issue}</p>
        </div>

        {/* Items */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', background: '#f0f0f0', padding: '6px 10px', borderBottom: '1px solid #000' }}>SERVIÇOS E PRODUTOS</h3>
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
            </tbody>
          </table>
        </div>

        {/* Payment Options */}
        <div style={{ border: '2px solid #000', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', background: '#e0e0e0', padding: '6px 10px', borderBottom: '1px solid #000', textAlign: 'center' }}>CONDIÇÕES DE PAGAMENTO</h3>
          
          {/* Cash */}
          <div style={{ padding: '12px', background: '#e8f5e9', borderBottom: '1px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>💰 À VISTA</span>
              <p style={{ fontSize: '9px', color: '#555', margin: '2px 0 0' }}>PIX, Dinheiro ou Débito</p>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>{fmt(total)}</span>
          </div>

          {/* Installments */}
          {interestRate > 0 && installmentOptions.length > 0 && (
            <div style={{ padding: '12px' }}>
              <p style={{ fontSize: '9px', color: '#555', textAlign: 'center', marginBottom: '8px' }}>
                Parcelamento no Cartão de Crédito ({interestRate}% a.m.)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {installmentOptions.map(n => {
                  const pmt = calcInstallment(total, n, interestRate);
                  const totalP = pmt * n;
                  return (
                    <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '10px' }}>
                      <span style={{ fontWeight: '500' }}>{n}x de</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 'bold' }}>{fmt(pmt)}</span>
                        <p style={{ fontSize: '8px', color: '#888', margin: 0 }}>Total: {fmt(totalP)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Terms */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>OBSERVAÇÕES</h3>
          <ol style={{ fontSize: '9px', color: '#555', paddingLeft: '14px', margin: 0 }}>
            <li>Orçamento válido por 7 dias a partir da emissão.</li>
            <li>Valores sujeitos a alteração após o prazo de validade.</li>
            <li>Prazo de execução a combinar após aprovação.</li>
            <li>Garantia de 90 dias para peças e mão de obra, exceto mau uso.</li>
            <li>Não nos responsabilizamos por dados armazenados no equipamento.</li>
          </ol>
        </div>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '6px', marginTop: '50px' }}>
              <p style={{ fontSize: '10px', fontWeight: '500' }}>{company?.nome_fantasia || 'Responsável Técnico'}</p>
              <p style={{ fontSize: '9px', color: '#777' }}>Responsável</p>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '6px', marginTop: '50px' }}>
              <p style={{ fontSize: '10px', fontWeight: '500' }}>{order.client?.name || 'Cliente'}</p>
              <p style={{ fontSize: '9px', color: '#777' }}>Cliente</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '8px', borderTop: '1px solid #ddd', fontSize: '9px', color: '#aaa' }}>
          Orçamento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
        </div>
      </div>
    </div>
  );
}
