import { Check } from "lucide-react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "@/components/pricing/upgrade-button";
import { getProfile } from "@/lib/session";
import { isPremium, PLANS } from "@/lib/entitlements";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Run coached for free. Talk to your coach with Avenir Premium.",
};

// Reflects the signed-in user's current plan — must render per-request.
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const profile = await getProfile();
  const premium = isPremium(profile);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 pt-28 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="label-mono text-primary">Pricing</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Run coached for{" "}
            <span className="font-editorial italic text-primary">free</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            The full run and live coaching cost nothing. Talking to your coach,
            hands-free, is Premium.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          {(["free", "premium"] as const).map((key) => {
            const plan = PLANS[key];
            const isThisPlanCurrent =
              (key === "premium" && premium) || (key === "free" && !premium);
            const featured = key === "premium";
            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col rounded-3xl border p-7",
                  featured
                    ? "border-primary/50 bg-primary/[0.05]"
                    : "border-border bg-card/60"
                )}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{plan.name}</h2>
                  {isThisPlanCurrent && <Badge>Current plan</Badge>}
                </div>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="tabular-nums text-4xl font-semibold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          featured ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  {featured ? (
                    premium ? (
                      <p className="text-center text-sm font-medium text-primary">
                        You&apos;re on Premium ✓
                      </p>
                    ) : (
                      <UpgradeButton target="premium" />
                    )
                  ) : premium ? (
                    <UpgradeButton target="free" />
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      Your current plan
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-md text-center text-xs text-muted-foreground">
          Payments aren&apos;t wired up yet — upgrading flips your plan instantly so
          you can try Premium. Stripe Checkout is the next step.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
