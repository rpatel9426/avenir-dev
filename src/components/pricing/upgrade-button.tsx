"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openBillingPortal, startCheckout } from "@/app/pricing/actions";
import type { Plan } from "@/lib/entitlements";

/**
 * Upgrading hands off to Stripe Checkout; downgrading opens Stripe's billing
 * portal, so cancelling is a real cancel rather than a retention funnel.
 *
 * The navigation deliberately sits outside a transition — pairing a push with
 * a refresh inside one is what left the onboarding button spinning forever.
 */
export function UpgradeButton({ target }: { target: Plan }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const onClick = async () => {
    setBusy(true);
    setNote(null);

    const res =
      target === "premium" ? await startCheckout() : await openBillingPortal();

    if (res.redirectTo) {
      // Stripe is off-site, so this is a full navigation, not a router push.
      window.location.assign(res.redirectTo);
      return;
    }

    setNote(res.message);
    setBusy(false);
    if (res.ok) router.refresh();
  };

  return (
    <div>
      <Button
        size="lg"
        className="w-full"
        variant={target === "premium" ? "default" : "secondary"}
        onClick={onClick}
        disabled={busy}
      >
        {busy && <Loader2 className="animate-spin" />}
        {target === "premium" ? "Start Premium" : "Manage or cancel"}
      </Button>
      {note && (
        <p className="mt-3 text-center text-sm text-muted-foreground">{note}</p>
      )}
    </div>
  );
}
