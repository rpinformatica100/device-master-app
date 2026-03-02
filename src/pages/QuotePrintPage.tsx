import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface QuoteData {
  id: string;
  quote_number: string;
  title: string;
  description?: string;
  equipment_description?: string;
  problem_description?: string;
  solution_description?: string;
  status: string;
  validity_days: number;
  interest_rate: number;
  max_installments: number;
  discount_percentage: number;
  total_sale: number;
  notes?: string;
  created_at: string;
  client?: {
    name: string;
    phone?: string;
    email?: string;
    cpf?: string;
    cnpj?: string;
  };
  items?: Array<{
    id: string;
    name: string;
    item_type: string;
    description?: string;
    quantity: number;
    sale_price: number;
  }>;
}

export default function QuotePrintPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings: company } = useCompanySettings();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("quotes")
          .select("*, clients(*), quote_items(*)")
          .eq("id", id)
          .single();
        if (error) throw error;
        setQuote({
          ...data,
          client: data.clients,
          items: data.quote_items,
        } as QuoteData);
      } catch (error) {
        console.error("Error fetching quote:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [id]);

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const calcInstallment = (total: number, n: number, rate: number) => {
    if (n <= 1) return total;
    const r = rate / 100;
    return total * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!quote)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Orçamento não encontrado</p>
      </div>
    );

  const items = quote.items || [];
  const total = items.reduce((s, i) => s + Number(i.sale_price) * i.quantity, 0);
  const discount = Number(quote.discount_percentage);
  const discountedTotal = total * (1 - discount / 100);
  const companyAddr = company
    ? [company.rua, company.numero, company.bairro, company.cidade, company.estado, company.cep].filter(Boolean).join(", ")
    : "";
  const expirationDate = addDays(new Date(quote.created_at), quote.validity_days);
  const installmentOptions = [2, 3, 4, 5, 6, 10, 12].filter(
    (n) => n <= quote.max_installments
  );

  const s: Record<string, React.CSSProperties> = {
    page: { maxWidth: "210mm", margin: "0 auto", padding: "10mm 15mm", fontSize: "11px", lineHeight: "1.5", color: "#000", background: "#fff", fontFamily: "Arial, Helvetica, sans-serif" },
    header: { textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "16px" },
    h1: { fontSize: "20px", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase" as const, margin: 0 },
    meta: { fontSize: "10px", color: "#555", margin: "2px 0" },
    titleBox: { textAlign: "center", marginBottom: "16px" },
    titleLabel: { fontSize: "16px", fontWeight: "bold", border: "2px solid #000", display: "inline-block", padding: "4px 24px" },
    section: { border: "1px solid #000", borderRadius: "4px", padding: "8px 10px", marginBottom: "10px" },
    sectionTitle: { fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" as const, borderBottom: "1px solid #ccc", paddingBottom: "4px", marginBottom: "6px" },
    grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", fontSize: "10px" },
    label: { color: "#777", fontSize: "9px" },
    th: { textAlign: "left" as const, padding: "5px 8px", fontSize: "10px", borderBottom: "1px solid #000", background: "#f9f9f9" },
    td: { padding: "5px 8px", fontSize: "10px" },
    paymentBox: { border: "2px solid #000", borderRadius: "4px", overflow: "hidden", marginBottom: "14px" },
    paymentHeader: { fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" as const, background: "#e0e0e0", padding: "6px 10px", borderBottom: "1px solid #000", textAlign: "center" },
    cashBox: { padding: "12px", background: "#e8f5e9", borderBottom: "1px solid #000", display: "flex", justifyContent: "space-between", alignItems: "center" },
    installmentGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" },
    installmentCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "10px" },
    sigGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "30px" },
    sigLine: { borderTop: "1px solid #000", paddingTop: "6px", marginTop: "50px", textAlign: "center" },
    footer: { textAlign: "center", marginTop: "20px", paddingTop: "8px", borderTop: "1px solid #ddd", fontSize: "9px", color: "#aaa" },
  };

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Action bar */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b p-3 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/orcamentos")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* A4 Content */}
      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <h1 style={s.h1}>{company?.nome_fantasia || company?.razao_social || "Empresa"}</h1>
          {company?.cnpj && <p style={s.meta}>CNPJ: {company.cnpj}</p>}
          {company?.telefone && <p style={s.meta}>Tel: {company.telefone}</p>}
          {company?.email && <p style={s.meta}>Email: {company.email}</p>}
          {companyAddr && <p style={s.meta}>{companyAddr}</p>}
        </div>

        {/* Title */}
        <div style={s.titleBox}>
          <h2 style={s.titleLabel}>ORÇAMENTO</h2>
          <div style={{ marginTop: "6px" }}>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>{quote.quote_number}</span>
          </div>
          <p style={{ ...s.meta, marginTop: "4px" }}>
            Emissão: {format(new Date(quote.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <p style={{ fontSize: "9px", color: "#c00", marginTop: "2px", fontWeight: "bold" }}>
            Válido até: {format(expirationDate, "dd/MM/yyyy")} ({quote.validity_days} dias)
          </p>
        </div>

        {/* Description */}
        {quote.description && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>DESCRIÇÃO</h3>
            <p style={{ fontSize: "11px" }}>{quote.description}</p>
          </div>
        )}

        {/* Client */}
        {quote.client && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>DADOS DO CLIENTE</h3>
            <div style={s.grid3}>
              <div>
                <span style={s.label}>Nome:</span>
                <br />
                <strong>{quote.client.name}</strong>
              </div>
              {quote.client.phone && (
                <div>
                  <span style={s.label}>Telefone:</span>
                  <br />
                  <strong>{quote.client.phone}</strong>
                </div>
              )}
              {quote.client.email && (
                <div>
                  <span style={s.label}>Email:</span>
                  <br />
                  <strong>{quote.client.email}</strong>
                </div>
              )}
              {quote.client.cpf && (
                <div>
                  <span style={s.label}>CPF:</span>
                  <br />
                  <strong>{quote.client.cpf}</strong>
                </div>
              )}
              {quote.client.cnpj && (
                <div>
                  <span style={s.label}>CNPJ:</span>
                  <br />
                  <strong>{quote.client.cnpj}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Equipment / Problem / Solution */}
        {(quote.equipment_description || quote.problem_description || quote.solution_description) && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>DETALHES TÉCNICOS</h3>
            <div style={{ display: "grid", gap: "6px", fontSize: "10px" }}>
              {quote.equipment_description && (
                <div>
                  <span style={{ ...s.label, fontWeight: "bold" }}>EQUIPAMENTO:</span>
                  <br />
                  <span>{quote.equipment_description}</span>
                </div>
              )}
              {quote.problem_description && (
                <div>
                  <span style={{ ...s.label, fontWeight: "bold" }}>PROBLEMA / DEFEITO:</span>
                  <br />
                  <span>{quote.problem_description}</span>
                </div>
              )}
              {quote.solution_description && (
                <div>
                  <span style={{ ...s.label, fontWeight: "bold" }}>SOLUÇÃO PROPOSTA:</span>
                  <br />
                  <span>{quote.solution_description}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        <div style={{ border: "1px solid #000", borderRadius: "4px", overflow: "hidden", marginBottom: "10px" }}>
          <h3 style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", background: "#f0f0f0", padding: "6px 10px", borderBottom: "1px solid #000" }}>
            SERVIÇOS E PRODUTOS
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #000" }}>
                <th style={{ ...s.th, borderRight: "1px solid #ddd" }}>Item</th>
                <th style={{ ...s.th, textAlign: "center", width: "60px", borderRight: "1px solid #ddd" }}>Tipo</th>
                <th style={{ ...s.th, textAlign: "center", width: "40px", borderRight: "1px solid #ddd" }}>Qtd</th>
                <th style={{ ...s.th, textAlign: "right", width: "80px", borderRight: "1px solid #ddd" }}>Vlr Unit.</th>
                <th style={{ ...s.th, textAlign: "right", width: "80px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "10px", textAlign: "center", color: "#999" }}>
                    Nenhum item
                  </td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? "1px solid #eee" : "none" }}>
                    <td style={{ ...s.td, borderRight: "1px solid #eee" }}>
                      {item.name}
                      {item.description && <span style={{ display: "block", fontSize: "8px", color: "#777" }}>{item.description}</span>}
                    </td>
                    <td style={{ ...s.td, textAlign: "center", borderRight: "1px solid #eee" }}>
                      {item.item_type === "product" ? "Produto" : "Serviço"}
                    </td>
                    <td style={{ ...s.td, textAlign: "center", borderRight: "1px solid #eee" }}>{item.quantity}</td>
                    <td style={{ ...s.td, textAlign: "right", borderRight: "1px solid #eee" }}>{fmt(Number(item.sale_price))}</td>
                    <td style={{ ...s.td, textAlign: "right" }}>{fmt(Number(item.sale_price) * item.quantity)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Payment Options */}
        <div style={s.paymentBox}>
          <h3 style={s.paymentHeader}>CONDIÇÕES DE PAGAMENTO</h3>

          {/* Cash with discount */}
          <div style={s.cashBox}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: "bold" }}>💰 À VISTA</span>
              <p style={{ fontSize: "9px", color: "#555", margin: "2px 0 0" }}>
                PIX, Dinheiro ou Débito
                {discount > 0 && ` (${discount}% de desconto)`}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              {discount > 0 && (
                <span style={{ fontSize: "11px", color: "#888", textDecoration: "line-through", display: "block" }}>
                  {fmt(total)}
                </span>
              )}
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#2e7d32" }}>
                {fmt(discountedTotal)}
              </span>
            </div>
          </div>

          {/* Installments */}
          {Number(quote.interest_rate) > 0 && installmentOptions.length > 0 && (
            <div style={{ padding: "12px" }}>
              <p style={{ fontSize: "9px", color: "#555", textAlign: "center", marginBottom: "8px" }}>
                Parcelamento no Cartão de Crédito ({quote.interest_rate}% a.m.)
              </p>
              <div style={s.installmentGrid}>
                {installmentOptions.map((n) => {
                  const pmt = calcInstallment(total, n, Number(quote.interest_rate));
                  const totalP = pmt * n;
                  return (
                    <div key={n} style={s.installmentCard}>
                      <span style={{ fontWeight: 500 }}>{n}x de</span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: "bold" }}>{fmt(pmt)}</span>
                        <p style={{ fontSize: "8px", color: "#888", margin: 0 }}>Total: {fmt(totalP)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notes / Terms */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>OBSERVAÇÕES E TERMOS</h3>
          <ol style={{ fontSize: "9px", color: "#555", paddingLeft: "14px", margin: 0 }}>
            <li>Orçamento válido por {quote.validity_days} dias a partir da emissão.</li>
            <li>Valores sujeitos a alteração após o prazo de validade.</li>
            <li>Prazo de execução a combinar após aprovação.</li>
            <li>Garantia de 90 dias para peças e mão de obra, exceto mau uso.</li>
            {quote.notes && <li style={{ color: "#000", fontWeight: "bold" }}>{quote.notes}</li>}
          </ol>
        </div>

        {/* Signatures */}
        <div style={s.sigGrid}>
          <div style={{ textAlign: "center" }}>
            <div style={s.sigLine}>
              <p style={{ fontSize: "10px", fontWeight: 500 }}>{company?.nome_fantasia || "Responsável"}</p>
              <p style={{ fontSize: "9px", color: "#777" }}>Empresa</p>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={s.sigLine}>
              <p style={{ fontSize: "10px", fontWeight: 500 }}>{quote.client?.name || "Cliente"}</p>
              <p style={{ fontSize: "9px", color: "#777" }}>Cliente</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
        </div>
      </div>
    </div>
  );
}
