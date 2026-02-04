import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Smartphone,
  Edit,
  Trash2,
  ExternalLink,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Client, Order } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ClientViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

interface EquipmentTransaction {
  id: string;
  equipment_id: string;
  type: 'purchase' | 'sale';
  equipment_name: string;
  equipment_code: string;
  amount: number;
  created_at: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  em_andamento: { label: "Em Andamento", className: "bg-info/20 text-info" },
  aguardando: { label: "Aguardando", className: "bg-warning/20 text-warning" },
  concluido: { label: "Concluído", className: "bg-success/20 text-success" },
  aguardando_peca: { label: "Aguard. Peça", className: "bg-muted text-muted-foreground" },
  entregue: { label: "Entregue", className: "bg-primary/20 text-primary" },
  cancelado: { label: "Cancelado", className: "bg-destructive/20 text-destructive" },
};

export function ClientViewDialog({
  open,
  onOpenChange,
  client,
  onEdit,
  onDelete,
}: ClientViewDialogProps) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [equipmentTransactions, setEquipmentTransactions] = useState<EquipmentTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && client) {
      fetchClientHistory();
    }
  }, [open, client]);

  const fetchClientHistory = async () => {
    if (!client) return;
    setLoading(true);
    
    try {
      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);

      // Fetch equipment purchases
      const { data: purchases } = await supabase
        .from('used_equipment_purchases')
        .select('id, equipment_id, amount, created_at, used_equipment(name, code)')
        .eq('client_id', client.id);

      // Fetch equipment sales
      const { data: sales } = await supabase
        .from('used_equipment_sales')
        .select('id, equipment_id, amount, created_at, used_equipment(name, code)')
        .eq('client_id', client.id);

      const transactions: EquipmentTransaction[] = [];

      (purchases || []).forEach((p: any) => {
        if (p.used_equipment) {
          transactions.push({
            id: p.id,
            equipment_id: p.equipment_id,
            type: 'purchase',
            equipment_name: p.used_equipment.name,
            equipment_code: p.used_equipment.code,
            amount: p.amount,
            created_at: p.created_at,
          });
        }
      });

      (sales || []).forEach((s: any) => {
        if (s.used_equipment) {
          transactions.push({
            id: s.id,
            equipment_id: s.equipment_id,
            type: 'sale',
            equipment_name: s.used_equipment.name,
            equipment_code: s.used_equipment.code,
            amount: s.amount,
            created_at: s.created_at,
          });
        }
      });

      transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setEquipmentTransactions(transactions);
    } catch (error) {
      console.error('Error fetching client history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!client) return null;

  const isCompany = client.client_type === "pessoa_juridica";

  const formatAddress = () => {
    const parts = [];
    if (client.address) parts.push(client.address);
    if (client.numero) parts.push(client.numero);
    if (client.complemento) parts.push(client.complemento);
    if (client.bairro) parts.push(client.bairro);
    if (client.city && client.state) parts.push(`${client.city}/${client.state}`);
    if (client.cep) parts.push(`CEP: ${client.cep}`);
    return parts.join(", ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {isCompany ? (
                  <Building2 className="w-5 h-5 text-primary" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base">{client.name}</DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {isCompany ? "Pessoa Jurídica" : "Pessoa Física"}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(client)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive" 
                onClick={() => onDelete(client)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados" className="text-xs">Dados</TabsTrigger>
            <TabsTrigger value="os" className="text-xs">OS ({orders.length})</TabsTrigger>
            <TabsTrigger value="seminovos" className="text-xs">Seminovos ({equipmentTransactions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-3 space-y-3">
            {/* Contact Info */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Contato</h4>
              <div className="space-y-1.5">
                {client.phone && (
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Documents */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Documentos</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {client.cpf && (
                  <div>
                    <span className="text-muted-foreground">CPF: </span>
                    <span className="font-medium">{client.cpf}</span>
                  </div>
                )}
                {client.cnpj && (
                  <div>
                    <span className="text-muted-foreground">CNPJ: </span>
                    <span className="font-medium">{client.cnpj}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {(client.address || client.city) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase">Endereço</h4>
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <span>{formatAddress()}</span>
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {client.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase">Observações</h4>
                  <p className="text-xs">{client.notes}</p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="os" className="mt-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Nenhuma OS encontrada</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-2.5 rounded-lg border bg-card hover:bg-secondary/30 cursor-pointer transition-colors"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/ordens?view=${order.id}`);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Smartphone className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{order.device}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {order.os_number} • {format(new Date(order.created_at), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={cn("text-[10px]", statusConfig[order.status]?.className)}>
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                        <span className="text-xs font-medium">R$ {Number(order.total_sale).toFixed(2)}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="seminovos" className="mt-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : equipmentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Smartphone className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Nenhuma transação encontrada</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {equipmentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-lg border bg-card hover:bg-secondary/30 cursor-pointer transition-colors"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/seminovos/${tx.equipment_id}`);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {tx.type === 'purchase' ? (
                          <ShoppingCart className="w-4 h-4 text-orange-500 shrink-0" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{tx.equipment_name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {tx.equipment_code} • {format(new Date(tx.created_at), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px]",
                            tx.type === 'purchase' 
                              ? "border-orange-500/30 text-orange-600" 
                              : "border-green-500/30 text-green-600"
                          )}
                        >
                          {tx.type === 'purchase' ? 'Compra' : 'Venda'}
                        </Badge>
                        <span className="text-xs font-medium">R$ {Number(tx.amount).toFixed(2)}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
