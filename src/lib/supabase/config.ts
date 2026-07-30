/**
 * Supabase configuration + a graceful "is it wired up yet?" check.
 *
 * Avenir is designed to run the moment you clone it — before you have a
 * Supabase project. When the env vars below are missing we fall back to a
 * local demo experience (see `lib/demo.ts`). Once you paste real credentials
 * into `.env.local`, the same code paths switch over to live auth + data with
 * no further changes.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when both public Supabase env vars are present and non-placeholder. */
export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL.length > 0 &&
    SUPABASE_ANON_KEY.length > 0 &&
    !SUPABASE_URL.includes("your-project") &&
    !SUPABASE_ANON_KEY.includes("your-anon-key")
  );
}
