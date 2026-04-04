import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, Package, Wrench } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { useServices } from "@/hooks/useServices";
import { useQuotes } from "@/hooks/useQuotes";
import { Quote, QuoteItemInput } from "@/types/quote";

interface QuoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  quoteData?: Quote | null;
}

export function QuoteFormDialog({ open, onOpenChange, mode, quoteData }: QuoteFormDialogProps) {
  const { clients } = useClients();
  const { products } = useProducts();
  const { services } = useServices();
  const { createQuote, updateQuote } = useQuotes();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("Orçamento");
  const [description, setDescription] = useState("");
  const [equipmentDescription, setEquipmentDescription] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [solutionDescription, setSolutionDescription] = useState("");
  const [validityDays, setValidityDays] = useState(7);
  const [interestRate, setInterestRate] = useState(2.99);
  const [maxInstallments, setMaxInstallments] = useState(12);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [enableInstallments, setEnableInstallments] = useState(false);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<QuoteItemInput[]>([]);
  const [addItemType, setAddItemType] = useState<"product" | "service" | "manual">("service");

  useEffect(() => {
    if (open && mode === "edit" && quoteData) {
      setClientId(quoteData.client_id || "");
      setTitle(quoteData.title || "Orçamento");
      setDescription(quoteData.description || "");
      setEquipmentDescription(quoteData.equipment_description || "");
      setProblemDescription(quoteData.problem_description || "");
      setSolutionDescription(quoteData.solution_description || "");
      setValidityDays(quoteData.validity_days);
      setInterestRate(Number(quoteData.interest_rate));
      setMaxInstallments(quoteData.max_installments);
      setDiscountPercentage(Number(quoteData.discount_percentage));
      setEnableInstallments(Number(quoteData.interest_rate) > 0 && quoteData.max_installments > 1);
      setNotes(quoteData.notes || "");
      setItems(
        (quoteData.items || []).map(i => ({
          item_type: i.item_type as any,
          item_id: i.item_id || undefined,
          name: i.name,
          description: i.description || "",
          cost_price: Number(i.cost_price),
          sale_price: Number(i.sale_price),
          quantity: i.quantity,
        }))
      );
    } else if (open && mode === "create") {
      setClientId("");
      setTitle("Orçamento");
      setDescription("");
      setEquipmentDescription("");
      setProblemDescription("");
      setSolutionDescription("");
      setValidityDays(7);
      setInterestRate(0);
      setMaxInstallments(1);
      setEnableInstallments(false);
      setDiscountPercentage(0);
      setNotes("");
      setItems([]);
    }
  }, [open, mode, quoteData]);

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setItems(prev => [...prev, {
      item_type: 'product',
      item_id: product.id,
      name: product.name,
      cost_price: Number(product.cost_price),
      sale_price: Number(product.sale_price),
      quantity: 1,
    }]);
  };

  const addService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    setItems(prev => [...prev, {
      item_type: 'service',
      item_id: service.id,
      name: service.name,
      cost_price: Number(service.cost_price),
      sale_price: Number(service.sale_price),
      quantity: 1,
    }]);
  };

  const addManualItem = () => {
    setItems(prev => [...prev, {
      item_type: 'manual',
      name: '',
      cost_price: 0,
      sale_price: 0,
      quantity: 1,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItemInput, value: any) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const total = items.reduce((s, i) => s + i.sale_price * i.quantity, 0);

  const resolvedClientId = clientId && clientId !== "none" ? clientId : undefined;

  const handleSubmit = async () => {
    if (items.length === 0) {
      return;
    }
    setIsSubmitting(true);
    try {
      const quotePayload = {
        client_id: resolvedClientId,
        title,
        description,
        equipment_description: equipmentDescription || undefined,
        problem_description: problemDescription || undefined,
        solution_description: solutionDescription || undefined,
        validity_days: validityDays,
        interest_rate: interestRate,
        max_installments: enableInstallments ? maxInstallments : 1,
        discount_percentage: discountPercentage,
        notes,
      };

      if (mode === "create") {
        await createQuote(quotePayload, items);
      } else if (quoteData) {
        await updateQuote(quoteData.id, {
          client_id: resolvedClientId || null,
          title,
          description,
          equipment_description: equipmentDescription || null,
          problem_description: problemDescription || null,
          solution_description: solutionDescription || null,
          validity_days: validityDays,
          interest_rate: interestRate,
          max_installments: maxInstallments,
          discount_percentage: discountPercentage,
          notes,
        }, items);
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo Orçamento" : "Editar Orçamento"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Client + Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Cliente</Label>
              <Select value={clientId || "none"} onValueChange={setClientId}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecione o cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem cliente</SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Título</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="text-sm" placeholder="Ex: Orçamento de Reparo" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Descrição Geral</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} className="text-sm min-h-[50px]" placeholder="Descrição geral do orçamento..." />
          </div>

          {/* Equipment / Problem / Solution */}
          <div className="space-y-3 p-3 rounded-lg border border-border bg-secondary/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Detalhes Técnicos (opcional)</p>
            <div className="space-y-1">
              <Label className="text-xs">Equipamento</Label>
              <Textarea value={equipmentDescription} onChange={e => setEquipmentDescription(e.target.value)} className="text-sm min-h-[40px]" placeholder="Ex: Notebook Dell Inspiron 15, i5 10ª gen, 8GB RAM, SSD 256GB" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Problema / Defeito Relatado</Label>
              <Textarea value={problemDescription} onChange={e => setProblemDescription(e.target.value)} className="text-sm min-h-[40px]" placeholder="Ex: Equipamento não liga, sem sinal de vídeo, bateria não carrega..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Solução Proposta</Label>
              <Textarea value={solutionDescription} onChange={e => setSolutionDescription(e.target.value)} className="text-sm min-h-[40px]" placeholder="Ex: Substituição da placa de vídeo, troca de bateria, limpeza interna..." />
            </div>
          </div>

          {/* Config row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Validade (dias)</Label>
              <Input type="number" min={1} value={validityDays} onChange={e => setValidityDays(Number(e.target.value) || 7)} className="text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Desconto à vista (%)</Label>
              <Input type="number" step="0.5" min={0} max={100} value={discountPercentage} onChange={e => setDiscountPercentage(Number(e.target.value) || 0)} className="text-sm" />
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <div className="flex items-center gap-2 h-9">
                <Switch checked={enableInstallments} onCheckedChange={(checked) => {
                  setEnableInstallments(checked);
                  if (checked && interestRate === 0) setInterestRate(2.99);
                  if (checked && maxInstallments <= 1) setMaxInstallments(12);
                  if (!checked) { setInterestRate(0); setMaxInstallments(1); }
                }} />
                <Label className="text-xs">Parcelamento</Label>
              </div>
            </div>
          </div>

          {enableInstallments && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-secondary/20">
              <div className="space-y-1">
                <Label className="text-xs">Juros (% a.m.)</Label>
                <Input type="number" step="0.01" min={0} value={interestRate} onChange={e => setInterestRate(Number(e.target.value) || 0)} className="text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Máx. Parcelas</Label>
                <Input type="number" min={2} max={24} value={maxInstallments} onChange={e => setMaxInstallments(Number(e.target.value) || 12)} className="text-sm" />
              </div>
            </div>
          )}

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Itens do Orçamento</Label>
              <div className="flex items-center gap-2">
                <Select value={addItemType} onValueChange={(v: any) => setAddItemType(v)}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Serviço</SelectItem>
                    <SelectItem value="product">Produto</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                {addItemType === "manual" && (
                  <Button size="sm" variant="outline" onClick={addManualItem} className="h-8 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                )}
                {addItemType === "product" && (
                  <Select onValueChange={addProduct}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                      <SelectValue placeholder="Selecionar produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} - R$ {Number(p.sale_price).toFixed(2)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {addItemType === "service" && (
                  <Select onValueChange={addService}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                      <SelectValue placeholder="Selecionar serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} - R$ {Number(s.sale_price).toFixed(2)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {items.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                Adicione itens ao orçamento
              </div>
            )}

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex-shrink-0">
                    {item.item_type === 'product' ? (
                      <Package className="w-4 h-4 text-info" />
                    ) : (
                      <Wrench className="w-4 h-4 text-success" />
                    )}
                  </div>
                  <Input
                    value={item.name}
                    onChange={e => updateItem(index, 'name', e.target.value)}
                    placeholder="Nome do item"
                    className="text-xs flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', Number(e.target.value) || 1)}
                    className="text-xs w-16"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={item.sale_price}
                    onChange={e => updateItem(index, 'sale_price', Number(e.target.value) || 0)}
                    className="text-xs w-24"
                    placeholder="Valor"
                  />
                  <span className="text-xs font-medium w-20 text-right">
                    R$ {(item.sale_price * item.quantity).toFixed(2)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(index)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="flex justify-end items-center gap-2 pt-2 border-t border-border">
                <span className="text-sm font-medium text-muted-foreground">Total:</span>
                <span className="text-lg font-bold text-primary">R$ {total.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="text-sm min-h-[50px]" placeholder="Observações adicionais..." />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || items.length === 0}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "create" ? "Criar Orçamento" : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
