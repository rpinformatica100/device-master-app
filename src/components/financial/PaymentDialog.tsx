import { useState } from "react";
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
import { Loader2, CreditCard, Banknote, QrCode, FileText, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaymentData {
  payment_method: string;
  payment_details: {
    method_label: string;
    installments?: number;
    card_brand?: string;
    card_last_digits?: string;
    pix_key?: string;
    bank_name?: string;
    check_number?: string;
    due_date?: string;
    notes?: string;
  };
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  amount: number;
  onConfirm: (paymentData: PaymentData) => void;
  isLoading?: boolean;
}

const paymentMethods = [
  { value: "dinheiro", label: "Dinheiro", icon: Banknote },
  { value: "pix", label: "PIX", icon: QrCode },
  { value: "cartao_credito", label: "Cartão de Crédito", icon: CreditCard },
  { value: "cartao_debito", label: "Cartão de Débito", icon: CreditCard },
  { value: "boleto", label: "Boleto Bancário", icon: FileText },
  { value: "transferencia", label: "Transferência Bancária", icon: Building2 },
  { value: "cheque", label: "Cheque", icon: FileText },
];

const cardBrands = [
  "Visa", "Mastercard", "Elo", "American Express", "Hipercard", "Outro"
];

export function PaymentDialog({
  open,
  onOpenChange,
  title,
  amount,
  onConfirm,
  isLoading = false,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [installments, setInstallments] = useState("1");
  const [cardBrand, setCardBrand] = useState("");
  const [cardLastDigits, setCardLastDigits] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [bankName, setBankName] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    const methodInfo = paymentMethods.find(m => m.value === paymentMethod);
    
    const paymentData: PaymentData = {
      payment_method: paymentMethod,
      payment_details: {
        method_label: methodInfo?.label || paymentMethod,
        notes: notes || undefined,
      },
    };

    if (paymentMethod === "cartao_credito") {
      paymentData.payment_details.installments = parseInt(installments);
      paymentData.payment_details.card_brand = cardBrand || undefined;
      paymentData.payment_details.card_last_digits = cardLastDigits || undefined;
    }

    if (paymentMethod === "cartao_debito") {
      paymentData.payment_details.card_brand = cardBrand || undefined;
      paymentData.payment_details.card_last_digits = cardLastDigits || undefined;
    }

    if (paymentMethod === "pix") {
      paymentData.payment_details.pix_key = pixKey || undefined;
    }

    if (paymentMethod === "transferencia") {
      paymentData.payment_details.bank_name = bankName || undefined;
    }

    if (paymentMethod === "cheque") {
      paymentData.payment_details.check_number = checkNumber || undefined;
      paymentData.payment_details.due_date = dueDate || undefined;
    }

    if (paymentMethod === "boleto") {
      paymentData.payment_details.due_date = dueDate || undefined;
    }

    onConfirm(paymentData);
  };

  const resetForm = () => {
    setPaymentMethod("");
    setInstallments("1");
    setCardBrand("");
    setCardLastDigits("");
    setPixKey("");
    setBankName("");
    setCheckNumber("");
    setDueDate("");
    setNotes("");
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) resetForm();
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Valor */}
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold text-primary">
              R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label className="text-sm">Forma de Pagamento *</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-auto py-2 px-1 flex flex-col items-center gap-0.5",
                      paymentMethod === method.value && "border-primary bg-primary/10"
                    )}
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] leading-tight text-center">{method.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Campos específicos por método */}
          {paymentMethod === "cartao_credito" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="space-y-2">
                <Label>Parcelas</Label>
                <Select value={installments} onValueChange={setInstallments}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}x de R$ {(amount / n).toFixed(2)}
                        {n === 1 ? " (à vista)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bandeira</Label>
                  <Select value={cardBrand} onValueChange={setCardBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {cardBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Últimos 4 dígitos</Label>
                  <Input
                    placeholder="0000"
                    maxLength={4}
                    value={cardLastDigits}
                    onChange={(e) => setCardLastDigits(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "cartao_debito" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bandeira</Label>
                  <Select value={cardBrand} onValueChange={setCardBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {cardBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Últimos 4 dígitos</Label>
                  <Input
                    placeholder="0000"
                    maxLength={4}
                    value={cardLastDigits}
                    onChange={(e) => setCardLastDigits(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "pix" && (
            <div className="space-y-2 animate-in fade-in-50">
              <Label>Chave PIX utilizada</Label>
              <Input
                placeholder="Ex: email@exemplo.com ou CPF"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
              />
            </div>
          )}

          {paymentMethod === "transferencia" && (
            <div className="space-y-2 animate-in fade-in-50">
              <Label>Banco</Label>
              <Input
                placeholder="Ex: Banco do Brasil, Itaú"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
          )}

          {paymentMethod === "cheque" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="space-y-2">
                <Label>Número do Cheque</Label>
                <Input
                  placeholder="Número do cheque"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Compensação</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {paymentMethod === "boleto" && (
            <div className="space-y-2 animate-in fade-in-50">
              <Label>Data de Vencimento</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          )}

          {/* Observações */}
          <div className="space-y-1">
            <Label className="text-sm">Observações</Label>
            <Textarea
              placeholder="Observações..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={1}
              className="text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="secondary" size="sm" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!paymentMethod || isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
