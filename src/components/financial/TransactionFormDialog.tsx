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
import { Check, ChevronsUpDown, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { Client, FinancialTransaction } from "@/types/database";
import { PaymentDialog, PaymentData } from "./PaymentDialog";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  transactionData?: FinancialTransaction | null;
  onSubmit: (data: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at' | 'client' | 'order'>) => Promise<any>;
}

const expenseCategories = [
  { value: "aluguel", label: "Aluguel" },
  { value: "energia", label: "Energia Elétrica" },
  { value: "agua", label: "Água" },
  { value: "internet", label: "Internet/Telefone" },
  { value: "fornecedor", label: "Fornecedor" },
  { value: "equipamento", label: "Equipamento" },
  { value: "manutencao", label: "Manutenção" },
  { value: "salario", label: "Salário" },
  { value: "imposto", label: "Impostos" },
  { value: "marketing", label: "Marketing" },
  { value: "outros", label: "Outros" },
];

const incomeCategories = [
  { value: "venda_produto", label: "Venda de Produto" },
  { value: "servico_avulso", label: "Serviço Avulso" },
  { value: "consultoria", label: "Consultoria" },
  { value: "outros", label: "Outros" },
];

export function TransactionFormDialog({
  open,
  onOpenChange,
  mode = "create",
  transactionData,
  onSubmit,
}: TransactionFormDialogProps) {
  const { clients } = useClients();
  
  const [clientOpen, setClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const [type, setType] = useState<"receita" | "despesa">("receita");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [costAmount, setCostAmount] = useState("");
  const [status, setStatus] = useState("pendente");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Payment data
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && transactionData) {
        setType(transactionData.type as "receita" | "despesa");
        setDescription(transactionData.description || "");
        setCategory(transactionData.category || "");
        setAmount(String(transactionData.amount || ""));
        setCostAmount(String(transactionData.cost_amount || ""));
        setStatus(transactionData.status || "pendente");
        setDueDate(transactionData.due_date || "");
        
        const foundClient = clients.find(c => c.id === transactionData.client_id);
        setSelectedClient(foundClient || null);
        
        const details = transactionData.details as any;
        if (details?.notes) setNotes(details.notes);
      } else {
        resetForm();
      }
    }
  }, [open, mode, transactionData, clients]);

  const resetForm = () => {
    setType("receita");
    setDescription("");
    setCategory("");
    setAmount("");
    setCostAmount("");
    setStatus("pendente");
    setDueDate("");
    setNotes("");
    setSelectedClient(null);
    setPaymentData(null);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (client.phone && client.phone.includes(clientSearch))
  );

  const categories = type === "receita" ? incomeCategories : expenseCategories;

  const parsedAmount = parseFloat(amount) || 0;
  const parsedCost = parseFloat(costAmount) || 0;
  const profit = type === "receita" ? parsedAmount - parsedCost : 0;

  const handleSubmitClick = () => {
    if (status === "pago" && !paymentData) {
      setShowPaymentDialog(true);
      return;
    }
    submitTransaction(paymentData);
  };

  const handlePaymentConfirm = (data: PaymentData) => {
    setPaymentData(data);
    setShowPaymentDialog(false);
    submitTransaction(data);
  };

  const submitTransaction = async (payment: PaymentData | null) => {
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const details: any = {
        notes: notes || undefined,
        client: selectedClient ? {
          name: selectedClient.name,
          phone: selectedClient.phone,
          email: selectedClient.email,
          cpf: selectedClient.cpf,
        } : undefined,
      };

      if (payment) {
        details.payment = payment.payment_details;
      }

      await onSubmit({
        client_id: selectedClient?.id || null,
        order_id: null,
        description,
        type,
        category: category || null,
        amount: parsedAmount,
        cost_amount: parsedCost,
        profit_amount: profit,
        status,
        payment_method: payment?.payment_method || null,
        due_date: dueDate || null,
        paid_at: status === "pago" ? new Date().toISOString() : null,
        details,
      });
      
      onOpenChange(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Novo Lançamento Financeiro" : "Editar Lançamento"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tipo */}
            <div className="space-y-3">
              <Label>Tipo de Lançamento *</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-auto py-4 flex items-center gap-3",
                    type === "receita" && "border-success bg-success/10"
                  )}
                  onClick={() => { setType("receita"); setCategory(""); }}
                >
                  <TrendingUp className="w-5 h-5 text-success" />
                  <div className="text-left">
                    <p className="font-medium">Receita</p>
                    <p className="text-xs text-muted-foreground">Entrada de dinheiro</p>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-auto py-4 flex items-center gap-3",
                    type === "despesa" && "border-destructive bg-destructive/10"
                  )}
                  onClick={() => { setType("despesa"); setCategory(""); }}
                >
                  <TrendingDown className="w-5 h-5 text-destructive" />
                  <div className="text-left">
                    <p className="font-medium">Despesa</p>
                    <p className="text-xs text-muted-foreground">Saída de dinheiro</p>
                  </div>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Descrição */}
              <div className="md:col-span-2 space-y-2">
                <Label>Descrição *</Label>
                <Input
                  placeholder="Ex: Venda de peças, Conta de luz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Custo (apenas para receita) */}
              {type === "receita" && (
                <div className="space-y-2">
                  <Label>Custo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={costAmount}
                    onChange={(e) => setCostAmount(e.target.value)}
                  />
                </div>
              )}

              {/* Data de Vencimento */}
              {status === "pendente" && (
                <div className="space-y-2">
                  <Label>Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              )}

              {/* Cliente */}
              <div className="md:col-span-2 space-y-2">
                <Label>Cliente (opcional)</Label>
                <Popover open={clientOpen} onOpenChange={setClientOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {selectedClient ? selectedClient.name : "Selecionar cliente..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Buscar cliente..."
                        value={clientSearch}
                        onValueChange={setClientSearch}
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>
                        <CommandGroup>
                          {filteredClients.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={client.name}
                              onSelect={() => {
                                setSelectedClient(client);
                                setClientOpen(false);
                                setClientSearch("");
                              }}
                            >
                              <div>
                                <p className="font-medium">{client.name}</p>
                                <p className="text-xs text-muted-foreground">{client.phone}</p>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedClient?.id === client.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedClient && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedClient(null)}
                  >
                    Remover cliente
                  </Button>
                )}
              </div>

              {/* Observações */}
              <div className="md:col-span-2 space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Informações adicionais..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Resumo */}
            {type === "receita" && parsedAmount > 0 && (
              <div className="glass rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Receita</p>
                    <p className="text-lg font-bold text-success">
                      R$ {parsedAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Custo</p>
                    <p className="text-lg font-bold text-destructive">
                      R$ {parsedCost.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lucro</p>
                    <p className="text-lg font-bold text-primary">
                      R$ {profit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitClick}
              disabled={isSubmitting || !description.trim() || parsedAmount <= 0}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === "create" ? "Criar Lançamento" : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        title="Informações de Pagamento"
        amount={parsedAmount}
        onConfirm={handlePaymentConfirm}
      />
    </>
  );
}
