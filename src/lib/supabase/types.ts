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
      exam_attempts: {
        Row: {
          completed_at: string | null
          domain_scores: Json | null
          id: string
          level: number
          passed: boolean | null
          score_percent: number | null
          started_at: string
          subdomain_scores: Json | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          domain_scores?: Json | null
          id?: string
          level: number
          passed?: boolean | null
          score_percent?: number | null
          started_at?: string
          subdomain_scores?: Json | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          domain_scores?: Json | null
          id?: string
          level?: number
          passed?: boolean | null
          score_percent?: number | null
          started_at?: string
          subdomain_scores?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          ai_feedback: string | null
          created_at: string
          domain: string
          id: string
          question: string
          score: number | null
          subdomain: string
          user_answer: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          created_at?: string
          domain: string
          id?: string
          question: string
          score?: number | null
          subdomain: string
          user_answer: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          created_at?: string
          domain?: string
          id?: string
          question?: string
          score?: number | null
          subdomain?: string
          user_answer?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          exam_date: string | null
          id: string
          neta_target_level: number | null
          username: string | null
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          id: string
          neta_target_level?: number | null
          username?: string | null
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          id?: string
          neta_target_level?: number | null
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          concept_type: string
          correct_answer: string
          created_at: string
          difficulty: number
          domain: string
          explanation: string
          frequency_tier: number
          id: string
          level: number
          options: Json | null
          prerequisites: string[] | null
          question: string
          source: string
          subdomain: string
          trap_pattern: string | null
        }
        Insert: {
          concept_type: string
          correct_answer: string
          created_at?: string
          difficulty: number
          domain: string
          explanation: string
          frequency_tier: number
          id?: string
          level: number
          options?: Json | null
          prerequisites?: string[] | null
          question: string
          source: string
          subdomain: string
          trap_pattern?: string | null
        }
        Update: {
          concept_type?: string
          correct_answer?: string
          created_at?: string
          difficulty?: number
          domain?: string
          explanation?: string
          frequency_tier?: number
          id?: string
          level?: number
          options?: Json | null
          prerequisites?: string[] | null
          question?: string
          source?: string
          subdomain?: string
          trap_pattern?: string | null
        }
        Relationships: []
      }
      user_question_stats: {
        Row: {
          ease_factor: number
          id: string
          interval_days: number
          last_score: number | null
          next_review_date: string
          question_id: string
          repetitions: number
          time_spent_ms: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ease_factor?: number
          id?: string
          interval_days?: number
          last_score?: number | null
          next_review_date?: string
          question_id: string
          repetitions?: number
          time_spent_ms?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ease_factor?: number
          id?: string
          interval_days?: number
          last_score?: number | null
          next_review_date?: string
          question_id?: string
          repetitions?: number
          time_spent_ms?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_stats_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_question_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
