import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const isInternalReceipt = searchParams.get('internal') === 'true';

  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [eqRes, purchRes, saleRes, repRes] = await Promise.all([
          supabase.from('used_equipment').select('*').eq('id', id).single(),
          supabase.from('used_equipment_purchases').select('*, clients(*)').eq('equipment_id', id).maybeSingle(),
          supabase.from('used_equipment_sales').select('*, clients(*)').eq('equipment_id', id).maybeSingle(),
          supabase.from('used_equipment_repairs').select('*').eq('equipment_id', id).order('created_at', { ascending: true }),
        ]);
        if (eqRes.error) throw eqRes.error;
        const equipment: UsedEquipment = { ...eqRes.data, photos: Array.isArray(eqRes.data.photos) ? eqRes.data.photos as string[] : [] };
        setData({
          equipment,
          purchase: purchRes.data ? { ...purchRes.data, source_type: purchRes.data.source_type as 'compra' | 'os', client: purchRes.data.clients as Client | null } : undefined,
          sale: saleRes.data ? { ...saleRes.data, client: saleRes.data.clients as Client | null } : undefined,
          repairs: repRes.data || [],
        });
      } catch (error) {
        console.error('Error fetching receipt data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtDate = (d: string) => format(new Date(d), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Recibo não encontrado</p></div>;

  const { equipment, purchase, sale, repairs } = data;
  const isPurchase = type === 'compra';
  const transaction = isPurchase ? purchase : sale;
  const transactionClient = transaction?.client;
  const transactionDate = transaction?.created_at || equipment.created_at;
  const companyAddr = company ? [company.rua, company.numero, company.bairro, company.cidade, company.estado, company.cep].filter(Boolean).join(', ') : '';
  const clientAddr = transactionClient ? [transactionClient.address, transactionClient.numero, transactionClient.bairro, transactionClient.city, transactionClient.state].filter(Boolean).join(', ') : '';

  const checklistLabels: Record<string, string> = {
    display: 'Tela', touchscreen: 'Touch', camera_frontal: 'Câm. Frontal', camera_traseira: 'Câm. Traseira',
    microfone: 'Microfone', alto_falante: 'Alto-falante', auricular: 'Auricular', wifi: 'Wi-Fi',
    bluetooth: 'Bluetooth', bateria: 'Bateria', biometria: 'Biometria', vibracao: 'Vibração',
    botoes: 'Botões', chip: 'Chip', sensores: 'Sensores',
  };
  const hasChecklist = equipment.checklist && typeof equipment.checklist === 'object' && Object.keys(equipment.checklist as Record<string, any>).length > 0;

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Action Bar */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b p-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/seminovos')}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Imprimir</Button>
      </div>

      {/* A4 Content */}
      <div className="max-w-[210mm] mx-auto px-[15mm] py-[10mm] text-black bg-white print:px-0 print:py-0" style={{ fontSize: '11px', lineHeight: '1.5' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '14px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
            {company?.nome_fantasia || company?.razao_social || 'Empresa'}
          </h1>
          {company?.cnpj && <p style={{ fontSize: '10px', color: '#555', margin: '2px 0' }}>CNPJ: {company.cnpj}</p>}
          {company?.telefone && <p style={{ fontSize: '10px', color: '#555', margin: '2px 0' }}>Tel: {company.telefone}</p>}
          {company?.email && <p style={{ fontSize: '10px', color: '#555', margin: '2px 0' }}>Email: {company.email}</p>}
          {companyAddr && <p style={{ fontSize: '10px', color: '#555', margin: '2px 0' }}>{companyAddr}</p>}
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', border: '2px solid #000', display: 'inline-block', padding: '4px 24px' }}>
            {isPurchase ? 'RECIBO DE COMPRA' : 'RECIBO DE VENDA'}
          </h2>
          <div style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Nº {equipment.code}</span>
          </div>
          <p style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>{fmtDate(transactionDate)}</p>
        </div>

        {/* Client */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>
            {isPurchase ? 'VENDEDOR / FORNECEDOR' : 'COMPRADOR'}
          </h3>
          {transactionClient ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '10px' }}>
              <div><span style={{ color: '#777', fontSize: '9px' }}>Nome:</span><br/><strong>{transactionClient.name}</strong></div>
              {transactionClient.cpf && <div><span style={{ color: '#777', fontSize: '9px' }}>CPF:</span><br/><strong>{transactionClient.cpf}</strong></div>}
              {transactionClient.cnpj && <div><span style={{ color: '#777', fontSize: '9px' }}>CNPJ:</span><br/><strong>{transactionClient.cnpj}</strong></div>}
              {transactionClient.phone && <div><span style={{ color: '#777', fontSize: '9px' }}>Telefone:</span><br/><strong>{transactionClient.phone}</strong></div>}
              {transactionClient.email && <div><span style={{ color: '#777', fontSize: '9px' }}>Email:</span><br/><strong>{transactionClient.email}</strong></div>}
              {clientAddr && <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#777', fontSize: '9px' }}>Endereço:</span><br/><strong>{clientAddr}</strong></div>}
            </div>
          ) : (
            <p style={{ fontSize: '10px', color: '#888' }}>Não identificado</p>
          )}
        </div>

        {/* Equipment */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>DADOS DO EQUIPAMENTO</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '10px' }}>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Código:</span><br/><strong style={{ fontFamily: 'monospace' }}>{equipment.code}</strong></div>
            <div><span style={{ color: '#777', fontSize: '9px' }}>Equipamento:</span><br/><strong>{equipment.name}</strong></div>
            {equipment.brand && <div><span style={{ color: '#777', fontSize: '9px' }}>Marca:</span><br/><strong>{equipment.brand}</strong></div>}
            {equipment.model && <div><span style={{ color: '#777', fontSize: '9px' }}>Modelo:</span><br/><strong>{equipment.model}</strong></div>}
            {equipment.serial_number && <div><span style={{ color: '#777', fontSize: '9px' }}>Nº Série:</span><br/><strong style={{ fontFamily: 'monospace' }}>{equipment.serial_number}</strong></div>}
            {equipment.imei && <div><span style={{ color: '#777', fontSize: '9px' }}>IMEI:</span><br/><strong style={{ fontFamily: 'monospace' }}>{equipment.imei}</strong></div>}
            <div><span style={{ color: '#777', fontSize: '9px' }}>Condição:</span><br/><strong>{EQUIPMENT_CONDITION_LABELS[equipment.condition as EquipmentCondition] || equipment.condition}</strong></div>
          </div>
        </div>

        {/* Checklist */}
        {hasChecklist && (
          <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>CHECKLIST</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px', fontSize: '9px' }}>
              {Object.entries(equipment.checklist as Record<string, boolean | null>).map(([key, value]) => (
                <div key={key} style={{
                  padding: '3px 5px', borderRadius: '3px', textAlign: 'center',
                  background: value === true ? '#e8f5e9' : value === false ? '#ffebee' : '#f5f5f5',
                  color: value === true ? '#2e7d32' : value === false ? '#c62828' : '#666',
                }}>
                  {value === true ? '✓' : value === false ? '✗' : '—'} {checklistLabels[key] || key}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Repair History */}
        {showHistory && repairs && repairs.length > 0 && (
          <div style={{ border: '1px solid #000', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', background: '#f0f0f0', padding: '6px 10px', borderBottom: '1px solid #000' }}>HISTÓRICO DE REPAROS</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '5px 8px' }}>Data</th>
                  <th style={{ textAlign: 'left', padding: '5px 8px' }}>Descrição</th>
                  <th style={{ textAlign: 'right', padding: '5px 8px' }}>Custo</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < repairs.length - 1 ? '1px solid #eee' : 'none' }}>
                    <td style={{ padding: '5px 8px' }}>{format(new Date(r.created_at), 'dd/MM/yyyy')}</td>
                    <td style={{ padding: '5px 8px' }}>{r.description}</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmt(Number(r.total_cost))}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #000', background: '#f0f0f0', fontWeight: 'bold' }}>
                  <td colSpan={2} style={{ padding: '5px 8px' }}>Total em Reparos</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmt(Number(equipment.repair_cost))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Financial */}
        <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>RESUMO FINANCEIRO</h3>
          {isPurchase ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 'bold' }}>
              <span>Valor de Compra:</span>
              <span style={{ color: '#e65100' }}>{fmt(purchase?.amount || 0)}</span>
            </div>
          ) : (
            <>
              {isInternalReceipt && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                    <span>Custo de Aquisição:</span><span>{fmt(Number(equipment.purchase_price))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                    <span>Custo de Reparos:</span><span>{fmt(Number(equipment.repair_cost))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid #ddd' }}>
                    <span>Custo Total:</span><span>{fmt(Number(equipment.total_cost))}</span>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                <span>Valor de Venda:</span>
                <span style={{ color: '#2e7d32' }}>{fmt(sale?.amount || 0)}</span>
              </div>
              {isInternalReceipt && equipment.profit !== null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #ddd' }}>
                  <span>Lucro:</span>
                  <span style={{ color: Number(equipment.profit) >= 0 ? '#2e7d32' : '#c62828' }}>{fmt(Number(equipment.profit))}</span>
                </div>
              )}
            </>
          )}
          {!isPurchase && sale?.payment_method && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #eee' }}>
              <span>Forma de Pagamento:</span><span style={{ textTransform: 'capitalize' }}>{sale.payment_method}</span>
            </div>
          )}
          {!isPurchase && sale?.warranty_days && sale.warranty_days > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '2px' }}>
              <span>Garantia:</span><span>{sale.warranty_days} dias</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {transaction?.notes && (
          <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '6px' }}>OBSERVAÇÕES</h3>
            <p style={{ fontSize: '10px' }}>{transaction.notes}</p>
          </div>
        )}

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '6px', marginTop: '50px' }}>
              <p style={{ fontSize: '10px', fontWeight: '500' }}>{company?.nome_fantasia || 'Empresa'}</p>
              <p style={{ fontSize: '9px', color: '#777' }}>Responsável</p>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '6px', marginTop: '50px' }}>
              <p style={{ fontSize: '10px', fontWeight: '500' }}>{transactionClient?.name || 'Cliente'}</p>
              <p style={{ fontSize: '9px', color: '#777' }}>{isPurchase ? 'Vendedor' : 'Comprador'}</p>
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
