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
  camera_frontal: "Câmera Frontal",
  camera_traseira: "Câmera Traseira",
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
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            clients(*),
            order_items(*)
          `)
          .eq('id', id)
          .single();

        if (orderError) throw orderError;

        setOrder({
          ...orderData,
          client: orderData.clients,
          items: orderData.order_items,
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
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
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
  
  // Parse checklist
  const categorySpecificFields = order.category_specific_fields || {};
  const isMobileDevice = order.category === 'smartphone' || order.category === 'tablet';
  let mobileChecklist: Record<string, boolean | null> = {};
  let checklistObservations = '';
  
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

  // Build full company address
  const companyAddress = company ? [
    company.rua,
    company.numero,
    company.bairro,
    company.cidade,
    company.estado,
    company.cep
  ].filter(Boolean).join(', ') : '';

  // Build full client address
  const clientAddress = order.client ? [
    order.client.address,
    order.client.numero,
    order.client.bairro,
    order.client.city,
    order.client.state
  ].filter(Boolean).join(', ') : '';

  return (
    <div className="min-h-screen bg-white">
      {/* Action Bar - Hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b p-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/ordens')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Receipt Content - A4 Professional Layout */}
      <div className="max-w-[210mm] mx-auto p-6 print:p-[15mm] text-black bg-white">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider">
            {company?.nome_fantasia || company?.razao_social || 'Assistência Técnica'}
          </h1>
          {company?.cnpj && (
            <p className="text-sm text-gray-600">CNPJ: {company.cnpj}</p>
          )}
          {company?.inscricao_estadual && (
            <p className="text-sm text-gray-600">IE: {company.inscricao_estadual}</p>
          )}
          {company?.telefone && (
            <p className="text-sm text-gray-600">Tel: {company.telefone}</p>
          )}
          {company?.email && (
            <p className="text-sm text-gray-600">Email: {company.email}</p>
          )}
          {companyAddress && (
            <p className="text-sm text-gray-600">{companyAddress}</p>
          )}
        </div>

        {/* Document Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold border-2 border-black inline-block px-8 py-2">
            ORDEM DE SERVIÇO
          </h2>
          <div className="mt-2 flex justify-center gap-4 text-sm">
            <span className="font-bold text-lg">{order.os_number}</span>
            <span className="px-2 py-0.5 border rounded">{statusLabels[order.status] || order.status}</span>
            <span className="px-2 py-0.5 border rounded">Prioridade: {priorityLabels[order.priority] || order.priority}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Abertura: {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {/* Client Section */}
        <div className="border border-black rounded mb-4 p-3">
          <h3 className="font-bold text-sm uppercase border-b border-gray-300 pb-1 mb-2">
            DADOS DO CLIENTE
          </h3>
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
            {order.client?.cpf && (
              <div>
                <span className="text-gray-500 text-xs">CPF:</span>
                <p className="font-medium">{order.client.cpf}</p>
              </div>
            )}
            {order.client?.cnpj && (
              <div>
                <span className="text-gray-500 text-xs">CNPJ:</span>
                <p className="font-medium">{order.client.cnpj}</p>
              </div>
            )}
            {clientAddress && (
              <div className="col-span-2">
                <span className="text-gray-500 text-xs">Endereço:</span>
                <p className="font-medium">{clientAddress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Equipment Section */}
        <div className="border border-black rounded mb-4 p-3">
          <h3 className="font-bold text-sm uppercase border-b border-gray-300 pb-1 mb-2">
            DADOS DO EQUIPAMENTO
          </h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Dispositivo:</span>
              <p className="font-medium">{order.device}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Categoria:</span>
              <p className="font-medium capitalize">{order.category}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Nº Série:</span>
              <p className="font-medium font-mono">{order.serial_number || '-'}</p>
            </div>
            {categorySpecificFields.imei && (
              <div>
                <span className="text-gray-500 text-xs">IMEI:</span>
                <p className="font-medium font-mono">{categorySpecificFields.imei}</p>
              </div>
            )}
            {categorySpecificFields.color && (
              <div>
                <span className="text-gray-500 text-xs">Cor:</span>
                <p className="font-medium">{categorySpecificFields.color}</p>
              </div>
            )}
            {categorySpecificFields.storage && (
              <div>
                <span className="text-gray-500 text-xs">Capacidade:</span>
                <p className="font-medium">{categorySpecificFields.storage}</p>
              </div>
            )}
            {order.password && (
              <div>
                <span className="text-gray-500 text-xs">Senha:</span>
                <p className="font-medium">{order.password}</p>
              </div>
            )}
            {order.accessories && (
              <div className="col-span-2">
                <span className="text-gray-500 text-xs">Acessórios:</span>
                <p className="font-medium">{order.accessories}</p>
              </div>
            )}
          </div>
        </div>

        {/* Defect Section */}
        <div className="border border-black rounded mb-4 p-3">
          <h3 className="font-bold text-sm uppercase border-b border-gray-300 pb-1 mb-2">
            DEFEITO RELATADO
          </h3>
          <p className="text-sm">{order.issue}</p>
        </div>

        {/* Checklist Section */}
        {hasChecklist && (
          <div className="border border-black rounded mb-4 p-3">
            <h3 className="font-bold text-sm uppercase border-b border-gray-300 pb-1 mb-2">
              CHECKLIST DE ENTRADA
            </h3>
            <div className="grid grid-cols-5 gap-1 text-xs">
              {Object.entries(mobileChecklist).map(([key, value]) => {
                const label = checklistLabels[key] || key;
                const bgClass = value === true 
                  ? 'bg-green-100 text-green-800' 
                  : value === false 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-600';
                const icon = value === true ? '✓' : value === false ? '✗' : '-';
                return (
                  <div key={key} className={`px-2 py-1 rounded text-center ${bgClass}`}>
                    {icon} {label}
                  </div>
                );
              })}
            </div>
            {checklistObservations && (
              <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                <strong>Observações:</strong> {checklistObservations}
              </div>
            )}
          </div>
        )}

        {/* Items Table */}
        <div className="border border-black rounded mb-4 overflow-hidden">
          <h3 className="font-bold text-sm uppercase bg-gray-100 px-3 py-2 border-b border-black">
            PRODUTOS E SERVIÇOS
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
                  <td colSpan={5} className="p-3 text-center text-gray-500">
                    Nenhum item registrado
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id} className={index < items.length - 1 ? 'border-b' : ''}>
                    <td className="p-2 border-r">{item.name}</td>
                    <td className="p-2 border-r text-center">
                      {item.item_type === 'product' ? 'Produto' : 'Serviço'}
                    </td>
                    <td className="p-2 border-r text-center">{item.quantity}</td>
                    <td className="p-2 border-r text-right">{formatCurrency(Number(item.sale_price))}</td>
                    <td className="p-2 text-right">{formatCurrency(Number(item.sale_price) * item.quantity)}</td>
                  </tr>
                ))
              )}
              <tr className="border-t-2 border-black bg-gray-100 font-bold">
                <td colSpan={4} className="p-2 text-right">TOTAL:</td>
                <td className="p-2 text-right">{formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms Section */}
        <div className="border border-black rounded mb-6 p-3">
          <h3 className="font-bold text-sm uppercase border-b border-gray-300 pb-1 mb-2">
            TERMOS E CONDIÇÕES
          </h3>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>O prazo para retirada do equipamento é de 90 dias após a conclusão do serviço.</li>
            <li>Equipamentos não retirados dentro do prazo serão descartados conforme legislação vigente.</li>
            <li>A garantia do serviço é de 90 dias para peças e mão de obra, exceto danos causados por mau uso.</li>
            <li>Não nos responsabilizamos por dados armazenados no equipamento. Faça backup antes da entrega.</li>
            <li>O orçamento apresentado tem validade de 7 dias.</li>
          </ol>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-8">
          <div className="text-center">
            <div className="border-t border-black pt-2 mt-16">
              <p className="text-sm font-medium">{company?.nome_fantasia || 'Responsável Técnico'}</p>
              <p className="text-xs text-gray-500">Assinatura</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2 mt-16">
              <p className="text-sm font-medium">{order.client?.name || 'Cliente'}</p>
              <p className="text-xs text-gray-500">Assinatura</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t text-xs text-gray-400">
          <p>Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
