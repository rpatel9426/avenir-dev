import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";
import type { Database } from "./types";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Admin Supabase client — bypasses row-level security.
 *
 * Only for server-side work that has no user session and has already
 * established trust some other way. Today that means exactly one caller: the
 * Stripe webhook, which verifies a signature before it touches this.
 *
 * The service-role key must never reach the browser: no NEXT_PUBLIC_ prefix,
 * and nothing that imports this file may be a client component.
 */
export function isAdminConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SERVICE_ROLE_KEY.length > 0;
}

export function createAdminClient() {
  if (!isAdminConfigured()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing — the Stripe webhook cannot grant plans without it."
    );
  }
  return createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
