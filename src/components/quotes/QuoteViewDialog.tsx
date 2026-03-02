import { useState } from "react";
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
  ArrowRightCircle,
  Monitor,
  AlertTriangle,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Quote } from "@/types/quote";
import { useQuotes } from "@/hooks/useQuotes";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

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
  onQuoteUpdated?: () => void;
}

export function QuoteViewDialog({ open, onOpenChange, quote, onEdit, onQuoteUpdated }: QuoteViewDialogProps) {
  const { updateQuoteStatus } = useQuotes();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isConverting, setIsConverting] = useState(false);

  if (!quote) return null;

  const items = quote.items || [];
  const total = items.reduce((s, i) => s + Number(i.sale_price) * i.quantity, 0);
  const discountedTotal = total * (1 - Number(quote.discount_percentage) / 100);

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const handleConvertToOS = async () => {
    if (!user || !quote) return;
    setIsConverting(true);
    try {
      // Generate OS number
      const { data: osNumber, error: osErr } = await supabase.rpc('generate_next_os_number');
      if (osErr) throw osErr;

      // Build device name from equipment_description or title
      const device = quote.equipment_description || quote.title || "Equipamento";
      const issue = quote.problem_description || quote.description || "Conforme orçamento " + quote.quote_number;

      // Create order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          os_number: osNumber,
          client_id: quote.client_id || null,
          device: device.substring(0, 200),
          category: 'outros',
          issue,
          priority: 'media',
          status: 'em_andamento',
          internal_notes: `Gerado a partir do orçamento ${quote.quote_number}`,
          total_cost: Number(quote.total_cost),
          total_sale: Number(quote.total_sale),
          total_profit: Number(quote.total_profit),
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Copy items to order_items
      if (items.length > 0) {
        const { error: itemsErr } = await supabase
          .from('order_items')
          .insert(items.map(i => ({
            order_id: order.id,
            item_type: i.item_type === 'manual' ? 'service' : i.item_type,
            item_id: i.item_id || null,
            name: i.name,
            cost_price: Number(i.cost_price),
            sale_price: Number(i.sale_price),
            quantity: i.quantity,
          })));
        if (itemsErr) throw itemsErr;
      }

      // Link quote to order
      await supabase.from('quotes').update({ order_id: order.id, status: 'aprovado', approved_at: new Date().toISOString() }).eq('id', quote.id);

      toast({ title: `OS ${osNumber} criada a partir do orçamento!` });
      onQuoteUpdated?.();
      onOpenChange(false);
      navigate('/ordens');
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao converter em OS', description: String(error), variant: 'destructive' });
    } finally {
      setIsConverting(false);
    }
  };

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

          {/* Equipment / Problem / Solution */}
          {(quote.equipment_description || quote.problem_description || quote.solution_description) && (
            <div className="glass rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Detalhes Técnicos</h3>
              {quote.equipment_description && (
                <div className="flex items-start gap-2">
                  <Monitor className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Equipamento</p>
                    <p className="text-sm">{quote.equipment_description}</p>
                  </div>
                </div>
              )}
              {quote.problem_description && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Problema</p>
                    <p className="text-sm">{quote.problem_description}</p>
                  </div>
                </div>
              )}
              {quote.solution_description && (
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Solução Proposta</p>
                    <p className="text-sm">{quote.solution_description}</p>
                  </div>
                </div>
              )}
            </div>
          )}

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
            {(quote.status === "pendente" || quote.status === "aprovado") && !quote.order_id && (
              <Button
                variant="default"
                className="gap-2"
                onClick={handleConvertToOS}
                disabled={isConverting}
              >
                {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightCircle className="w-4 h-4" />}
                Converter em OS
              </Button>
            )}
            {quote.status === "pendente" && (
              <>
                <Button
                  variant="default"
                  className="gap-2 bg-success hover:bg-success/90"
                  onClick={() => { updateQuoteStatus(quote.id, "aprovado"); onQuoteUpdated?.(); }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprovar
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => { updateQuoteStatus(quote.id, "rejeitado"); onQuoteUpdated?.(); }}
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
