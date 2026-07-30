"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface AuthResult {
  error?: string;
  /** Supabase sent a confirmation email — the account isn't active until it's clicked. */
  checkEmail?: boolean;
}

/**
 * The origin this request actually arrived on (localhost in dev, the Vercel
 * domain in production), so confirmation emails link back to the right site.
 */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Sign in with email + password. In demo mode, walks straight to the app. */
export async function signIn(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/dashboard");

  if (!isSupabaseConfigured()) {
    redirect(redirectTo);
  }

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(redirectTo);
}

/** Create an account. In demo mode, walks straight to the app. */
export async function signUp(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("name") ?? "").trim();

  if (!isSupabaseConfigured()) {
    redirect("/onboarding");
  }

  if (!email || password.length < 6) {
    return { error: "Use a valid email and a password of at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${await requestOrigin()}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // With email confirmation on (the Supabase default) there's no session yet —
  // sending them into the app would just bounce them back to the login screen.
  if (!data.session) {
    return { checkEmail: true };
  }

  redirect("/onboarding");
}

/** Sign the current user out and return to the marketing site. */
export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
