import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getUserFriendlyError } from '@/lib/errorMessages';
import {
  UsedEquipment,
  UsedEquipmentPurchase,
  UsedEquipmentRepair,
  UsedEquipmentSale,
  EquipmentFormData,
  PurchaseFormData,
  RepairFormData,
  SaleFormData,
} from '@/types/usedEquipment';
import { RepairItemFormData } from '@/types/repairItem';

export function useUsedEquipment() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<UsedEquipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('used_equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: UsedEquipment[] = (data || []).map(e => ({
        ...e,
        photos: Array.isArray(e.photos) ? (e.photos as string[]) : [],
      }));

      setEquipment(formattedData);
    } catch (error) {
      toast({
        title: 'Erro ao carregar equipamentos',
        description: getUserFriendlyError(error, 'fetchEquipment'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipmentWithDetails = async (id: string): Promise<UsedEquipment | null> => {
    try {
      const [equipmentRes, purchasesRes, repairsRes, saleRes] = await Promise.all([
        supabase.from('used_equipment').select('*').eq('id', id).maybeSingle(),
        supabase.from('used_equipment_purchases').select('*, clients(*)').eq('equipment_id', id),
        supabase.from('used_equipment_repairs').select('*, orders(*)').eq('equipment_id', id).order('created_at', { ascending: false }),
        supabase.from('used_equipment_sales').select('*, clients(*)').eq('equipment_id', id).maybeSingle(),
      ]);

      if (equipmentRes.error) throw equipmentRes.error;
      if (!equipmentRes.data) return null;

      const purchases: UsedEquipmentPurchase[] = (purchasesRes.data || []).map(p => ({
        ...p,
        source_type: p.source_type as 'compra' | 'os',
        client: p.clients as any,
      }));

      const repairs: UsedEquipmentRepair[] = (repairsRes.data || []).map(r => ({
        ...r,
        order: r.orders as any,
      }));

      const sale: UsedEquipmentSale | null = saleRes.data ? {
        ...saleRes.data,
        client: (saleRes.data as any).clients,
      } : null;

      return {
        ...equipmentRes.data,
        photos: Array.isArray(equipmentRes.data.photos) ? (equipmentRes.data.photos as string[]) : [],
        purchases,
        repairs,
        sale,
      };
    } catch (error) {
      toast({
        title: 'Erro ao carregar detalhes',
        description: getUserFriendlyError(error, 'fetchEquipmentDetails'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const generateCode = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_next_equipment_code');
    if (error) throw error;
    return data;
  };

  const createEquipment = async (formData: EquipmentFormData & PurchaseFormData) => {
    if (!user) return null;

    try {
      const code = await generateCode();
      const amount = formData.amount || 0;

      // Create equipment
      const { data: newEquipment, error: eqError } = await supabase
        .from('used_equipment')
        .insert({
          user_id: user.id,
          code,
          name: formData.name,
          brand: formData.brand || null,
          model: formData.model || null,
          serial_number: formData.serial_number || null,
          imei: formData.imei || null,
          category: formData.category,
          condition: formData.condition,
          purchase_price: amount,
          total_cost: amount,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (eqError) throw eqError;

      // Create financial transaction for purchase
      let financialTransactionId: string | null = null;
      if (amount > 0) {
        const { data: txData, error: txError } = await supabase
          .from('financial_transactions')
          .insert({
            user_id: user.id,
            description: `Compra Seminovo: ${formData.name} (${code})`,
            type: 'despesa',
            category: 'compra_seminovo',
            amount,
            cost_amount: amount,
            profit_amount: 0,
            status: 'pago',
            paid_at: new Date().toISOString(),
            client_id: formData.client_id || null,
          })
          .select()
          .single();

        if (txError) throw txError;
        financialTransactionId = txData.id;
      }

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('used_equipment_purchases')
        .insert({
          user_id: user.id,
          equipment_id: newEquipment.id,
          client_id: formData.client_id || null,
          source_order_id: formData.source_order_id || null,
          source_type: formData.source_type,
          amount,
          financial_transaction_id: financialTransactionId,
          notes: formData.notes || null,
        });

      if (purchaseError) throw purchaseError;

      await fetchEquipment();
      toast({ title: 'Equipamento cadastrado com sucesso!' });
      return newEquipment;
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar equipamento',
        description: getUserFriendlyError(error, 'createEquipment'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateEquipment = async (id: string, updates: Partial<EquipmentFormData>) => {
    try {
      const { error } = await supabase
        .from('used_equipment')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setEquipment(prev => prev.map(e =>
        e.id === id ? { ...e, ...updates } : e
      ));
      toast({ title: 'Equipamento atualizado com sucesso!' });
      return true;
    } catch (error) {
      toast({
        title: 'Erro ao atualizar equipamento',
        description: getUserFriendlyError(error, 'updateEquipment'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const addRepair = async (equipmentId: string, formData: RepairFormData & { items?: RepairItemFormData[] }) => {
    if (!user) return null;

    try {
      const totalCost = (formData.parts_cost || 0) + (formData.labor_cost || 0);

      const { data: repair, error: repairError } = await supabase
        .from('used_equipment_repairs')
        .insert({
          user_id: user.id,
          equipment_id: equipmentId,
          description: formData.description,
          parts_cost: formData.parts_cost || 0,
          labor_cost: formData.labor_cost || 0,
          total_cost: totalCost,
          order_id: formData.order_id || null,
          notes: formData.notes || null,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (repairError) throw repairError;

      // Insert repair items if any
      if (formData.items && formData.items.length > 0) {
        const repairItems = formData.items.map(item => ({
          repair_id: repair.id,
          item_id: item.item_id || null,
          item_type: item.item_type,
          name: item.name,
          quantity: item.quantity,
          cost_price: item.cost_price,
        }));

        const { error: itemsError } = await supabase
          .from('used_equipment_repair_items')
          .insert(repairItems);

        if (itemsError) throw itemsError;

        // Update product stock for items from inventory
        for (const item of formData.items) {
          if (item.item_type === 'product' && item.item_id) {
            const { data: product, error: productError } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.item_id)
              .single();

            if (!productError && product) {
              const newStock = Math.max(0, product.stock - item.quantity);
              await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.item_id);
            }
          }
        }
      }

      // Update equipment repair_cost and total_cost
      const eq = equipment.find(e => e.id === equipmentId);
      if (eq) {
        const newRepairCost = Number(eq.repair_cost) + totalCost;
        const newTotalCost = Number(eq.purchase_price) + newRepairCost;

        await supabase
          .from('used_equipment')
          .update({
            repair_cost: newRepairCost,
            total_cost: newTotalCost,
            status: 'disponivel', // Return to available after repair
          })
          .eq('id', equipmentId);
      }

      await fetchEquipment();
      toast({ title: 'Reparo registrado com sucesso!' });
      return repair;
    } catch (error) {
      toast({
        title: 'Erro ao registrar reparo',
        description: getUserFriendlyError(error, 'addRepair'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const sellEquipment = async (equipmentId: string, formData: SaleFormData) => {
    if (!user) return null;

    try {
      const eq = equipment.find(e => e.id === equipmentId);
      if (!eq) throw new Error('Equipamento não encontrado');

      const profit = formData.amount - Number(eq.total_cost);

      // Create financial transaction for sale
      const { data: txData, error: txError } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          description: `Venda Seminovo: ${eq.name} (${eq.code})`,
          type: 'receita',
          category: 'venda_seminovo',
          amount: formData.amount,
          cost_amount: Number(eq.total_cost),
          profit_amount: profit,
          status: 'pago',
          paid_at: new Date().toISOString(),
          payment_method: formData.payment_method,
          client_id: formData.client_id || null,
        })
        .select()
        .single();

      if (txError) throw txError;

      // Create sale record
      const { data: sale, error: saleError } = await supabase
        .from('used_equipment_sales')
        .insert({
          user_id: user.id,
          equipment_id: equipmentId,
          client_id: formData.client_id || null,
          amount: formData.amount,
          payment_method: formData.payment_method,
          warranty_days: formData.warranty_days || 0,
          financial_transaction_id: txData.id,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Update equipment status
      await supabase
        .from('used_equipment')
        .update({
          status: 'vendido',
          sale_price: formData.amount,
          profit,
          sold_at: new Date().toISOString(),
        })
        .eq('id', equipmentId);

      await fetchEquipment();
      toast({ title: 'Venda registrada com sucesso!' });
      return sale;
    } catch (error) {
      toast({
        title: 'Erro ao registrar venda',
        description: getUserFriendlyError(error, 'sellEquipment'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('used_equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEquipment(prev => prev.filter(e => e.id !== id));
      toast({ title: 'Equipamento excluído com sucesso!' });
      return true;
    } catch (error) {
      toast({
        title: 'Erro ao excluir equipamento',
        description: getUserFriendlyError(error, 'deleteEquipment'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const setEquipmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('used_equipment')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setEquipment(prev => prev.map(e =>
        e.id === id ? { ...e, status } : e
      ));
      toast({ title: 'Status atualizado!' });
      return true;
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: getUserFriendlyError(error, 'setEquipmentStatus'),
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Summary calculations
  const summary = {
    total: equipment.length,
    disponivel: equipment.filter(e => e.status === 'disponivel').length,
    emReparo: equipment.filter(e => e.status === 'em_reparo').length,
    vendido: equipment.filter(e => e.status === 'vendido').length,
    valorEstoque: equipment
      .filter(e => e.status !== 'vendido')
      .reduce((sum, e) => sum + Number(e.total_cost), 0),
    lucroTotal: equipment
      .filter(e => e.status === 'vendido' && e.profit)
      .reduce((sum, e) => sum + Number(e.profit || 0), 0),
  };

  return {
    equipment,
    loading,
    summary,
    fetchEquipment,
    fetchEquipmentWithDetails,
    createEquipment,
    updateEquipment,
    addRepair,
    sellEquipment,
    deleteEquipment,
    setEquipmentStatus,
  };
}
