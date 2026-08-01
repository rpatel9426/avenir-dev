import Stripe from "stripe";

/**
 * Stripe, wired the same way as Supabase: the app runs fine without it.
 *
 * With keys present, upgrading goes through Stripe Checkout and the plan is
 * flipped by the webhook — never by the button that started the purchase.
 * Without keys, `/pricing` falls back to the direct entitlement flip so the
 * demo stays fully browsable.
 */

const SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";

/** The recurring price the Premium plan bills against (price_… from Stripe). */
export const STRIPE_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID ?? "";

/** Signing secret for the webhook endpoint (whsec_…). */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export function isStripeConfigured(): boolean {
  return (
    SECRET_KEY.startsWith("sk_") &&
    STRIPE_PRICE_ID.startsWith("price_") &&
    !SECRET_KEY.includes("your-")
  );
}

let client: Stripe | null = null;

/** The Stripe client. Throws if called when Stripe isn't configured. */
export function stripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured — check STRIPE_SECRET_KEY.");
  }
  client ??= new Stripe(SECRET_KEY, {
    // Identifies Avenir in Stripe's logs, which makes support tickets tractable.
    appInfo: { name: "Avenir", url: "https://avenir-dev.vercel.app" },
  });
  return client;
}

/** Absolute base URL for Checkout return links. */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
