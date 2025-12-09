import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderItemInput, Client } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export interface PaymentInfo {
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

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, clients(*)')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;

      // Fetch items for each order
      const ordersWithItems: Order[] = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          
          return {
            ...order,
            client: order.clients as Client | null,
            items: (items || []) as OrderItem[],
          } as Order;
        })
      );

      setOrders(ordersWithItems);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar ordens',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateOsNumber = async (): Promise<string> => {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    const nextNumber = (count || 0) + 1;
    return `OS-${String(nextNumber).padStart(4, '0')}`;
  };

  const createOrder = async (
    orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'os_number' | 'client' | 'items'>,
    items: OrderItemInput[]
  ) => {
    try {
      const os_number = await generateOsNumber();
      
      // Calculate totals
      const total_cost = items.reduce((sum, item) => sum + item.cost_price * item.quantity, 0);
      const total_sale = items.reduce((sum, item) => sum + item.sale_price * item.quantity, 0);
      const total_profit = total_sale - total_cost;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          os_number,
          total_cost,
          total_sale,
          total_profit,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Insert order items
      if (items.length > 0) {
        const orderItems = items.map(item => ({
          ...item,
          order_id: order.id,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
        
        if (itemsError) throw itemsError;
      }

      await fetchOrders();
      toast({ title: 'Ordem de serviço criada com sucesso!' });
      return order;
    } catch (error: any) {
      toast({
        title: 'Erro ao criar ordem de serviço',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateOrder = async (
    id: string,
    orderData: Partial<Order>,
    items?: OrderItemInput[],
    paymentInfo?: PaymentInfo
  ) => {
    try {
      let updateData = { ...orderData };

      // If items are provided, recalculate totals
      if (items) {
        const total_cost = items.reduce((sum, item) => sum + item.cost_price * item.quantity, 0);
        const total_sale = items.reduce((sum, item) => sum + item.sale_price * item.quantity, 0);
        const total_profit = total_sale - total_cost;
        updateData = { ...updateData, total_cost, total_sale, total_profit };
      }

      // Check if status is changing to completed
      const oldOrder = orders.find(o => o.id === id);
      const isCompleting = 
        (orderData.status === 'concluido' || orderData.status === 'entregue') &&
        oldOrder?.status !== 'concluido' && oldOrder?.status !== 'entregue';

      if (isCompleting) {
        updateData.completed_at = new Date().toISOString();
      }

      // Remove joined data from update
      delete updateData.client;
      delete updateData.items;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('order_items')
          .delete()
          .eq('order_id', id);

        // Insert new items
        if (items.length > 0) {
          const orderItems = items.map(item => ({
            ...item,
            order_id: id,
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);
          
          if (itemsError) throw itemsError;
        }
      }

      // Create financial transaction if completing
      if (isCompleting) {
        await createFinancialTransactionFromOrder(id, paymentInfo);
      }

      await fetchOrders();
      toast({ title: 'Ordem de serviço atualizada com sucesso!' });
      return order;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar ordem de serviço',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const createFinancialTransactionFromOrder = async (orderId: string, paymentInfo?: PaymentInfo) => {
    try {
      // Fetch full order data
      const { data: order } = await supabase
        .from('orders')
        .select('*, clients(*)')
        .eq('id', orderId)
        .single();

      if (!order) return;

      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      const client = order.clients as Client | null;

      // Build detailed mapping
      const details: any = {
        client: client ? {
          name: client.name,
          phone: client.phone,
          email: client.email,
          cpf: client.cpf,
        } : null,
        device: {
          name: order.device,
          category: order.category,
          serial_number: order.serial_number,
          category_specific_fields: order.category_specific_fields,
        },
        items: (items || []).map((item: any) => ({
          name: item.name,
          type: item.item_type,
          cost: item.cost_price,
          sale: item.sale_price,
          quantity: item.quantity,
          profit: (item.sale_price - item.cost_price) * item.quantity,
        })),
        totals: {
          products_cost: (items || [])
            .filter((i: any) => i.item_type === 'product')
            .reduce((sum: number, i: any) => sum + i.cost_price * i.quantity, 0),
          products_sale: (items || [])
            .filter((i: any) => i.item_type === 'product')
            .reduce((sum: number, i: any) => sum + i.sale_price * i.quantity, 0),
          services_cost: (items || [])
            .filter((i: any) => i.item_type === 'service')
            .reduce((sum: number, i: any) => sum + i.cost_price * i.quantity, 0),
          services_sale: (items || [])
            .filter((i: any) => i.item_type === 'service')
            .reduce((sum: number, i: any) => sum + i.sale_price * i.quantity, 0),
          total_cost: order.total_cost,
          total_sale: order.total_sale,
          total_profit: order.total_profit,
          margin_percent: order.total_sale > 0 
            ? ((order.total_profit / order.total_sale) * 100).toFixed(2) 
            : 0,
        },
        completed_at: order.completed_at,
      };

      // Add payment info if provided
      if (paymentInfo) {
        details.payment = paymentInfo.payment_details;
      }

      // Create financial transaction
      await supabase
        .from('financial_transactions')
        .insert({
          order_id: orderId,
          client_id: order.client_id,
          description: `${order.os_number} - ${client?.name || 'Cliente não identificado'} - ${order.device}`,
          type: 'receita',
          category: 'ordem_servico',
          amount: order.total_sale,
          cost_amount: order.total_cost,
          profit_amount: order.total_profit,
          status: paymentInfo ? 'pago' : 'pendente',
          payment_method: paymentInfo?.payment_method || null,
          paid_at: paymentInfo ? new Date().toISOString() : null,
          details,
        });

    } catch (error: any) {
      console.error('Error creating financial transaction:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== id));
      toast({ title: 'Ordem de serviço excluída com sucesso!' });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir ordem de serviço',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
  };
}
