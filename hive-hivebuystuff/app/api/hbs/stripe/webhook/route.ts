import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import sql from "@/lib/db";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" })
  : null;

export const config = { api: { bodyParser: false } };

function planFromPriceId(priceId: string): "pro" | "premium" | null {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return "premium";
  return null;
}

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const user_id = session.client_reference_id;
    const stripe_customer_id = typeof session.customer === "string" ? session.customer : null;
    const sub_id = typeof session.subscription === "string" ? session.subscription : null;
    const plan = session.metadata?.plan ?? "pro";

    if (user_id) {
      await sql`
        INSERT INTO hbs_subscriptions (user_id, tier, stripe_customer_id, stripe_subscription_id, updated_at)
        VALUES (${user_id}, ${plan}, ${stripe_customer_id}, ${sub_id}, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          tier = EXCLUDED.tier,
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          updated_at = NOW()
      `;
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const user_id = sub.metadata?.hbs_user_id;
    const priceId = sub.items.data[0]?.price.id;
    const plan = planFromPriceId(priceId ?? "") ?? "pro";
    const period_end = new Date(sub.current_period_end * 1000);

    if (user_id) {
      await sql`
        INSERT INTO hbs_subscriptions (user_id, tier, stripe_subscription_id, current_period_end, updated_at)
        VALUES (${user_id}, ${plan}, ${sub.id}, ${period_end}, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          tier = EXCLUDED.tier,
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          current_period_end = EXCLUDED.current_period_end,
          updated_at = NOW()
      `;
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const user_id = sub.metadata?.hbs_user_id;
    if (user_id) {
      await sql`
        UPDATE hbs_subscriptions
        SET tier = 'free', stripe_subscription_id = NULL, current_period_end = NULL, updated_at = NOW()
        WHERE user_id = ${user_id}
      `;
    }
  }

  return NextResponse.json({ received: true });
}
