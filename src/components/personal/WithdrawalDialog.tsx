import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Wallet } from 'lucide-react';

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Saldo acumulado disponível (lucro de todos os meses menos retiradas) */
  availableProfit: number;
  /** Lucro apenas do mês de referência (informativo) */
  monthProfit?: number;
  referenceMonth: Date;
  onConfirm: (amount: number, description?: string) => Promise<void>;
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export function WithdrawalDialog({
  open,
  onOpenChange,
  availableProfit,
  monthProfit,
  referenceMonth,
  onConfirm,
}: WithdrawalDialogProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
  const isValid = numericAmount > 0 && numericAmount <= availableProfit;

  const handleConfirm = async () => {
    if (!isValid || loading) return;
    try {
      setLoading(true);
      await onConfirm(numericAmount, description || undefined);
      setAmount('');
      setDescription('');
      onOpenChange(false);
    } catch {
      // erro tratado no hook
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-primary" />
            Fazer Retirada (Pro-labore)
          </DialogTitle>
          <DialogDescription className="text-xs">
            Transfira parte do lucro acumulado da empresa para sua conta pessoal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted p-3">
              <div className="text-xs text-muted-foreground">Referência</div>
              <div className="text-sm font-medium capitalize">
                {format(referenceMonth, "MMM 'de' yyyy", { locale: ptBR })}
              </div>
              {monthProfit !== undefined && (
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Lucro do mês: {brl(monthProfit)}
                </div>
              )}
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <div className="text-xs text-muted-foreground">Saldo Acumulado</div>
              <div className="text-lg font-bold text-primary">{brl(availableProfit)}</div>
            </div>
          </div>

          {availableProfit <= 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2.5 text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Não há saldo disponível para retirada.</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs">Valor da Retirada</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              className="text-sm"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              max={availableProfit}
              step="0.01"
              disabled={availableProfit <= 0}
            />
            <div className="flex flex-wrap gap-1.5">
              {[0.25, 0.5, 1].map(p => (
                <Button
                  key={p}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  disabled={availableProfit <= 0}
                  onClick={() => setAmount((availableProfit * p).toFixed(2))}
                >
                  {p === 1 ? 'Tudo' : `${p * 100}%`}
                </Button>
              ))}
            </div>
            {numericAmount > availableProfit && (
              <p className="text-xs text-destructive">
                O valor não pode ser maior que o saldo disponível.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">Descrição (opcional)</Label>
            <Textarea
              id="description"
              className="text-sm"
              placeholder="Ex: Pro-labore referente a janeiro"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              disabled={availableProfit <= 0}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" className="text-xs" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button size="sm" className="text-xs" onClick={handleConfirm} disabled={!isValid || loading}>
            {loading ? 'Processando...' : 'Confirmar Retirada'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
