import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { personalCategories, paymentMethods, type PersonalTransaction } from '@/types/personal';

interface PersonalTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: PersonalTransaction | null;
  onSubmit: (data: Omit<PersonalTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function PersonalTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSubmit,
}: PersonalTransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: transaction?.description || '',
    type: transaction?.type || 'despesa' as 'receita' | 'despesa' | 'prolabore',
    category: transaction?.category || '',
    amount: transaction?.amount?.toString() || '',
    status: transaction?.status || 'pago' as 'pago' | 'pendente' | 'cancelado',
    payment_method: transaction?.payment_method || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    notes: transaction?.notes || '',
  });

  const isEditing = !!transaction;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount) return;

    try {
      setLoading(true);
      await onSubmit({
        description: formData.description.trim(),
        type: formData.type,
        category: formData.category || null,
        amount: parseFloat(formData.amount),
        status: formData.status,
        payment_method: formData.payment_method || null,
        source_withdrawal_id: transaction?.source_withdrawal_id || null,
        date: formData.date,
        notes: formData.notes.trim() || null,
      });
      handleClose();
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      description: '',
      type: 'despesa',
      category: '',
      amount: '',
      status: 'pago',
      payment_method: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Transação' : 'Nova Transação Pessoal'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados da transação pessoal.'
              : 'Registre uma nova receita ou despesa pessoal.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'receita' | 'despesa') =>
                  setFormData(prev => ({ ...prev, type: value }))
                }
                disabled={transaction?.type === 'prolabore'}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Almoço no restaurante"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {personalCategories
                    .filter(c => c.value !== 'prolabore')
                    .map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Forma de Pagamento</Label>
              <Select
                value={formData.payment_method}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, payment_method: value }))
                }
              >
                <SelectTrigger id="payment_method">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(pm => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'pago' | 'pendente') =>
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
