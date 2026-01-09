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
  availableProfit: number;
  referenceMonth: Date;
  onConfirm: (amount: number, description?: string) => Promise<void>;
}

export function WithdrawalDialog({
  open,
  onOpenChange,
  availableProfit,
  referenceMonth,
  onConfirm,
}: WithdrawalDialogProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const isValid = numericAmount > 0 && numericAmount <= availableProfit;

  const handleConfirm = async () => {
    if (!isValid) return;

    try {
      setLoading(true);
      await onConfirm(numericAmount, description || undefined);
      setAmount('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Fazer Retirada (Pro-labore)
          </DialogTitle>
          <DialogDescription>
            Transfira parte do lucro empresarial para sua conta pessoal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="text-sm text-muted-foreground">Referência</div>
            <div className="text-lg font-medium capitalize">
              {format(referenceMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </div>
          </div>

          <div className="rounded-lg bg-primary/10 p-4">
            <div className="text-sm text-muted-foreground">Lucro Disponível</div>
            <div className="text-2xl font-bold text-primary">
              R$ {availableProfit.toFixed(2)}
            </div>
          </div>

          {availableProfit <= 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Não há lucro disponível para retirada.</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Valor da Retirada</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              max={availableProfit}
              step="0.01"
              disabled={availableProfit <= 0}
            />
            {numericAmount > availableProfit && (
              <p className="text-xs text-destructive">
                O valor não pode ser maior que o lucro disponível.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Ex: Pro-labore referente ao mês de janeiro"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              disabled={availableProfit <= 0}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || loading}>
            {loading ? 'Processando...' : 'Confirmar Retirada'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
