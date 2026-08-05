import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Printer, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import * as P from "@/lib/printTheme";

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

const truncate = (text: string | undefined, max: number) => {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
};

const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");

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

export default function QuotePrintPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings: company } = useCompanySettings();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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
        setQuote({ ...data, client: data.clients, items: data.quote_items } as QuoteData);
      } catch (error) {
        console.error("Error fetching quote:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [id]);

  const companyName = company?.nome_fantasia || company?.razao_social || "Empresa";
  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const handleDownloadPDF = async () => {
    if (!quote) return;
    setDownloading(true);
    try {
      const fname = `ORC-${quote.quote_number}_${sanitizeFilename(companyName)}.pdf`;
      await generatePDF("quote-print-content", fname);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!quote) return;
    const prev = document.title;
    document.title = `ORC-${quote.quote_number} - ${companyName}`;
    window.print();
    document.title = prev;
  };

  const calcInstallment = (total: number, n: number, rate: number) => {
    if (n <= 1) return total;
    const r = rate / 100;
    return total * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!quote) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Orçamento não encontrado</p></div>;

  const items = quote.items || [];
  const total = items.reduce((s, i) => s + Number(i.sale_price) * i.quantity, 0);
  const discount = Number(quote.discount_percentage);
  const discountedTotal = total * (1 - discount / 100);
  const companyAddr = company ? [company.rua, company.numero, company.bairro, company.cidade, company.estado, company.cep].filter(Boolean).join(", ") : "";
  const expirationDate = addDays(new Date(quote.created_at), quote.validity_days);
  const installmentOptions = [2, 3, 4, 5, 6, 10, 12].filter((n) => n <= quote.max_installments);
  const showInstallments = Number(quote.interest_rate) > 0 && quote.max_installments > 1 && installmentOptions.length > 0;

  const lbl = P.label;
  const val = P.value;

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Action bar */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b p-3 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/orcamentos")}>
          <ArrowLeft className="w-4 h-4 mr-2" />Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Baixar PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />Imprimir
          </Button>
        </div>
      </div>

      {/* A4 Content */}
      <div id="quote-print-content" style={P.printPage}>
        {/* Header */}
        <div style={P.printHeader}>
          <div>
            <h1 style={P.companyTitle}>{companyName}</h1>
            {company?.cnpj && <p style={P.companyLine}>CNPJ {company.cnpj}</p>}
            {companyAddr && <p style={P.companyLine}>{truncate(companyAddr, 70)}</p>}
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={P.docBadge}>Orçamento</span>
            <p style={P.docNumber}>{quote.quote_number}</p>
            <p style={{ fontSize: "8.5px", color: P.printColors.muted, margin: 0 }}>
              {[company?.telefone, company?.email].filter(Boolean).join("  ·  ")}
            </p>
          </div>
        </div>

        {/* Datas */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", padding: "6px 9px", background: P.printColors.soft, borderRadius: "6px", border: `1px solid ${P.printColors.line}` }}>
          <span style={{ fontSize: "9px", color: P.printColors.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {quote.title}
          </span>
          <div style={{ textAlign: "right", fontSize: "8.5px", color: P.printColors.muted }}>
            <span>Emissão {format(new Date(quote.created_at), "dd/MM/yyyy")}</span>
            <span style={{ marginLeft: "12px", color: P.printColors.negative, fontWeight: 700 }}>
              Válido até {format(expirationDate, "dd/MM/yyyy")}
            </span>
          </div>
        </div>

        {/* Description */}
        {quote.description && (
          <div style={{ ...P.card, marginBottom: "8px" }}>
            <h3 style={P.sectionTitle}>Descrição</h3>
            <p style={{ ...P.cardBody, fontSize: "10px", margin: 0, whiteSpace: "pre-wrap" }}>{quote.description}</p>
          </div>
        )}

        {/* Client + Technical Details */}
        <div style={{ display: "grid", gridTemplateColumns: quote.equipment_description || quote.problem_description || quote.solution_description ? "1fr 1fr" : "1fr", gap: "8px", marginBottom: "8px" }}>
          {quote.client && (
            <div style={P.card}>
              <h3 style={P.sectionTitle}>Cliente</h3>
              <div style={{ ...P.cardBody, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <div style={{ gridColumn: "span 2" }}><span style={lbl}>Nome</span><span style={val}>{truncate(quote.client.name, 40)}</span></div>
                {quote.client.phone && <div><span style={lbl}>Telefone</span><span style={val}>{quote.client.phone}</span></div>}
                {quote.client.email && <div><span style={lbl}>Email</span><span style={val}>{truncate(quote.client.email, 30)}</span></div>}
                {quote.client.cpf && <div><span style={lbl}>CPF</span><span style={val}>{quote.client.cpf}</span></div>}
                {quote.client.cnpj && <div><span style={lbl}>CNPJ</span><span style={val}>{quote.client.cnpj}</span></div>}
              </div>
            </div>
          )}

          {(quote.equipment_description || quote.problem_description || quote.solution_description) && (
            <div style={P.card}>
              <h3 style={P.sectionTitle}>Detalhes Técnicos</h3>
              <div style={{ ...P.cardBody, display: "grid", gap: "6px" }}>
                {quote.equipment_description && <div><span style={lbl}>Equipamento</span><span style={{ ...val, whiteSpace: "normal" }}>{truncate(quote.equipment_description, 80)}</span></div>}
                {quote.problem_description && <div><span style={lbl}>Defeito</span><span style={{ ...val, whiteSpace: "normal", fontWeight: 400 }}>{truncate(quote.problem_description, 80)}</span></div>}
                {quote.solution_description && <div><span style={lbl}>Solução</span><span style={{ ...val, whiteSpace: "normal", fontWeight: 400 }}>{truncate(quote.solution_description, 80)}</span></div>}
              </div>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div style={{ ...P.card, marginBottom: "8px" }}>
          <h3 style={P.sectionTitle}>Serviços e Produtos</h3>
          <table style={P.tableStyle}>
            <thead>
              <tr>
                <th style={P.th}>Item</th>
                <th style={{ ...P.th, textAlign: "center", width: "60px" }}>Tipo</th>
                <th style={{ ...P.th, textAlign: "center", width: "38px" }}>Qtd</th>
                <th style={{ ...P.th, textAlign: "right", width: "75px" }}>Vlr Unit.</th>
                <th style={{ ...P.th, textAlign: "right", width: "80px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} style={{ ...P.td, textAlign: "center", color: P.printColors.faint }}>Nenhum item</td></tr>
              ) : items.map((item, i) => (
                <tr key={item.id} style={{ background: i % 2 === 1 ? P.printColors.soft : "#fff" }}>
                  <td style={P.td}>
                    {truncate(item.name, 45)}
                    {item.description && <span style={{ display: "block", fontSize: "8px", color: P.printColors.faint }}>{truncate(item.description, 55)}</span>}
                  </td>
                  <td style={{ ...P.td, textAlign: "center", color: P.printColors.muted }}>{item.item_type === "product" ? "Produto" : "Serviço"}</td>
                  <td style={{ ...P.td, textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ ...P.td, textAlign: "right" }}>{fmt(Number(item.sale_price))}</td>
                  <td style={{ ...P.td, textAlign: "right", fontWeight: 600 }}>{fmt(Number(item.sale_price) * item.quantity)}</td>
                </tr>
              ))}
              <tr style={P.totalRow}>
                <td colSpan={4} style={{ padding: "7px 9px", textAlign: "right", fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Subtotal</td>
                <td style={{ padding: "7px 9px", textAlign: "right", fontSize: "11px" }}>{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Options */}
        <div style={{ ...P.card, marginBottom: "10px", borderColor: P.printColors.accent }}>
          <h3 style={{ ...P.sectionTitle, background: P.printColors.accent, color: "#fff", borderBottom: "none" }}>Condições de Pagamento</h3>
          <div style={{ padding: "10px 12px", background: P.printColors.positiveSoft, borderBottom: showInstallments ? `1px solid ${P.printColors.line}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: P.printColors.ink }}>À vista</span>
              <p style={{ fontSize: "8.5px", color: P.printColors.muted, margin: "2px 0 0" }}>
                PIX, dinheiro ou débito{discount > 0 && ` · ${discount}% de desconto`}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              {discount > 0 && <span style={{ fontSize: "9px", color: P.printColors.faint, textDecoration: "line-through", display: "block" }}>{fmt(total)}</span>}
              <span style={{ fontSize: "17px", fontWeight: 700, color: P.printColors.positive }}>{fmt(discountedTotal)}</span>
            </div>
          </div>
          {showInstallments && (
            <div style={{ padding: "9px 12px" }}>
              <p style={{ fontSize: "8px", color: P.printColors.muted, textAlign: "center", margin: "0 0 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Parcelamento no cartão ({quote.interest_rate}% a.m.)
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
                {installmentOptions.map((n) => {
                  const pmt = calcInstallment(total, n, Number(quote.interest_rate));
                  const totalP = pmt * n;
                  return (
                    <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 7px", border: `1px solid ${P.printColors.line}`, borderRadius: "4px", fontSize: "9px", background: "#fff" }}>
                      <span style={{ fontWeight: 700, color: P.printColors.ink }}>{n}x</span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: 700, color: P.printColors.ink }}>{fmt(pmt)}</span>
                        <p style={{ fontSize: "7px", color: P.printColors.faint, margin: 0 }}>Total {fmt(totalP)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notes / Terms */}
        <div style={{ ...P.card, marginBottom: "10px" }}>
          <h3 style={P.sectionTitle}>Observações e Termos</h3>
          <ol style={{ ...P.termsList, padding: "7px 9px 7px 22px" }}>
            <li>Orçamento válido por {quote.validity_days} dias a partir da emissão.</li>
            <li>Valores sujeitos a alteração após o prazo de validade.</li>
            <li>Prazo de execução a combinar após aprovação.</li>
            <li>Garantia de 90 dias para peças e mão de obra, exceto mau uso.</li>
            {quote.notes && <li style={{ color: P.printColors.ink, fontWeight: 600 }}>{quote.notes}</li>}
          </ol>
        </div>

        {/* Signatures */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "16px" }}>
          <div style={P.signatureLine}>
            <p style={{ fontSize: "9px", fontWeight: 600, margin: 0, color: P.printColors.ink }}>{companyName}</p>
            <p style={{ fontSize: "7.5px", color: P.printColors.faint, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>Empresa</p>
          </div>
          <div style={P.signatureLine}>
            <p style={{ fontSize: "9px", fontWeight: 600, margin: 0, color: P.printColors.ink }}>{quote.client?.name || "Cliente"}</p>
            <p style={{ fontSize: "7.5px", color: P.printColors.faint, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>Aceite do cliente</p>
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
