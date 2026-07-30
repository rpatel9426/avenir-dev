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
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          experience_level?: ExperienceLevel;
          weekly_goal_km?: number;
          preferred_pace_sec_per_km?: number | null;
          plan?: Plan;
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
