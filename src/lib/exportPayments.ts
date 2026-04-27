import { format } from "date-fns";
import type { SubscriptionPayment, AdminUser } from "@/hooks/useAdmin";

export function exportPaymentsToCsv(payments: SubscriptionPayment[], users: AdminUser[]) {
  const getName = (uid: string) => {
    const u = users.find((x) => x.id === uid);
    return (
      u?.company_settings?.nome_fantasia ||
      u?.raw_user_meta_data.company_name ||
      u?.raw_user_meta_data.full_name ||
      u?.email ||
      uid.slice(0, 8)
    );
  };

  const headers = [
    "Assistência",
    "Email",
    "Valor",
    "Forma",
    "Status",
    "Mês Ref.",
    "Vencimento",
    "Data Pagamento",
    "Observações",
  ];

  const rows = payments.map((p) => {
    const u = users.find((x) => x.id === p.user_id);
    return [
      `"${getName(p.user_id).replace(/"/g, '""')}"`,
      u?.email || "",
      Number(p.amount).toFixed(2).replace(".", ","),
      p.payment_method || "",
      p.status,
      p.reference_month ? format(new Date(p.reference_month + "T12:00:00"), "MM/yyyy") : "",
      p.due_date ? format(new Date(p.due_date + "T12:00:00"), "dd/MM/yyyy") : "",
      p.paid_at ? format(new Date(p.paid_at), "dd/MM/yyyy") : "",
      `"${(p.notes || "").replace(/"/g, '""')}"`,
    ];
  });

  // Totals
  const totalPago = payments.filter((p) => p.status === "pago").reduce((s, p) => s + Number(p.amount), 0);
  const totalPend = payments.filter((p) => p.status === "pendente").reduce((s, p) => s + Number(p.amount), 0);
  const totalAtrasado = payments.filter((p) => p.status === "atrasado").reduce((s, p) => s + Number(p.amount), 0);
  rows.push([]);
  rows.push(["TOTAL PAGO", "", totalPago.toFixed(2).replace(".", ",")]);
  rows.push(["TOTAL PENDENTE", "", totalPend.toFixed(2).replace(".", ",")]);
  rows.push(["TOTAL ATRASADO", "", totalAtrasado.toFixed(2).replace(".", ",")]);

  const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `pagamentos_${format(new Date(), "yyyy-MM-dd_HHmm")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
