import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Printer, FileText, ShoppingCart, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { 
  UsedEquipment, 
  UsedEquipmentPurchase, 
  UsedEquipmentSale,
  UsedEquipmentRepair,
  EQUIPMENT_CONDITION_LABELS,
  EquipmentCondition
} from "@/types/usedEquipment";
import { Client } from "@/types/database";

type ReceiptType = 'compra' | 'venda';

interface ReceiptData {
  equipment: UsedEquipment;
  purchase?: UsedEquipmentPurchase & { client?: Client | null };
  sale?: UsedEquipmentSale & { client?: Client | null };
  repairs?: UsedEquipmentRepair[];
}

export default function EquipmentReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings: company } = useCompanySettings();
  
  const type = (searchParams.get('type') as ReceiptType) || 'compra';
  const showHistory = searchParams.get('history') === 'true';
  const showDetails = searchParams.get('details') === 'true';
  
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [equipmentRes, purchaseRes, saleRes, repairsRes] = await Promise.all([
          supabase.from('used_equipment').select('*').eq('id', id).single(),
          supabase.from('used_equipment_purchases').select('*, clients(*)').eq('equipment_id', id).maybeSingle(),
          supabase.from('used_equipment_sales').select('*, clients(*)').eq('equipment_id', id).maybeSingle(),
          supabase.from('used_equipment_repairs').select('*').eq('equipment_id', id).order('created_at', { ascending: true }),
        ]);

        if (equipmentRes.error) throw equipmentRes.error;

        const equipment: UsedEquipment = {
          ...equipmentRes.data,
          photos: Array.isArray(equipmentRes.data.photos) ? equipmentRes.data.photos as string[] : [],
        };

        setData({
          equipment,
          purchase: purchaseRes.data ? {
            ...purchaseRes.data,
            source_type: purchaseRes.data.source_type as 'compra' | 'os',
            client: purchaseRes.data.clients as Client | null,
          } : undefined,
          sale: saleRes.data ? {
            ...saleRes.data,
            client: saleRes.data.clients as Client | null,
          } : undefined,
          repairs: repairsRes.data || [],
        });
      } catch (error) {
        console.error('Error fetching receipt data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Recibo não encontrado</p>
      </div>
    );
  }

  const { equipment, purchase, sale, repairs } = data;
  const isPurchase = type === 'compra';
  const transaction = isPurchase ? purchase : sale;
  const transactionClient = transaction?.client;
  const transactionDate = transaction?.created_at || equipment.created_at;

  return (
    <div className="min-h-screen bg-background">
      {/* Action Bar - Hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b p-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/seminovos')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="max-w-[210mm] mx-auto p-4 sm:p-8 print:p-8">
        <Card className="border-2 print:border print:shadow-none">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {company?.nome_fantasia || company?.razao_social || 'Empresa'}
                </h1>
                {company?.cnpj && (
                  <p className="text-sm text-muted-foreground">CNPJ: {company.cnpj}</p>
                )}
                {company?.telefone && (
                  <p className="text-sm text-muted-foreground">Tel: {company.telefone}</p>
                )}
                {company?.rua && (
                  <p className="text-sm text-muted-foreground">
                    {[company.rua, company.numero, company.bairro, company.cidade, company.estado]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <Badge 
                  variant="outline" 
                  className={`text-base px-3 py-1 ${isPurchase ? 'border-orange-500 text-orange-600' : 'border-green-500 text-green-600'}`}
                >
                  {isPurchase ? (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      RECIBO DE COMPRA
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-1" />
                      RECIBO DE VENDA
                    </>
                  )}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Nº {equipment.code}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(transactionDate)}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Client Info */}
            <div className="mb-6">
              <h2 className="font-semibold text-sm text-muted-foreground mb-2">
                {isPurchase ? 'VENDEDOR / FORNECEDOR' : 'COMPRADOR'}
              </h2>
              {transactionClient ? (
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="font-medium">{transactionClient.name}</p>
                  {transactionClient.cpf && <p className="text-sm">CPF: {transactionClient.cpf}</p>}
                  {transactionClient.cnpj && <p className="text-sm">CNPJ: {transactionClient.cnpj}</p>}
                  {transactionClient.phone && <p className="text-sm">Tel: {transactionClient.phone}</p>}
                  {transactionClient.email && <p className="text-sm">Email: {transactionClient.email}</p>}
                  {transactionClient.address && (
                    <p className="text-sm">
                      {[transactionClient.address, transactionClient.numero, transactionClient.bairro, transactionClient.city, transactionClient.state]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Não identificado</p>
              )}
            </div>

            {/* Equipment Details */}
            <div className="mb-6">
              <h2 className="font-semibold text-sm text-muted-foreground mb-2">DADOS DO EQUIPAMENTO</h2>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Código</p>
                    <p className="font-mono font-medium">{equipment.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Equipamento</p>
                    <p className="font-medium">{equipment.name}</p>
                  </div>
                  {equipment.brand && (
                    <div>
                      <p className="text-xs text-muted-foreground">Marca</p>
                      <p className="font-medium">{equipment.brand}</p>
                    </div>
                  )}
                  {equipment.model && (
                    <div>
                      <p className="text-xs text-muted-foreground">Modelo</p>
                      <p className="font-medium">{equipment.model}</p>
                    </div>
                  )}
                  {(showDetails || type === 'venda') && equipment.serial_number && (
                    <div>
                      <p className="text-xs text-muted-foreground">Número de Série</p>
                      <p className="font-mono text-sm">{equipment.serial_number}</p>
                    </div>
                  )}
                  {(showDetails || type === 'venda') && equipment.imei && (
                    <div>
                      <p className="text-xs text-muted-foreground">IMEI</p>
                      <p className="font-mono text-sm">{equipment.imei}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Condição</p>
                    <p className="font-medium">
                      {EQUIPMENT_CONDITION_LABELS[equipment.condition as EquipmentCondition] || equipment.condition}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Repair History (optional) */}
            {showHistory && repairs && repairs.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-sm text-muted-foreground mb-2">HISTÓRICO DE REPAROS</h2>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Descrição</th>
                        <th className="text-right p-2">Custo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repairs.map((repair) => (
                        <tr key={repair.id} className="border-t">
                          <td className="p-2">{format(new Date(repair.created_at), 'dd/MM/yyyy')}</td>
                          <td className="p-2">{repair.description}</td>
                          <td className="p-2 text-right">{formatCurrency(Number(repair.total_cost))}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted/30 font-medium">
                        <td colSpan={2} className="p-2">Total em Reparos</td>
                        <td className="p-2 text-right">{formatCurrency(Number(equipment.repair_cost))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="mb-6">
              <h2 className="font-semibold text-sm text-muted-foreground mb-2">RESUMO FINANCEIRO</h2>
              <div className="bg-muted/30 rounded-lg p-4">
                {isPurchase ? (
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Valor de Compra:</span>
                    <span className="text-orange-600">{formatCurrency(purchase?.amount || 0)}</span>
                  </div>
                ) : (
                  <>
                    {showDetails && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span>Custo de Aquisição:</span>
                          <span>{formatCurrency(Number(equipment.purchase_price))}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Custo de Reparos:</span>
                          <span>{formatCurrency(Number(equipment.repair_cost))}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-2 pb-2 border-b">
                          <span>Custo Total:</span>
                          <span>{formatCurrency(Number(equipment.total_cost))}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Valor de Venda:</span>
                      <span className="text-green-600">{formatCurrency(sale?.amount || 0)}</span>
                    </div>
                    {showDetails && equipment.profit !== null && (
                      <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t">
                        <span>Lucro:</span>
                        <span className={Number(equipment.profit) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(Number(equipment.profit))}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {!isPurchase && sale?.payment_method && (
                  <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t">
                    <span>Forma de Pagamento:</span>
                    <span className="capitalize">{sale.payment_method}</span>
                  </div>
                )}
                {!isPurchase && sale?.warranty_days && sale.warranty_days > 0 && (
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span>Garantia:</span>
                    <span>{sale.warranty_days} dias</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {transaction?.notes && (
              <div className="mb-6">
                <h2 className="font-semibold text-sm text-muted-foreground mb-2">OBSERVAÇÕES</h2>
                <p className="text-sm bg-muted/30 rounded-lg p-4">{transaction.notes}</p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="text-center">
                <div className="border-t border-foreground pt-2 mt-16">
                  <p className="text-sm font-medium">{company?.nome_fantasia || 'Empresa'}</p>
                  <p className="text-xs text-muted-foreground">Responsável</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-foreground pt-2 mt-16">
                  <p className="text-sm font-medium">{transactionClient?.name || 'Cliente'}</p>
                  <p className="text-xs text-muted-foreground">
                    {isPurchase ? 'Vendedor' : 'Comprador'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
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
