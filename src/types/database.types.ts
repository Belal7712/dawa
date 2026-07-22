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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          meta: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string | null
          guest_id: string
          id: string
          qr_token: string | null
          used_at: string | null
        }
        Insert: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          guest_id: string
          id?: string
          qr_token?: string | null
          used_at?: string | null
        }
        Update: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          guest_id?: string
          id?: string
          qr_token?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkins_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          id: string
          max_uses: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          id?: string
          max_uses?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          max_uses?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          bride_name: string | null
          cover_media_url: string | null
          created_at: string | null
          event_date: string | null
          event_type: string | null
          groom_name: string | null
          id: string
          language_default: string | null
          owner_id: string
          slug: string | null
          status: string | null
          template_id: string | null
          title: string
          venue_lat: number | null
          venue_lng: number | null
          venue_map_url: string | null
          venue_name: string | null
        }
        Insert: {
          bride_name?: string | null
          cover_media_url?: string | null
          created_at?: string | null
          event_date?: string | null
          event_type?: string | null
          groom_name?: string | null
          id?: string
          language_default?: string | null
          owner_id: string
          slug?: string | null
          status?: string | null
          template_id?: string | null
          title: string
          venue_lat?: number | null
          venue_lng?: number | null
          venue_map_url?: string | null
          venue_name?: string | null
        }
        Update: {
          bride_name?: string | null
          cover_media_url?: string | null
          created_at?: string | null
          event_date?: string | null
          event_type?: string | null
          groom_name?: string | null
          id?: string
          language_default?: string | null
          owner_id?: string
          slug?: string | null
          status?: string | null
          template_id?: string | null
          title?: string
          venue_lat?: number | null
          venue_lng?: number | null
          venue_map_url?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          companions_allowed: number | null
          created_at: string | null
          event_id: string
          full_name: string
          group_label: string | null
          id: string
          phone_e164: string | null
          unique_token: string | null
        }
        Insert: {
          companions_allowed?: number | null
          created_at?: string | null
          event_id: string
          full_name: string
          group_label?: string | null
          id?: string
          phone_e164?: string | null
          unique_token?: string | null
        }
        Update: {
          companions_allowed?: number | null
          created_at?: string | null
          event_id?: string
          full_name?: string
          group_label?: string | null
          id?: string
          phone_e164?: string | null
          unique_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_sar: number
          created_at: string | null
          currency: string | null
          event_id: string
          gateway_reference: string | null
          id: string
          package_id: string
          paid_at: string | null
          payment_gateway: string | null
          receipt_url: string | null
          status: string | null
        }
        Insert: {
          amount_sar: number
          created_at?: string | null
          currency?: string | null
          event_id: string
          gateway_reference?: string | null
          id?: string
          package_id: string
          paid_at?: string | null
          payment_gateway?: string | null
          receipt_url?: string | null
          status?: string | null
        }
        Update: {
          amount_sar?: number
          created_at?: string | null
          currency?: string | null
          event_id?: string
          gateway_reference?: string | null
          id?: string
          package_id?: string
          paid_at?: string | null
          payment_gateway?: string | null
          receipt_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string | null
          features: Json | null
          guest_limit: number | null
          id: string
          is_active: boolean | null
          name: string
          price_sar: number
          type: string
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          guest_limit?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price_sar: number
          type: string
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          guest_limit?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_sar?: number
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          companions_count: number | null
          created_at: string | null
          guest_id: string
          id: string
          responded_at: string | null
          response_channel: string | null
          status: string | null
        }
        Insert: {
          companions_count?: number | null
          created_at?: string | null
          guest_id: string
          id?: string
          responded_at?: string | null
          response_channel?: string | null
          status?: string | null
        }
        Update: {
          companions_count?: number | null
          created_at?: string | null
          guest_id?: string
          id?: string
          responded_at?: string | null
          response_channel?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: true
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string | null
          id: string
          message: string
          name: string
          phone_or_email: string
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          name: string
          phone_or_email: string
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          name?: string
          phone_or_email?: string
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          preview_image_url: string | null
          sort_order: number | null
          theme_config: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_image_url?: string | null
          sort_order?: number | null
          theme_config?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_image_url?: string | null
          sort_order?: number | null
          theme_config?: Json | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          created_at: string | null
          guest_id: string
          id: string
          message_type: string | null
          provider_message_id: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          guest_id: string
          id?: string
          message_type?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          guest_id?: string
          id?: string
          message_type?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: boolean
          brand_name: string | null
          logo_url: string | null
          site_url: string | null
          contact_phone: string | null
          contact_email: string | null
          whatsapp: string | null
          address: string | null
          updated_at: string | null
        }
        Insert: {
          id?: boolean
          brand_name?: string | null
          logo_url?: string | null
          site_url?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          whatsapp?: string | null
          address?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: boolean
          brand_name?: string | null
          logo_url?: string | null
          site_url?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          whatsapp?: string | null
          address?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_invite: {
        Args: { p_token: string }
        Returns: Json
      }
      submit_rsvp: {
        Args: {
          p_token: string
          p_status: string
          p_companions?: number
        }
        Returns: Json
      }
      submit_public_rsvp: {
        Args: {
          p_event_slug: string
          p_guest_name: string
          p_status?: string
          p_companions?: number
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
