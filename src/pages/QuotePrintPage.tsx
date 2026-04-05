import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Printer, Download, Loader2 } from "lucide-react";
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

const truncate = (text: string | undefined, max: number) => {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
};

const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");

const generatePDF = async (elementId: string, filename: string) => {
  const { default: html2canvas } = await import("html2canvas");
  const { jsPDF } = await import("jspdf");
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

  const lbl: React.CSSProperties = { color: "#777", fontSize: "9px" };

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
      <div id="quote-print-content" style={{ maxWidth: "210mm", margin: "0 auto", padding: "10mm 15mm", fontSize: "11px", lineHeight: "1.5", color: "#000", background: "#fff", fontFamily: "Arial, Helvetica, sans-serif" }}>
        {/* Header - Horizontal */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #000", paddingBottom: "8px", marginBottom: "10px" }}>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>{companyName}</h1>
            {company?.cnpj && <p style={{ fontSize: "9px", color: "#555", margin: "1px 0" }}>CNPJ: {company.cnpj}</p>}
          </div>
          <div style={{ textAlign: "right", fontSize: "9px", color: "#555" }}>
            {company?.telefone && <p style={{ margin: "1px 0" }}>Tel: {company.telefone}</p>}
            {company?.email && <p style={{ margin: "1px 0" }}>{company.email}</p>}
            {companyAddr && <p style={{ margin: "1px 0", maxWidth: "220px" }}>{truncate(companyAddr, 60)}</p>}
          </div>
        </div>

        {/* Quote number + date - single bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", padding: "4px 8px", background: "#f5f5f5", borderRadius: "4px", border: "1px solid #ddd" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>ORÇAMENTO {quote.quote_number}</span>
          <div style={{ textAlign: "right", fontSize: "9px", color: "#555" }}>
            <span>Emissão: {format(new Date(quote.created_at), "dd/MM/yyyy")}</span>
            <span style={{ marginLeft: "10px", color: "#c00", fontWeight: "bold" }}>Válido até: {format(expirationDate, "dd/MM/yyyy")}</span>
          </div>
        </div>

        {/* Description */}
        {quote.description && (
          <div style={{ border: "1px solid #000", borderRadius: "4px", padding: "6px 8px", marginBottom: "8px" }}>
            <h3 style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid #ccc", paddingBottom: "3px", marginBottom: "4px" }}>DESCRIÇÃO</h3>
            <p style={{ fontSize: "10px", margin: 0 }}>{quote.description}</p>
          </div>
        )}

        {/* Client + Technical Details side by side */}
        <div style={{ display: "grid", gridTemplateColumns: quote.equipment_description || quote.problem_description || quote.solution_description ? "1fr 1fr" : "1fr", gap: "8px", marginBottom: "8px" }}>
          {/* Client */}
          {quote.client && (
            <div style={{ border: "1px solid #000", borderRadius: "4px", padding: "6px 8px" }}>
              <h3 style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid #ccc", paddingBottom: "3px", marginBottom: "4px" }}>CLIENTE</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "10px" }}>
                <div style={{ gridColumn: "span 2" }}><span style={lbl}>Nome:</span><br /><strong>{truncate(quote.client.name, 40)}</strong></div>
                {quote.client.phone && <div><span style={lbl}>Telefone:</span><br /><strong>{quote.client.phone}</strong></div>}
                {quote.client.email && <div><span style={lbl}>Email:</span><br /><strong>{truncate(quote.client.email, 30)}</strong></div>}
                {quote.client.cpf && <div><span style={lbl}>CPF:</span><br /><strong>{quote.client.cpf}</strong></div>}
                {quote.client.cnpj && <div><span style={lbl}>CNPJ:</span><br /><strong>{quote.client.cnpj}</strong></div>}
              </div>
            </div>
          )}

          {/* Technical Details */}
          {(quote.equipment_description || quote.problem_description || quote.solution_description) && (
            <div style={{ border: "1px solid #000", borderRadius: "4px", padding: "6px 8px" }}>
              <h3 style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid #ccc", paddingBottom: "3px", marginBottom: "4px" }}>DETALHES TÉCNICOS</h3>
              <div style={{ display: "grid", gap: "4px", fontSize: "10px" }}>
                {quote.equipment_description && <div><span style={{ ...lbl, fontWeight: "bold" }}>Equipamento:</span><br /><span>{truncate(quote.equipment_description, 60)}</span></div>}
                {quote.problem_description && <div><span style={{ ...lbl, fontWeight: "bold" }}>Defeito:</span><br /><span>{truncate(quote.problem_description, 60)}</span></div>}
                {quote.solution_description && <div><span style={{ ...lbl, fontWeight: "bold" }}>Solução:</span><br /><span>{truncate(quote.solution_description, 60)}</span></div>}
              </div>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div style={{ border: "1px solid #000", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
          <h3 style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", background: "#f0f0f0", padding: "5px 8px", borderBottom: "1px solid #000" }}>SERVIÇOS E PRODUTOS</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #000" }}>
                <th style={{ textAlign: "left", padding: "4px 6px", borderRight: "1px solid #ddd" }}>Item</th>
                <th style={{ textAlign: "center", padding: "4px", width: "55px", borderRight: "1px solid #ddd" }}>Tipo</th>
                <th style={{ textAlign: "center", padding: "4px", width: "35px", borderRight: "1px solid #ddd" }}>Qtd</th>
                <th style={{ textAlign: "right", padding: "4px", width: "70px", borderRight: "1px solid #ddd" }}>Vlr Unit.</th>
                <th style={{ textAlign: "right", padding: "4px 6px", width: "70px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "8px", textAlign: "center", color: "#999" }}>Nenhum item</td></tr>
              ) : items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? "1px solid #eee" : "none" }}>
                  <td style={{ padding: "4px 6px", borderRight: "1px solid #eee" }}>
                    {truncate(item.name, 40)}
                    {item.description && <span style={{ display: "block", fontSize: "8px", color: "#777" }}>{truncate(item.description, 50)}</span>}
                  </td>
                  <td style={{ padding: "4px", textAlign: "center", borderRight: "1px solid #eee" }}>{item.item_type === "product" ? "Produto" : "Serviço"}</td>
                  <td style={{ padding: "4px", textAlign: "center", borderRight: "1px solid #eee" }}>{item.quantity}</td>
                  <td style={{ padding: "4px", textAlign: "right", borderRight: "1px solid #eee" }}>{fmt(Number(item.sale_price))}</td>
                  <td style={{ padding: "4px 6px", textAlign: "right" }}>{fmt(Number(item.sale_price) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Options */}
        <div style={{ border: "2px solid #000", borderRadius: "4px", overflow: "hidden", marginBottom: "10px" }}>
          <h3 style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", background: "#e0e0e0", padding: "5px 8px", borderBottom: "1px solid #000", textAlign: "center" }}>CONDIÇÕES DE PAGAMENTO</h3>
          <div style={{ padding: "10px", background: "#e8f5e9", borderBottom: showInstallments ? "1px solid #000" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "bold" }}>💰 À VISTA</span>
              <p style={{ fontSize: "9px", color: "#555", margin: "2px 0 0" }}>PIX, Dinheiro ou Débito{discount > 0 && ` (${discount}% de desconto)`}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              {discount > 0 && <span style={{ fontSize: "10px", color: "#888", textDecoration: "line-through", display: "block" }}>{fmt(total)}</span>}
              <span style={{ fontSize: "16px", fontWeight: "bold", color: "#2e7d32" }}>{fmt(discountedTotal)}</span>
            </div>
          </div>
          {showInstallments && (
            <div style={{ padding: "10px" }}>
              <p style={{ fontSize: "9px", color: "#555", textAlign: "center", marginBottom: "6px" }}>Parcelamento no Cartão ({quote.interest_rate}% a.m.)</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                {installmentOptions.map((n) => {
                  const pmt = calcInstallment(total, n, Number(quote.interest_rate));
                  const totalP = pmt * n;
                  return (
                    <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", border: "1px solid #ddd", borderRadius: "3px", fontSize: "9px" }}>
                      <span style={{ fontWeight: 500 }}>{n}x</span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: "bold" }}>{fmt(pmt)}</span>
                        <p style={{ fontSize: "7px", color: "#888", margin: 0 }}>Total: {fmt(totalP)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notes / Terms */}
        <div style={{ border: "1px solid #000", borderRadius: "4px", padding: "6px 8px", marginBottom: "10px" }}>
          <h3 style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid #ccc", paddingBottom: "3px", marginBottom: "4px" }}>OBSERVAÇÕES E TERMOS</h3>
          <ol style={{ fontSize: "8px", color: "#555", paddingLeft: "12px", margin: 0 }}>
            <li>Orçamento válido por {quote.validity_days} dias a partir da emissão.</li>
            <li>Valores sujeitos a alteração após o prazo de validade.</li>
            <li>Prazo de execução a combinar após aprovação.</li>
            <li>Garantia de 90 dias para peças e mão de obra, exceto mau uso.</li>
            {quote.notes && <li style={{ color: "#000", fontWeight: "bold" }}>{quote.notes}</li>}
          </ol>
        </div>

        {/* Signatures */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "20px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #000", paddingTop: "4px", marginTop: "40px" }}>
              <p style={{ fontSize: "9px", fontWeight: "500" }}>{companyName}</p>
              <p style={{ fontSize: "8px", color: "#777" }}>Empresa</p>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #000", paddingTop: "4px", marginTop: "40px" }}>
              <p style={{ fontSize: "9px", fontWeight: "500" }}>{quote.client?.name || "Cliente"}</p>
              <p style={{ fontSize: "8px", color: "#777" }}>Cliente</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "14px", paddingTop: "6px", borderTop: "1px solid #ddd", fontSize: "8px", color: "#aaa" }}>
          Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
        </div>
      </div>
    </div>
  );
}
