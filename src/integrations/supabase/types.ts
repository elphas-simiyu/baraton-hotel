export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          password_hash: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          password_hash: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          password_hash?: string
        }
        Relationships: []
      }
      booking_services: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          quantity: number | null
          service_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          quantity?: number | null
          service_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          quantity?: number | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_services_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          check_in_date: string
          check_out_date: string
          created_at: string
          guest_email: string
          guest_name: string
          guest_phone: string | null
          guests: number
          id: string
          room_id: string
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          check_in_date: string
          check_out_date: string
          created_at?: string
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          guests?: number
          id?: string
          room_id: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          guests?: number
          id?: string
          room_id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_occupancy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string | null
          id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price_per_night: number
          size_sqm: number | null
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price_per_night: number
          size_sqm?: number | null
          type: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price_per_night?: number
          size_sqm?: number | null
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_available: boolean | null
          name: string
          price: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean | null
          name: string
          price?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          email: string
          id: string
          last_activity: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_activity?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_activity?: string
        }
        Relationships: []
      }
    }
    Views: {
      booking_analytics: {
        Row: {
          average_booking_value: number | null
          month: string | null
          total_bookings: number | null
          total_revenue: number | null
          unique_guests: number | null
        }
        Relationships: []
      }
      room_occupancy: {
        Row: {
          avg_stay_duration: number | null
          id: string | null
          name: string | null
          total_bookings: number | null
          total_revenue: number | null
          type: Database["public"]["Enums"]["room_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "checked_out"
        | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      room_type: "standard" | "deluxe" | "executive_suite" | "conference_suite"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      room_type: ["standard", "deluxe", "executive_suite", "conference_suite"],
    },
  },
} as const
