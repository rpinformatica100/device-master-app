export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          bairro: string | null
          cep: string | null
          city: string | null
          client_type: string | null
          cnpj: string | null
          complemento: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          numero: string | null
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          bairro?: string | null
          cep?: string | null
          city?: string | null
          client_type?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          numero?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          bairro?: string | null
          cep?: string | null
          city?: string | null
          client_type?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          numero?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          nome_fantasia: string | null
          numero: string | null
          razao_social: string | null
          rua: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          razao_social?: string | null
          rua?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          razao_social?: string | null
          rua?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string | null
          client_id: string | null
          cost_amount: number
          created_at: string
          description: string
          details: Json | null
          due_date: string | null
          id: string
          order_id: string | null
          paid_at: string | null
          payment_method: string | null
          profit_amount: number
          status: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          category?: string | null
          client_id?: string | null
          cost_amount?: number
          created_at?: string
          description: string
          details?: Json | null
          due_date?: string | null
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          profit_amount?: number
          status?: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string | null
          cost_amount?: number
          created_at?: string
          description?: string
          details?: Json | null
          due_date?: string | null
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          profit_amount?: number
          status?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          cost_price: number
          created_at: string
          id: string
          item_id: string | null
          item_type: string
          name: string
          order_id: string
          quantity: number
          sale_price: number
        }
        Insert: {
          cost_price?: number
          created_at?: string
          id?: string
          item_id?: string | null
          item_type: string
          name: string
          order_id: string
          quantity?: number
          sale_price?: number
        }
        Update: {
          cost_price?: number
          created_at?: string
          id?: string
          item_id?: string | null
          item_type?: string
          name?: string
          order_id?: string
          quantity?: number
          sale_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accessories: string | null
          category: string
          category_specific_fields: Json | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          device: string
          id: string
          internal_notes: string | null
          issue: string
          os_number: string
          password: string | null
          priority: string
          serial_number: string | null
          status: string
          total_cost: number
          total_profit: number
          total_sale: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accessories?: string | null
          category: string
          category_specific_fields?: Json | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          device: string
          id?: string
          internal_notes?: string | null
          issue: string
          os_number: string
          password?: string | null
          priority?: string
          serial_number?: string | null
          status?: string
          total_cost?: number
          total_profit?: number
          total_sale?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accessories?: string | null
          category?: string
          category_specific_fields?: Json | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          device?: string
          id?: string
          internal_notes?: string | null
          issue?: string
          os_number?: string
          password?: string | null
          priority?: string
          serial_number?: string | null
          status?: string
          total_cost?: number
          total_profit?: number
          total_sale?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string
          id: string
          notes: string | null
          payment_method: string | null
          source_withdrawal_id: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          source_withdrawal_id?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          source_withdrawal_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_transactions_source_withdrawal_fkey"
            columns: ["source_withdrawal_id"]
            isOneToOne: false
            referencedRelation: "withdrawals"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          cost_price: number
          created_at: string
          id: string
          min_stock: number
          name: string
          sale_price: number
          sku: string | null
          stock: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          cost_price?: number
          created_at?: string
          id?: string
          min_stock?: number
          name: string
          sale_price?: number
          sku?: string | null
          stock?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          cost_price?: number
          created_at?: string
          id?: string
          min_stock?: number
          name?: string
          sale_price?: number
          sku?: string | null
          stock?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          cost_price: number
          created_at: string
          description: string | null
          id: string
          name: string
          sale_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sale_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sale_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      used_equipment: {
        Row: {
          brand: string | null
          category: string
          code: string
          condition: string
          created_at: string
          id: string
          imei: string | null
          model: string | null
          name: string
          notes: string | null
          photos: Json | null
          profit: number | null
          purchase_price: number
          repair_cost: number
          sale_price: number | null
          serial_number: string | null
          sold_at: string | null
          status: string
          total_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category?: string
          code: string
          condition?: string
          created_at?: string
          id?: string
          imei?: string | null
          model?: string | null
          name: string
          notes?: string | null
          photos?: Json | null
          profit?: number | null
          purchase_price?: number
          repair_cost?: number
          sale_price?: number | null
          serial_number?: string | null
          sold_at?: string | null
          status?: string
          total_cost?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string
          code?: string
          condition?: string
          created_at?: string
          id?: string
          imei?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          photos?: Json | null
          profit?: number | null
          purchase_price?: number
          repair_cost?: number
          sale_price?: number | null
          serial_number?: string | null
          sold_at?: string | null
          status?: string
          total_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      used_equipment_purchases: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          equipment_id: string
          financial_transaction_id: string | null
          id: string
          notes: string | null
          source_order_id: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          equipment_id: string
          financial_transaction_id?: string | null
          id?: string
          notes?: string | null
          source_order_id?: string | null
          source_type?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          equipment_id?: string
          financial_transaction_id?: string | null
          id?: string
          notes?: string | null
          source_order_id?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "used_equipment_purchases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "used_equipment_purchases_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "used_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "used_equipment_purchases_financial_transaction_id_fkey"
            columns: ["financial_transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "used_equipment_purchases_source_order_id_fkey"
            columns: ["source_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      used_equipment_repairs: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string
          equipment_id: string
          id: string
          labor_cost: number
          notes: string | null
          order_id: string | null
          parts_cost: number
          total_cost: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description: string
          equipment_id: string
          id?: string
          labor_cost?: number
          notes?: string | null
          order_id?: string | null
          parts_cost?: number
          total_cost?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string
          equipment_id?: string
          id?: string
          labor_cost?: number
          notes?: string | null
          order_id?: string | null
          parts_cost?: number
          total_cost?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "used_equipment_repairs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "used_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "used_equipment_repairs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      used_equipment_sales: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          equipment_id: string
          financial_transaction_id: string | null
          id: string
          notes: string | null
          payment_method: string | null
          user_id: string
          warranty_days: number | null
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          equipment_id: string
          financial_transaction_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          user_id: string
          warranty_days?: number | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          equipment_id?: string
          financial_transaction_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          user_id?: string
          warranty_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "used_equipment_sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "used_equipment_sales_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "used_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "used_equipment_sales_financial_transaction_id_fkey"
            columns: ["financial_transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string
          description: string | null
          financial_transaction_id: string | null
          id: string
          personal_transaction_id: string | null
          reference_month: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string
          description?: string | null
          financial_transaction_id?: string | null
          id?: string
          personal_transaction_id?: string | null
          reference_month: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string
          description?: string | null
          financial_transaction_id?: string | null
          id?: string
          personal_transaction_id?: string | null
          reference_month?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_financial_transaction_id_fkey"
            columns: ["financial_transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_personal_transaction_fkey"
            columns: ["personal_transaction_id"]
            isOneToOne: false
            referencedRelation: "personal_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_next_equipment_code: { Args: never; Returns: string }
      generate_next_os_number: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
