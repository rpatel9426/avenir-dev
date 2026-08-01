import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  STRIPE_WEBHOOK_SECRET,
  isStripeConfigured,
  stripe,
} from "@/lib/stripe";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Stripe webhook — the only thing in Avenir that grants or revokes Premium.
 *
 * The upgrade button starts a Checkout session and nothing more; entitlement
 * changes happen here, after Stripe's signature has been verified against the
 * raw request body. That ordering is what stops a closed tab, a replayed
 * request or a failed card from minting a subscription.
 *
 * Stripe retries on any non-2xx, so this returns 200 for events it recognises
 * and handles, 200 for events it doesn't care about, and 4xx only when the
 * request itself is untrustworthy.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured() || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  if (!isAdminConfigured()) {
    // Failing loudly beats silently taking payment without granting access.
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY missing" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // The raw body is required — parsing it first would break verification.
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Signature verification failed: ${detail}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId =
          session.client_reference_id ?? session.metadata?.supabase_user_id;
        if (!userId) break;

        await supabase
          .from("profiles")
          .update({
            plan: "premium",
            stripe_customer_id:
              typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id:
              typeof session.subscription === "string"
                ? session.subscription
                : null,
          })
          .eq("id", userId);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;

        // A subscription stays entitled while it is live or in its grace
        // period. Anything else — cancelled, unpaid, incomplete — is Free.
        const entitled =
          subscription.status === "active" || subscription.status === "trialing";

        const query = supabase
          .from("profiles")
          .update({ plan: entitled ? "premium" : "free" });

        // Prefer the user id we stamped on the subscription; fall back to the
        // customer id, which is how a portal-initiated cancel finds its row.
        if (userId) {
          await query.eq("id", userId);
        } else if (typeof subscription.customer === "string") {
          await query.eq("stripe_customer_id", subscription.customer);
        }
        break;
      }

      default:
        // Every other event is acknowledged and ignored.
        break;
    }
  } catch (error) {
    // A 500 tells Stripe to retry, which is what we want for a transient
    // database problem — the runner has paid and must end up entitled.
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: detail }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
