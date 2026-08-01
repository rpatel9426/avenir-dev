/**
 * Database types for Avenir's Supabase schema.
 *
 * These mirror `supabase/schema.sql`. If you evolve the schema, you can
 * regenerate this file with the Supabase CLI:
 *   supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
 */

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type Plan = "free" | "premium";
export type RunGoal =
  | "easy"
  | "long"
  | "tempo"
  | "intervals"
  | "recovery"
  | "race";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          experience_level: ExperienceLevel;
          weekly_goal_km: number;
          preferred_pace_sec_per_km: number | null;
          plan: Plan;
          /** Set by the Stripe webhook; never written from the browser. */
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          /** While in the future, pain triage has paused the plan. */
          plan_paused_until: string | null;
          /** 'km' or 'mi'. Display only — storage is always metric. */
          units: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          experience_level?: ExperienceLevel;
          weekly_goal_km?: number;
          preferred_pace_sec_per_km?: number | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_paused_until?: string | null;
          units?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      runs: {
        Row: {
          id: string;
          user_id: string;
          goal: RunGoal;
          distance_m: number;
          duration_s: number;
          avg_pace_sec_per_km: number | null;
          avg_heart_rate: number | null;
          calories: number | null;
          notes: string | null;
          started_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal?: RunGoal;
          distance_m?: number;
          duration_s?: number;
          avg_pace_sec_per_km?: number | null;
          avg_heart_rate?: number | null;
          calories?: number | null;
          notes?: string | null;
          started_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["runs"]["Insert"]>;
        Relationships: [];
      };
      plan_sessions: {
        Row: {
          id: string;
          user_id: string;
          scheduled_on: string;
          kind: string;
          detail: string | null;
          tag: string | null;
          load: number;
          completed_run_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scheduled_on: string;
          kind?: string;
          detail?: string | null;
          tag?: string | null;
          load?: number;
          completed_run_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plan_sessions"]["Insert"]>;
        Relationships: [];
      };
      coach_beliefs: {
        Row: {
          id: string;
          user_id: string;
          key: string;
          value: string;
          corrected_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          key: string;
          value: string;
          corrected_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["coach_beliefs"]["Insert"]>;
        Relationships: [];
      };
      coaching_messages: {
        Row: {
          id: string;
          run_id: string;
          at_second: number;
          tone: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          at_second: number;
          tone: string;
          message: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["coaching_messages"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      experience_level: ExperienceLevel;
      run_goal: RunGoal;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Run = Database["public"]["Tables"]["runs"]["Row"];
export type CoachingMessage =
  Database["public"]["Tables"]["coaching_messages"]["Row"];
