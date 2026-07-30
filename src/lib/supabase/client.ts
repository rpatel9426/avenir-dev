"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./types";

/**
 * Browser-side Supabase client for use inside Client Components.
 * Safe to call repeatedly — @supabase/ssr memoises the underlying client.
 */
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
