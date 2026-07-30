import { Sparkles } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Shown on the auth screens while Supabase is not yet configured, so it's
 * obvious the credentials are illustrative and any submit lands in the demo.
 */
export function DemoNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/10 p-3 text-xs text-primary">
      <Sparkles className="mt-0.5 size-3.5 shrink-0" />
      <p>
        Demo mode — Supabase isn&apos;t connected yet, so any details here take
        you straight into the app. Add your keys to <code>.env.local</code> to
        enable real accounts.
      </p>
    </div>
  );
}
