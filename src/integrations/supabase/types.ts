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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      driver_catalog: {
        Row: {
          category: string
          created_at: string
          download_size_mb: number | null
          hardware_keywords: string[]
          icon: string
          id: string
          installed_date: string
          installed_version: string
          is_pro: boolean
          latest_date: string
          latest_version: string
          name: string
          os_compatibility: string[]
          vendor: string
          whql_certified: boolean
        }
        Insert: {
          category: string
          created_at?: string
          download_size_mb?: number | null
          hardware_keywords?: string[]
          icon?: string
          id?: string
          installed_date: string
          installed_version: string
          is_pro?: boolean
          latest_date: string
          latest_version: string
          name: string
          os_compatibility?: string[]
          vendor: string
          whql_certified?: boolean
        }
        Update: {
          category?: string
          created_at?: string
          download_size_mb?: number | null
          hardware_keywords?: string[]
          icon?: string
          id?: string
          installed_date?: string
          installed_version?: string
          is_pro?: boolean
          latest_date?: string
          latest_version?: string
          name?: string
          os_compatibility?: string[]
          vendor?: string
          whql_certified?: boolean
        }
        Relationships: []
      }
      driver_updates: {
        Row: {
          category: string
          driver_name: string
          from_version: string
          id: string
          session_id: string
          status: string
          to_version: string
          updated_at: string
        }
        Insert: {
          category: string
          driver_name: string
          from_version: string
          id?: string
          session_id: string
          status?: string
          to_version: string
          updated_at?: string
        }
        Update: {
          category?: string
          driver_name?: string
          from_version?: string
          id?: string
          session_id?: string
          status?: string
          to_version?: string
          updated_at?: string
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          cpu_detected: string | null
          drivers_found: number
          gpu_detected: string | null
          id: string
          os_detected: string | null
          outdated_count: number
          ram_gb: number | null
          scan_date: string
          scan_duration_ms: number | null
          session_id: string
          up_to_date_count: number
        }
        Insert: {
          cpu_detected?: string | null
          drivers_found?: number
          gpu_detected?: string | null
          id?: string
          os_detected?: string | null
          outdated_count?: number
          ram_gb?: number | null
          scan_date?: string
          scan_duration_ms?: number | null
          session_id: string
          up_to_date_count?: number
        }
        Update: {
          cpu_detected?: string | null
          drivers_found?: number
          gpu_detected?: string | null
          id?: string
          os_detected?: string | null
          outdated_count?: number
          ram_gb?: number | null
          scan_date?: string
          scan_duration_ms?: number | null
          session_id?: string
          up_to_date_count?: number
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          category: string
          id: string
          session_id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          category: string
          id?: string
          session_id: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          category?: string
          id?: string
          session_id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
