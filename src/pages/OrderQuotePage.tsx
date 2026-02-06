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
        setOrder({
          ...data,
          client: data.clients,
          items: data.order_items,
        } as OrderData);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handlePrint = () => window.print();

  const calculateInstallment = (total: number, installments: number, rate: number) => {
    if (installments <= 1) return total;
    // Compound interest formula: PMT = PV * [r(1+r)^n] / [(1+r)^n - 1]
    const r = rate / 100;
    const n = installments;
    const pmt = total * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return pmt;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Ordem de serviço não encontrada</p>
      </div>
    );
  }

  const items = order.items || [];
  const total = items.reduce((sum, item) => sum + (Number(item.sale_price) || 0) * item.quantity, 0);

  const companyAddress = company ? [
    company.rua, company.numero, company.bairro, company.cidade, company.estado, company.cep
  ].filter(Boolean).join(', ') : '';

  const clientAddress = order.client ? [
    order.client.address, order.client.numero, order.client.bairro, order.client.city, order.client.state
  ].filter(Boolean).join(', ') : '';

  const installmentOptions = [2, 3, 4, 5, 6, 10, 12].filter(n => n <= maxInstallments);

  return (
    <div className="min-h-screen bg-white">
      {/* Action Bar */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b p-3 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/ordens')}>
          <ArrowLeft className="w-4 h-4 mr-2" />Voltar
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Juros (% a.m.):</Label>
            <Input
              type="number" step="0.01" min="0" max="20"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
              className="w-20 h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Máx. parcelas:</Label>
            <Input
              type="number" min="2" max="24"
              value={maxInstallments}
              onChange={(e) => setMaxInstallments(Number(e.target.value) || 12)}
              className="w-16 h-8 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />Imprimir
          </Button>
        </div>
      </div>

      {/* Quote Content */}
      <div className="max-w-[210mm] mx-auto p-6 print:p-[15mm] text-black bg-white">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider">
            {company?.nome_fantasia || company?.razao_social || 'Assistência Técnica'}
          </h1>
          {company?.cnpj && <p className="text-sm text-gray-600">CNPJ: {company.cnpj}</p>}
          {company?.telefone && <p className="text-sm text-gray-600">Tel: {company.telefone}</p>}
          {company?.email && <p className="text-sm text-gray-600">Email: {company.email}</p>}
          {companyAddress && <p className="text-sm text-gray-600">{companyAddress}</p>}
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold border-2 border-black inline-block px-8 py-2">
            ORÇAMENTO
          </h2>
          <div className="mt-2 flex justify-center gap-4 text-sm">
            <span className="font-bold text-lg">{order.os_number}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Data: {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Validade: 7 dias</p>
        </div>

        {/* Client */}
        <div className="border border-black rounded mb-4 p-3">
          <h3 className="font-bold text-sm uppercase border-b border-gray-300 pb-1 mb-2">DADOS DO CLIENTE</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Nome:</span>
              <p className="font-medium">{order.client?.name || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Telefone:</span>
              <p className="font-medium">{order.client?.phone || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Email:</span>
              <p className="font-medium">{order.client?.email || 'Não informado'}</p>
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="border border-black rounded mb-4 p-3">
          <h3 className="font-bold text-sm uppercase border-b border-gray-300 pb-1 mb-2">EQUIPAMENTO</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Dispositivo:</span>
              <p className="font-medium">{order.device}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Categoria:</span>
              <p className="font-medium capitalize">{order.category}</p>
            </div>
            {order.category_specific_fields?.brand && (
              <div>
                <span className="text-gray-500 text-xs">Marca:</span>
                <p className="font-medium">{order.category_specific_fields.brand}</p>
              </div>
            )}
            {order.category_specific_fields?.model && (
              <div>
                <span className="text-gray-500 text-xs">Modelo:</span>
                <p className="font-medium">{order.category_specific_fields.model}</p>
              </div>
            )}
          </div>
        </div>

        {/* Defect */}
        <div className="border border-black rounded mb-4 p-3">
          <h3 className="font-bold text-sm uppercase border-b border-gray-300 pb-1 mb-2">DEFEITO RELATADO</h3>
          <p className="text-sm">{order.issue}</p>
        </div>

        {/* Items Table */}
        <div className="border border-black rounded mb-4 overflow-hidden">
          <h3 className="font-bold text-sm uppercase bg-gray-100 px-3 py-2 border-b border-black">
            SERVIÇOS E PRODUTOS
          </h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-black">
                <th className="text-left p-2 border-r">Item</th>
                <th className="text-center p-2 border-r w-20">Tipo</th>
                <th className="text-center p-2 border-r w-16">Qtd</th>
                <th className="text-right p-2 border-r w-24">Valor Unit.</th>
                <th className="text-right p-2 w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-500">Nenhum item</td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id} className={index < items.length - 1 ? 'border-b' : ''}>
                    <td className="p-2 border-r">{item.name}</td>
                    <td className="p-2 border-r text-center">{item.item_type === 'product' ? 'Produto' : 'Serviço'}</td>
                    <td className="p-2 border-r text-center">{item.quantity}</td>
                    <td className="p-2 border-r text-right">{formatCurrency(Number(item.sale_price))}</td>
                    <td className="p-2 text-right">{formatCurrency(Number(item.sale_price) * item.quantity)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Payment Options */}
        <div className="border-2 border-black rounded mb-4 overflow-hidden">
          <h3 className="font-bold text-sm uppercase bg-gray-200 px-3 py-2 border-b border-black text-center">
            CONDIÇÕES DE PAGAMENTO
          </h3>
          
          {/* Cash Price */}
          <div className="p-4 bg-green-50 border-b border-black">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-lg">💰 À VISTA</span>
                <p className="text-xs text-gray-600">Pagamento em PIX, Dinheiro ou Débito</p>
              </div>
              <span className="text-2xl font-bold text-green-700">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Installment Options */}
          {interestRate > 0 && installmentOptions.length > 0 && (
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-3 text-center">
                Parcelamento no Cartão de Crédito ({interestRate}% a.m.)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {installmentOptions.map(n => {
                  const pmt = calculateInstallment(total, n, interestRate);
                  const totalParcelado = pmt * n;
                  return (
                    <div key={n} className="flex justify-between items-center p-2 border rounded text-sm">
                      <span className="font-medium">{n}x de</span>
                      <div className="text-right">
                        <span className="font-bold">{formatCurrency(pmt)}</span>
                        <p className="text-[10px] text-gray-500">Total: {formatCurrency(totalParcelado)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="border border-black rounded mb-6 p-3">
          <h3 className="font-bold text-sm uppercase border-b border-gray-300 pb-1 mb-2">OBSERVAÇÕES</h3>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Este orçamento tem validade de 7 (sete) dias a partir da data de emissão.</li>
            <li>Valores sujeitos a alteração sem aviso prévio após o prazo de validade.</li>
            <li>Prazo de execução a combinar após aprovação do orçamento.</li>
            <li>Garantia de 90 dias para peças e mão de obra, exceto danos por mau uso.</li>
            <li>Não nos responsabilizamos por dados armazenados no equipamento.</li>
          </ol>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-8">
          <div className="text-center">
            <div className="border-t border-black pt-2 mt-16">
              <p className="text-sm font-medium">{company?.nome_fantasia || 'Responsável Técnico'}</p>
              <p className="text-xs text-gray-500">Responsável</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2 mt-16">
              <p className="text-sm font-medium">{order.client?.name || 'Cliente'}</p>
              <p className="text-xs text-gray-500">Cliente</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t text-xs text-gray-400">
          <p>Orçamento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
