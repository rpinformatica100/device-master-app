import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  Mail,
  Package,
  Wrench,
  Printer,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Quote } from "@/types/quote";
import { useQuotes } from "@/hooks/useQuotes";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-warning/20 text-warning border-warning/30" },
  aprovado: { label: "Aprovado", className: "bg-success/20 text-success border-success/30" },
  rejeitado: { label: "Rejeitado", className: "bg-destructive/20 text-destructive border-destructive/30" },
  expirado: { label: "Expirado", className: "bg-muted text-muted-foreground border-muted" },
};

interface QuoteViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  onEdit: () => void;
}

export function QuoteViewDialog({ open, onOpenChange, quote, onEdit }: QuoteViewDialogProps) {
  const { updateQuoteStatus } = useQuotes();
  const navigate = useNavigate();

  if (!quote) return null;

  const items = quote.items || [];
  const total = items.reduce((s, i) => s + Number(i.sale_price) * i.quantity, 0);
  const discountedTotal = total * (1 - Number(quote.discount_percentage) / 100);

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{quote.quote_number}</DialogTitle>
            <Badge
              variant="outline"
              className={cn("text-xs", statusConfig[quote.status]?.className)}
            >
              {statusConfig[quote.status]?.label || quote.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title + Description */}
          <div className="glass rounded-lg p-4">
            <h3 className="font-semibold text-foreground">{quote.title}</h3>
            {quote.description && <p className="text-sm text-muted-foreground mt-1">{quote.description}</p>}
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(quote.created_at).toLocaleDateString("pt-BR")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Validade: {quote.validity_days} dias
              </span>
            </div>
          </div>

          {/* Client */}
          {quote.client && (
            <div className="glass rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                Cliente
              </h3>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{quote.client.name}</p>
                </div>
                {quote.client.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {quote.client.phone}
                    </p>
                  </div>
                )}
                {quote.client.email && (
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {quote.client.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="glass rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Package className="w-4 h-4" />
              Itens
            </h3>
            <div className="border border-border rounded-lg divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    {item.item_type === "product" ? (
                      <Package className="w-4 h-4 text-info" />
                    ) : (
                      <Wrench className="w-4 h-4 text-success" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x {fmt(Number(item.sale_price))}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-sm">{fmt(Number(item.sale_price) * item.quantity)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-secondary/30">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold text-primary">{fmt(total)}</span>
              </div>
              {Number(quote.discount_percentage) > 0 && (
                <div className="flex items-center justify-between p-3 bg-success/10">
                  <span className="font-medium text-success">À vista ({quote.discount_percentage}% desc.)</span>
                  <span className="text-lg font-bold text-success">{fmt(discountedTotal)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="glass rounded-lg p-4">
              <h3 className="font-semibold text-foreground text-sm mb-1">Observações</h3>
              <p className="text-sm text-muted-foreground">{quote.notes}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-border">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/orcamentos/${quote.id}/imprimir`)}>
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
            {quote.status === "pendente" && (
              <>
                <Button
                  variant="default"
                  className="gap-2 bg-success hover:bg-success/90"
                  onClick={() => updateQuoteStatus(quote.id, "aprovado")}
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprovar
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => updateQuoteStatus(quote.id, "rejeitado")}
                >
                  <XCircle className="w-4 h-4" />
                  Rejeitar
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Fechar</Button>
            <Button onClick={onEdit} className="gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
