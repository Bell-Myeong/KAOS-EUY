export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Enums: {
      order_status:
        | 'pending'
        | 'processing'
        | 'printing'
        | 'shipped'
        | 'completed'
        | 'cancelled';
    };
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          name?: string | null;
          phone?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          images: string[];
          sizes: string[];
          colors: Json;
          in_stock: boolean;
          is_customizable: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          images?: string[];
          sizes?: string[];
          colors?: Json;
          in_stock?: boolean;
          is_customizable?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          images?: string[];
          sizes?: string[];
          colors?: Json;
          in_stock?: boolean;
          is_customizable?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          size: string;
          color_code: string;
          color_name: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          size: string;
          color_code: string;
          color_name: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          size?: string;
          color_code?: string;
          color_name?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cart_items_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cart_items_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: Database['public']['Enums']['order_status'];
          currency: string;
          subtotal: number;
          shipping_fee: number;
          total: number;
          custom_order_id: string | null;
          guest_email: string | null;
          guest_name: string | null;
          guest_phone: string | null;
          guest_shipping: Json | null;
          lookup_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?: Database['public']['Enums']['order_status'];
          currency?: string;
          subtotal?: number;
          shipping_fee?: number;
          total?: number;
          custom_order_id?: string | null;
          guest_email?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          guest_shipping?: Json | null;
          lookup_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          status?: Database['public']['Enums']['order_status'];
          currency?: string;
          subtotal?: number;
          shipping_fee?: number;
          total?: number;
          custom_order_id?: string | null;
          guest_email?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          guest_shipping?: Json | null;
          lookup_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_custom_order_id_fkey';
            columns: ['custom_order_id'];
            referencedRelation: 'custom_orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          size: string;
          color_code: string;
          color_name: string;
          quantity: number;
          unit_price: number;
          custom_fee: number;
          customization: Json | null;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          size: string;
          color_code: string;
          color_name: string;
          quantity: number;
          unit_price: number;
          custom_fee?: number;
          customization?: Json | null;
          line_total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          size?: string;
          color_code?: string;
          color_name?: string;
          quantity?: number;
          unit_price?: number;
          custom_fee?: number;
          customization?: Json | null;
          line_total?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      custom_orders: {
        Row: {
          id: string;
          user_id: string;
          order_type: 'personal' | 'bulk';
          customer_info: Json;
          product_base: Json;
          size_quantity: Json;
          design: Json;
          sundanese_elements: Json | null;
          order_details: Json | null;
          shipping: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_type: 'personal' | 'bulk';
          customer_info: Json;
          product_base: Json;
          size_quantity: Json;
          design: Json;
          sundanese_elements?: Json | null;
          order_details?: Json | null;
          shipping?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_type?: 'personal' | 'bulk';
          customer_info?: Json;
          product_base?: Json;
          size_quantity?: Json;
          design?: Json;
          sundanese_elements?: Json | null;
          order_details?: Json | null;
          shipping?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'custom_orders_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_order_guest: {
        Args: { p_items: Json; p_customer: Json; p_shipping: Json };
        Returns: { order_id: string; lookup_token: string }[];
      };
      get_order_guest: {
        Args: { p_order_id: string; p_email: string; p_token: string };
        Returns: Json;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    CompositeTypes: { [_ in never]: never };
  };
};
