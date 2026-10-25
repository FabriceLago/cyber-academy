/* eslint-disable */
// Généré par « npm run db:types » à partir du schéma de la base : ne pas modifier.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "content_reports": {
                  Row: {
                    "created_at": string,"id": number,"lab_id": string | null,"lesson_id": string | null,"message": string,"question_id": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: never,"lab_id"?: string | null,"lesson_id"?: string | null,"message": string,"question_id"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: never,"lab_id"?: string | null,"lesson_id"?: string | null,"message"?: string,"question_id"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "content_reports_lab_id_fkey"
      columns: ["lab_id"]
isOneToOne: false
      referencedRelation: "labs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "content_reports_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "content_reports_lesson_id_question_id_fkey"
      columns: ["lesson_id","question_id"]
isOneToOne: false
      referencedRelation: "quiz_answer_keys"
      referencedColumns: ["lesson_id","question_id"]
    }
                  ]
                },"lab_attempts": {
                  Row: {
                    "completed_at": string,"created_at": string,"hints_used": number,"id": number,"lab_id": string,"succeeded": boolean,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string,"created_at"?: string,"hints_used": number,"id"?: never,"lab_id": string,"succeeded": boolean,"user_id": string
                  }
                  Update: {
                    "completed_at"?: string,"created_at"?: string,"hints_used"?: number,"id"?: never,"lab_id"?: string,"succeeded"?: boolean,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lab_attempts_lab_id_fkey"
      columns: ["lab_id"]
isOneToOne: false
      referencedRelation: "labs"
      referencedColumns: ["id"]
    }
                  ]
                },"labs": {
                  Row: {
                    "created_at": string,"id": string,"kind": string,"lesson_id": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id": string,"kind": string,"lesson_id": string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"kind"?: string,"lesson_id"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "labs_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: true
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    }
                  ]
                },"learning_paths": {
                  Row: {
                    "created_at": string,"id": string,"level": string,"position": number,"premium": boolean,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id": string,"level": string,"position": number,"premium"?: boolean,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"level"?: string,"position"?: number,"premium"?: boolean,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"lessons": {
                  Row: {
                    "created_at": string,"duration_minutes": number,"id": string,"module_id": string,"position": number,"quiz_size": number,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"duration_minutes": number,"id": string,"module_id": string,"position": number,"quiz_size"?: number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"duration_minutes"?: number,"id"?: string,"module_id"?: string,"position"?: number,"quiz_size"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lessons_module_id_fkey"
      columns: ["module_id"]
isOneToOne: false
      referencedRelation: "modules"
      referencedColumns: ["id"]
    }
                  ]
                },"modules": {
                  Row: {
                    "created_at": string,"id": string,"pass_threshold": number,"path_id": string,"position": number,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id": string,"pass_threshold": number,"path_id": string,"position": number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"pass_threshold"?: number,"path_id"?: string,"position"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "modules_path_id_fkey"
      columns: ["path_id"]
isOneToOne: false
      referencedRelation: "learning_paths"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"display_name": string,"id": string,"role": Database["public"]['Enums']["app_role"],"updated_at": string,"weekly_goal": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name": string,"id": string,"role"?: Database["public"]['Enums']["app_role"],"updated_at"?: string,"weekly_goal"?: number | null
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string,"id"?: string,"role"?: Database["public"]['Enums']["app_role"],"updated_at"?: string,"weekly_goal"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"quiz_answer_keys": {
                  Row: {
                    "answer": NonNullable<Json>,"created_at": string,"lesson_id": string,"question_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answer": NonNullable<Json>,"created_at"?: string,"lesson_id": string,"question_id": string,"updated_at"?: string
                  }
                  Update: {
                    "answer"?: NonNullable<Json>,"created_at"?: string,"lesson_id"?: string,"question_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "quiz_answer_keys_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    }
                  ]
                },"quiz_attempts": {
                  Row: {
                    "correct_question_ids": (string)[],"created_at": string,"id": number,"lesson_id": string,"question_ids": (string)[],"submitted_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "correct_question_ids": (string)[],"created_at"?: string,"id"?: never,"lesson_id": string,"question_ids": (string)[],"submitted_at"?: string,"user_id": string
                  }
                  Update: {
                    "correct_question_ids"?: (string)[],"created_at"?: string,"id"?: never,"lesson_id"?: string,"question_ids"?: (string)[],"submitted_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "quiz_attempts_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    }
                  ]
                },"subscriptions": {
                  Row: {
                    "cancel_at_period_end": boolean,"created_at": string,"current_period_end": string | null,"price_id": string | null,"status": string,"stripe_customer_id": string,"stripe_subscription_id": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cancel_at_period_end"?: boolean,"created_at"?: string,"current_period_end"?: string | null,"price_id"?: string | null,"status"?: string,"stripe_customer_id": string,"stripe_subscription_id"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "cancel_at_period_end"?: boolean,"created_at"?: string,"current_period_end"?: string | null,"price_id"?: string | null,"status"?: string,"stripe_customer_id"?: string,"stripe_subscription_id"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "check_attempt_rate":
{ Args: { "recent": number }; Returns: undefined
                           },
"delete_my_account":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"has_active_subscription":
{ Args: { "p_user": string }; Returns: boolean
                           },
"has_distinct_elements":
{ Args: { "items": (string)[] }; Returns: boolean
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_answer_correct":
{ Args: { "answer": Json,"answer_key": Json }; Returns: boolean
                           },
"is_premium_lesson":
{ Args: { "p_lesson_id": string }; Returns: boolean
                           },
"record_lab_attempt":
{ Args: { "p_hints_used": number,"p_lab_id": string,"p_succeeded": boolean }; Returns: {
              "completed_at": string,
"created_at": string,
"hints_used": number,
"id": number,
"lab_id": string,
"succeeded": boolean,
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "lab_attempts"
        isOneToOne: true
        isSetofReturn: false
      } },
"record_quiz_attempt":
{ Args: { "p_answers": Json,"p_lesson_id": string }; Returns: {
              "correct_question_ids": (string)[],
"created_at": string,
"id": number,
"lesson_id": string,
"question_ids": (string)[],
"submitted_at": string,
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "quiz_attempts"
        isOneToOne: true
        isSetofReturn: false
      } },
"report_content":
{ Args: { "p_lab_id"?: string,"p_lesson_id"?: string,"p_message": string,"p_question_id"?: string }; Returns: undefined
                           }
          }
          Enums: {
            "app_role": "apprenant"|"admin"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "app_role": ["apprenant", "admin"]
          }
        }
} as const
