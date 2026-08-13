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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address: string
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          phone: string
          postal_code: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          phone: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          phone?: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          data: Json | null
          entity: string | null
          entity_id: string | null
          id: string
          role_snapshot: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          data?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          role_snapshot?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          data?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          role_snapshot?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string
          end_at: string | null
          id: string
          is_active: boolean
          link: string | null
          message: string
          start_at: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_at?: string | null
          id?: string
          is_active?: boolean
          link?: string | null
          message: string
          start_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_at?: string | null
          id?: string
          is_active?: boolean
          link?: string | null
          message?: string
          start_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          quantity: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          quantity: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      colors: {
        Row: {
          hex: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          hex?: string | null
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          hex?: string | null
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          blocks: Json
          created_at: string
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      order_addresses: {
        Row: {
          address: string
          city: string
          country: string
          full_name: string
          id: string
          order_id: string
          phone: string
          postal_code: string | null
          state: string | null
        }
        Insert: {
          address: string
          city: string
          country?: string
          full_name: string
          id?: string
          order_id: string
          phone: string
          postal_code?: string | null
          state?: string | null
        }
        Update: {
          address?: string
          city?: string
          country?: string
          full_name?: string
          id?: string
          order_id?: string
          phone?: string
          postal_code?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_addresses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color_name: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          size_name: string
          sku: string
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          color_name: string
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          size_name: string
          sku: string
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          color_name?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          size_name?: string
          sku?: string
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          email: string
          id: string
          idempotency_key: string
          order_number: string
          payment_method: string
          payment_status: string
          phone: string | null
          shipping_fee: number
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          idempotency_key: string
          order_number: string
          payment_method: string
          payment_status?: string
          phone?: string | null
          shipping_fee: number
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          idempotency_key?: string
          order_number?: string
          payment_method?: string
          payment_status?: string
          phone?: string | null
          shipping_fee?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_seo: {
        Row: {
          canonical_url: string | null
          description: string | null
          id: string
          no_index: boolean
          og_image: string | null
          page_slug: string
          title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          description?: string | null
          id?: string
          no_index?: boolean
          og_image?: string | null
          page_slug: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          description?: string | null
          id?: string
          no_index?: boolean
          og_image?: string | null
          page_slug?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          gateway_ref: string | null
          id: string
          method: string
          order_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          gateway_ref?: string | null
          id?: string
          method: string
          order_id: string
          status: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          gateway_ref?: string | null
          id?: string
          method?: string
          order_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          id: string
          is_primary: boolean
          position: number
          product_id: string
          storage_path: string
        }
        Insert: {
          alt_text?: string | null
          id?: string
          is_primary?: boolean
          position?: number
          product_id: string
          storage_path: string
        }
        Update: {
          alt_text?: string | null
          id?: string
          is_primary?: boolean
          position?: number
          product_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_relations: {
        Row: {
          product_id: string
          related_product_id: string
        }
        Insert: {
          product_id: string
          related_product_id: string
        }
        Update: {
          product_id?: string
          related_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_relations_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color_id: string
          created_at: string
          id: string
          is_active: boolean
          product_id: string
          size_id: string
          sku: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          color_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          product_id: string
          size_id: string
          sku: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          color_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          product_id?: string
          size_id?: string
          sku?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          care: string | null
          category_id: string
          created_at: string
          description: string | null
          fabric: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          is_new: boolean
          is_signature: boolean
          name: string
          price: number
          shipping_info: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          care?: string | null
          category_id: string
          created_at?: string
          description?: string | null
          fabric?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_signature?: boolean
          name: string
          price: number
          shipping_info?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          care?: string | null
          category_id?: string
          created_at?: string
          description?: string | null
          fabric?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_signature?: boolean
          name?: string
          price?: number
          shipping_info?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      review_images: {
        Row: {
          created_at: string
          id: string
          position: number
          review_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          review_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          review_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_images_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string
          created_at: string
          id: string
          is_verified: boolean
          product_id: string
          rating: number
          reviewer_name: string | null
          status: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_verified?: boolean
          product_id: string
          rating: number
          reviewer_name?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          product_id?: string
          rating?: number
          reviewer_name?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_methods: {
        Row: {
          created_at: string
          fee: number | null
          free_above: number | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          fee?: number | null
          free_above?: number | null
          id: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          fee?: number | null
          free_above?: number | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      sizes: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      staff_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: string
          token_hash: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          role: string
          token_hash: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          token_hash?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          user_id: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "storefront_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      storefront_variants: {
        Row: {
          color_id: string | null
          id: string | null
          is_active: boolean | null
          is_in_stock: boolean | null
          product_id: string | null
          size_id: string | null
        }
        Insert: {
          color_id?: string | null
          id?: string | null
          is_active?: boolean | null
          is_in_stock?: never
          product_id?: string | null
          size_id?: string | null
        }
        Update: {
          color_id?: string | null
          id?: string | null
          is_active?: boolean | null
          is_in_stock?: never
          product_id?: string | null
          size_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_bootstrap_owner: {
        Args: {
          p_email: string
        }
        Returns: string
      }
      admin_log: {
        Args: {
          p_action: string
          p_data?: Json
          p_entity?: string
          p_entity_id?: string
        }
        Returns: undefined
      }
      consume_staff_invite: {
        Args: {
          p_email: string
          p_token: string
        }
        Returns: string
      }
      create_staff_invite: {
        Args: {
          p_email: string
          p_role: string
        }
        Returns: {
          invite_id: string
          token: string
        }[]
      }
      get_my_staff_context: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
      }
      create_order: {
        Args: {
          p_address: Json
          p_email: string
          p_idempotency_key: string
          p_payment_method: string
          p_quantities: number[]
          p_shipping_method: string
          p_user_id?: string
          p_variant_ids: string[]
        }
        Returns: {
          created_at: string
          email: string
          id: string
          idempotency_key: string
          order_number: string
          payment_method: string
          payment_status: string
          phone: string | null
          shipping_fee: number
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
