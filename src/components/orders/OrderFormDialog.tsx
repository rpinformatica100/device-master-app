import { useState, useMemo, useEffect } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Check, ChevronsUpDown, Plus, X, Package, Wrench, User, Loader2, ClipboardCheck, PenLine, UserPlus, ChevronDown, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { useServices } from "@/hooks/useServices";
import { useOrders, PaymentInfo } from "@/hooks/useOrders";
import { Client, Order, OrderItemInput } from "@/types/database";
import { PaymentDialog, PaymentData } from "@/components/financial/PaymentDialog";
import { MobileChecklist } from "@/components/orders/MobileChecklist";
import { ManualItemDialog } from "@/components/orders/ManualItemDialog";
import { QuickClientDialog } from "@/components/clients/QuickClientDialog";

interface LocalOrderItem {
  id: string;
  name: string;
  type: "product" | "service";
  cost_price: number;
  sale_price: number;
  quantity: number;
}

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  orderData?: Order | null;
}

const categoryFields: Record<string, { label: string; key: string; placeholder: string }[]> = {
  smartphone: [
    { label: "IMEI", key: "imei", placeholder: "Ex: 353456789012345" },
    { label: "Cor", key: "color", placeholder: "Ex: Preto, Branco" },
    { label: "Capacidade", key: "storage", placeholder: "Ex: 128GB, 256GB" },
  ],
  tablet: [
    { label: "IMEI", key: "imei", placeholder: "Ex: 353456789012345" },
    { label: "Cor", key: "color", placeholder: "Ex: Preto, Branco" },
    { label: "Capacidade", key: "storage", placeholder: "Ex: 64GB, 256GB" },
  ],
  notebook: [
    { label: "Processador", key: "processor", placeholder: "Ex: Intel i7, M2" },
    { label: "Memória RAM", key: "ram", placeholder: "Ex: 8GB, 16GB" },
    { label: "Armazenamento", key: "storage", placeholder: "Ex: 512GB SSD" },
    { label: "Sistema Operacional", key: "os", placeholder: "Ex: Windows 11, macOS" },
  ],
  desktop: [
    { label: "Processador", key: "processor", placeholder: "Ex: Intel i7, Ryzen 5" },
    { label: "Memória RAM", key: "ram", placeholder: "Ex: 16GB, 32GB" },
    { label: "Armazenamento", key: "storage", placeholder: "Ex: 1TB SSD" },
    { label: "Placa de Vídeo", key: "gpu", placeholder: "Ex: RTX 4060, Integrada" },
    { label: "Sistema Operacional", key: "os", placeholder: "Ex: Windows 11" },
  ],
  impressora: [
    { label: "Tipo", key: "printerType", placeholder: "Ex: Jato de Tinta, Laser" },
    { label: "Conectividade", key: "connectivity", placeholder: "Ex: USB, Wi-Fi" },
    { label: "Modelo do Cartucho/Toner", key: "cartridge", placeholder: "Ex: HP 664" },
  ],
  monitor: [
    { label: "Tamanho", key: "screenSize", placeholder: 'Ex: 24", 27"' },
    { label: "Resolução", key: "resolution", placeholder: "Ex: Full HD, 4K" },
    { label: "Tipo de Painel", key: "panelType", placeholder: "Ex: IPS, VA, TN" },
  ],
  outros: [],
};

export function OrderFormDialog({ open, onOpenChange, mode = "create", orderData }: OrderFormDialogProps) {
  const { clients } = useClients();
  const { products } = useProducts();
  const { services } = useServices();
  const { createOrder, updateOrder } = useOrders();

  const [clientOpen, setClientOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [orderItems, setOrderItems] = useState<LocalOrderItem[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<PaymentInfo | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showManualItem, setShowManualItem] = useState(false);
  const [showQuickClient, setShowQuickClient] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);

  const [device, setDevice] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [password, setPassword] = useState("");
  const [accessories, setAccessories] = useState("");
  const [issue, setIssue] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [priority, setPriority] = useState("media");
  const [status, setStatus] = useState("aguardando");
  const [categorySpecificFields, setCategorySpecificFields] = useState<Record<string, string>>({});
  const [mobileChecklist, setMobileChecklist] = useState<Record<string, boolean | null>>({});
  const [checklistObservations, setChecklistObservations] = useState("");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && orderData) {
        const foundClient = clients.find(c => c.id === orderData.client_id);
        setSelectedClient(foundClient || null);
        setDevice(orderData.device || "");
        setCategory(orderData.category || "");
        setSerialNumber(orderData.serial_number || "");
        setPassword(orderData.password || "");
        setAccessories(orderData.accessories || "");
        setIssue(orderData.issue || "");
        setInternalNotes(orderData.internal_notes || "");
        setPriority(orderData.priority || "media");
        setStatus(orderData.status || "aguardando");
        
        const items: LocalOrderItem[] = (orderData.items || []).map(item => ({
          id: item.item_id || `manual-${crypto.randomUUID()}`,
          name: item.name,
          type: item.item_type as "product" | "service",
          cost_price: Number(item.cost_price),
          sale_price: Number(item.sale_price),
          quantity: item.quantity,
        }));
        setOrderItems(items);

        const csf = orderData.category_specific_fields as Record<string, string> || {};
        setCategorySpecificFields(csf);
        setBrand(csf.brand || "");
        setModel(csf.model || "");
        
        if (csf.mobile_checklist) {
          try {
            setMobileChecklist(JSON.parse(csf.mobile_checklist));
          } catch { setMobileChecklist({}); }
        }
        if (csf.checklist_observations) {
          setChecklistObservations(csf.checklist_observations);
        }
      } else {
        setSelectedClient(null);
        setDevice("");
        setCategory("");
        setBrand("");
        setModel("");
        setSerialNumber("");
        setPassword("");
        setAccessories("");
        setIssue("");
        setInternalNotes("");
        setPriority("media");
        setStatus("aguardando");
        setOrderItems([]);
        setCategorySpecificFields({});
        setMobileChecklist({});
        setChecklistObservations("");
        setSpecsOpen(false);
      }
    }
  }, [open, mode, orderData, clients]);

  const allItems = useMemo(() => [
    ...products.map(p => ({ 
      id: p.id, name: p.name, type: "product" as const, 
      cost_price: Number(p.cost_price), sale_price: Number(p.sale_price) 
    })),
    ...services.map(s => ({ 
      id: s.id, name: s.name, type: "service" as const, 
      cost_price: Number(s.cost_price), sale_price: Number(s.sale_price) 
    })),
  ], [products, services]);

  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (client.phone && client.phone.includes(clientSearch)) ||
      (client.cpf && client.cpf.includes(clientSearch))
    );
  }, [clients, clientSearch]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase())
    );
  }, [itemSearch, allItems]);

  const addItem = (item: typeof allItems[0]) => {
    const existing = orderItems.find(i => i.id === item.id);
    if (existing) {
      setOrderItems(orderItems.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1 }]);
    }
    setItemOpen(false);
    setItemSearch("");
  };

  const addManualItem = (item: { id: string; name: string; type: "product" | "service"; cost_price: number; sale_price: number; quantity: number }) => {
    setOrderItems([...orderItems, item]);
  };

  const handleChecklistSave = (checklist: Record<string, boolean | null>, observations: string) => {
    setMobileChecklist(checklist);
    setChecklistObservations(observations);
  };

  const hasChecklist = Object.values(mobileChecklist).some(v => v !== null);
  const checklistDefects = Object.values(mobileChecklist).filter(v => v === false).length;

  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter(i => i.id !== id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return removeItem(id);
    setOrderItems(orderItems.map(i =>
      i.id === id ? { ...i, quantity } : i
    ));
  };

  const totals = useMemo(() => {
    const cost = orderItems.reduce((sum, item) => sum + item.cost_price * item.quantity, 0);
    const sale = orderItems.reduce((sum, item) => sum + item.sale_price * item.quantity, 0);
    const profit = sale - cost;
    const margin = sale > 0 ? (profit / sale) * 100 : 0;
    return { cost, sale, profit, margin };
  }, [orderItems]);

  const handleCategoryFieldChange = (key: string, value: string) => {
    setCategorySpecificFields(prev => ({ ...prev, [key]: value }));
  };

  const handleCategoryChange = (newCategory: string) => {
    const wasMobile = category === 'smartphone' || category === 'tablet';
    const isMobile = newCategory === 'smartphone' || newCategory === 'tablet';
    if (wasMobile && !isMobile) {
      setMobileChecklist({});
      setChecklistObservations("");
    }
    setCategory(newCategory);
  };

  const currentCategoryFields = categoryFields[category] || [];

  const isCompleting = () => {
    if (mode !== "edit" || !orderData) return false;
    const newStatus = status;
    const oldStatus = orderData.status;
    return (newStatus === 'concluido' || newStatus === 'entregue') &&
           oldStatus !== 'concluido' && oldStatus !== 'entregue';
  };

  const handleSubmit = async (paymentInfo?: PaymentInfo) => {
    if (!device.trim() || !category || !issue.trim()) return;

    if (isCompleting() && !paymentInfo) {
      setShowPaymentDialog(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const isMobileDevice = category === 'smartphone' || category === 'tablet';
      const finalCategoryFields = {
        ...categorySpecificFields,
        brand: brand || undefined,
        model: model || undefined,
        mobile_checklist: isMobileDevice && hasChecklist ? JSON.stringify(mobileChecklist) : undefined,
        checklist_observations: isMobileDevice && hasChecklist ? checklistObservations : undefined,
      };

      const orderPayload = {
        client_id: selectedClient?.id || null,
        device,
        category,
        serial_number: serialNumber || null,
        password: password || null,
        accessories: accessories || null,
        issue,
        internal_notes: internalNotes || null,
        priority,
        status,
        category_specific_fields: finalCategoryFields,
        total_cost: totals.cost,
        total_sale: totals.sale,
        total_profit: totals.profit,
      };

      const items: OrderItemInput[] = orderItems.map(item => ({
        item_type: item.type,
        item_id: item.id.startsWith('manual-') ? undefined : item.id,
        name: item.name,
        cost_price: item.cost_price,
        sale_price: item.sale_price,
        quantity: item.quantity,
      }));

      if (mode === "edit" && orderData) {
        await updateOrder(orderData.id, orderPayload, items, paymentInfo);
      } else {
        await createOrder(orderPayload as any, items);
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentConfirm = (paymentData: PaymentData) => {
    setShowPaymentDialog(false);
    const paymentInfo: PaymentInfo = {
      payment_method: paymentData.payment_method,
      payment_details: paymentData.payment_details,
    };
    handleSubmit(paymentInfo);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">{mode === "create" ? "Nova Ordem de Serviço" : "Editar Ordem de Serviço"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
          {/* Cliente */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <User className="w-3.5 h-3.5" />
                Cliente
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowQuickClient(true)}>
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Novo
              </Button>
            </div>
            <Popover open={clientOpen} onOpenChange={setClientOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between h-auto py-2 text-sm">
                  {selectedClient ? (
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{selectedClient.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {selectedClient.phone} {selectedClient.cpf && `• ${selectedClient.cpf}`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Buscar cliente...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." value={clientSearch} onValueChange={setClientSearch} />
                  <CommandList>
                    <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>
                    <CommandGroup>
                      {filteredClients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.name}
                          onSelect={() => { setSelectedClient(client); setClientOpen(false); setClientSearch(""); }}
                          className="flex items-center justify-between py-2"
                        >
                          <div>
                            <p className="font-medium text-sm">{client.name}</p>
                            <p className="text-[10px] text-muted-foreground">{client.phone} {client.cpf && `• ${client.cpf}`}</p>
                          </div>
                          <Check className={cn("h-3.5 w-3.5", selectedClient?.id === client.id ? "opacity-100" : "opacity-0")} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Categoria e Dispositivo */}
          <div className="space-y-1">
            <Label className="text-xs">Categoria *</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="smartphone">Smartphone</SelectItem>
                <SelectItem value="notebook">Notebook</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="impressora">Impressora</SelectItem>
                <SelectItem value="monitor">Monitor</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Dispositivo *</Label>
            <Input className="text-sm h-9" placeholder="Ex: iPhone 14 Pro" value={device} onChange={(e) => setDevice(e.target.value)} />
          </div>

          {/* Marca e Modelo - always visible */}
          <div className="space-y-1">
            <Label className="text-xs">Marca</Label>
            <Input className="text-sm h-9" placeholder="Ex: Apple, Samsung" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Modelo</Label>
            <Input className="text-sm h-9" placeholder="Ex: A54, iPhone 15" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Número de Série</Label>
            <Input className="text-sm h-9" placeholder="Ex: C02XG8J7JK78" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Senha do Dispositivo</Label>
            <Input className="text-sm h-9" placeholder="Senha para acesso" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {/* Collapsible Equipment Characteristics */}
          {currentCategoryFields.length > 0 && (
            <div className="md:col-span-2">
              <Collapsible open={specsOpen} onOpenChange={setSpecsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-8 text-xs" type="button">
                    <span className="flex items-center gap-2">
                      <Settings2 className="w-3.5 h-3.5" />
                      Características do Equipamento ({currentCategoryFields.length} campos)
                    </span>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", specsOpen && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                    {currentCategoryFields.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs">{field.label}</Label>
                        <Input className="text-sm h-9" placeholder={field.placeholder} value={categorySpecificFields[field.key] || ""} onChange={(e) => handleCategoryFieldChange(field.key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs">Acessórios Entregues</Label>
            <Input className="text-sm h-9" placeholder="Ex: Carregador, case" value={accessories} onChange={(e) => setAccessories(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Prioridade</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "edit" && (
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aguardando">Aguardando</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="aguardando_peca">Aguard. Peça</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="md:col-span-2 space-y-1">
            <Label className="text-xs">Defeito Relatado *</Label>
            <Textarea className="text-sm" placeholder="Descreva o problema..." value={issue} onChange={(e) => setIssue(e.target.value)} rows={2} />
          </div>

          <div className="md:col-span-2 space-y-1">
            <Label className="text-xs">Observações Internas</Label>
            <Textarea className="text-sm" placeholder="Notas internas..." value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={2} />
          </div>

          {/* Checklist para dispositivos mobile */}
          {(category === "smartphone" || category === "tablet") && (
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs flex items-center gap-1.5">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Checklist de Entrada (Opcional)
                </Label>
                <div className="flex gap-1.5">
                  {hasChecklist && (
                    <Button 
                      variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => { setMobileChecklist({}); setChecklistObservations(""); }}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />Limpar
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowChecklist(true)}>
                    <ClipboardCheck className="w-3.5 h-3.5 mr-1" />
                    {hasChecklist ? "Editar" : "Fazer Checklist"}
                  </Button>
                </div>
              </div>
              {hasChecklist && (
                <div className="p-2 bg-muted/50 rounded-lg text-xs">
                  <div className="flex gap-3">
                    <span className="text-green-600">✓ {Object.values(mobileChecklist).filter(v => v === true).length} OK</span>
                    <span className="text-red-600">✗ {checklistDefects} Defeitos</span>
                  </div>
                  {checklistObservations && (
                    <p className="text-muted-foreground mt-1 text-[10px]">{checklistObservations}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Produtos e Serviços */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label className="text-xs flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />Produtos e Serviços</Label>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowManualItem(true)}>
                  <PenLine className="w-3.5 h-3.5 mr-1" />Manual
                </Button>
                <Popover open={itemOpen} onOpenChange={setItemOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs"><Plus className="w-3.5 h-3.5 mr-1" />Do Estoque</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar..." value={itemSearch} onValueChange={setItemSearch} />
                      <CommandList>
                        <CommandEmpty>Nenhum item encontrado</CommandEmpty>
                        <CommandGroup heading="Produtos">
                          {filteredItems.filter(i => i.type === "product").map((item) => (
                            <CommandItem key={item.id} onSelect={() => addItem(item)} className="flex justify-between">
                              <span className="text-sm">{item.name}</span>
                              <span className="text-xs text-muted-foreground">R$ {item.sale_price.toFixed(2)}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandGroup heading="Serviços">
                          {filteredItems.filter(i => i.type === "service").map((item) => (
                            <CommandItem key={item.id} onSelect={() => addItem(item)} className="flex justify-between">
                              <span className="text-sm">{item.name}</span>
                              <span className="text-xs text-muted-foreground">R$ {item.sale_price.toFixed(2)}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {orderItems.length > 0 && (
              <div className="glass rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-2">Item</th>
                      <th className="text-right p-2">Custo</th>
                      <th className="text-right p-2">Venda</th>
                      <th className="text-right p-2">Margem</th>
                      <th className="text-center p-2">Qtd</th>
                      <th className="text-right p-2">Total</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => {
                      const itemMargin = item.sale_price - item.cost_price;
                      const itemTotal = item.sale_price * item.quantity;
                      return (
                        <tr key={item.id} className="border-b border-border/50">
                          <td className="p-2">
                            <div className="flex items-center gap-1.5">
                              {item.type === "product" ? <Package className="w-3.5 h-3.5 text-primary" /> : <Wrench className="w-3.5 h-3.5 text-success" />}
                              <span className="text-xs">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-2 text-right text-muted-foreground">R$ {item.cost_price.toFixed(2)}</td>
                          <td className="p-2 text-right">R$ {item.sale_price.toFixed(2)}</td>
                          <td className="p-2 text-right text-success">R$ {itemMargin.toFixed(2)}</td>
                          <td className="p-2">
                            <div className="flex items-center justify-center gap-0.5">
                              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>-</Button>
                              <span className="w-6 text-center text-xs">{item.quantity}</span>
                              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>+</Button>
                            </div>
                          </td>
                          <td className="p-2 text-right font-medium">R$ {itemTotal.toFixed(2)}</td>
                          <td className="p-2"><Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeItem(item.id)}><X className="w-3.5 h-3.5" /></Button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="p-3 bg-muted/30 grid grid-cols-4 gap-3 text-xs">
                  <div className="text-center">
                    <p className="text-muted-foreground">Total Custo</p>
                    <p className="font-bold text-destructive">R$ {totals.cost.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Total Venda</p>
                    <p className="font-bold">R$ {totals.sale.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Lucro Bruto</p>
                    <p className="font-bold text-success">R$ {totals.profit.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Margem</p>
                    <p className="font-bold text-primary">{totals.margin.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" onClick={() => handleSubmit()} disabled={isSubmitting || !device.trim() || !category || !issue.trim()}>
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {mode === "create" ? "Criar OS" : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <PaymentDialog
      open={showPaymentDialog}
      onOpenChange={setShowPaymentDialog}
      title="Registrar Pagamento da OS"
      amount={totals.sale}
      onConfirm={handlePaymentConfirm}
      isLoading={isSubmitting}
    />

    <MobileChecklist
      open={showChecklist}
      onOpenChange={setShowChecklist}
      onSave={handleChecklistSave}
      initialChecklist={mobileChecklist}
      initialObservations={checklistObservations}
    />

    <ManualItemDialog
      open={showManualItem}
      onOpenChange={setShowManualItem}
      onAdd={addManualItem}
    />

    <QuickClientDialog
      open={showQuickClient}
      onOpenChange={setShowQuickClient}
      onClientCreated={(client) => setSelectedClient(client as Client)}
    />
    </>
  );
}
