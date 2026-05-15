import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import sql from "@/lib/db";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" })
  : null;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hivebuystuff.hive.baby";

const PRICE_IDS: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
};

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const { user_id, plan } = body ?? {};

  if (!user_id || !plan || !PRICE_IDS[plan]) {
    return NextResponse.json({ error: "user_id and valid plan (pro|premium) required" }, { status: 400 });
  }

  const priceId = PRICE_IDS[plan]!;

  const subRows = await sql`SELECT stripe_customer_id FROM hbs_subscriptions WHERE user_id = ${user_id}`;
  const existingCustomer = subRows[0]?.stripe_customer_id ?? null;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}?upgraded=1`,
    cancel_url: `${APP_URL}?upgrade_cancelled=1`,
    client_reference_id: user_id,
    metadata: { hbs_user_id: user_id, plan },
    ...(existingCustomer ? { customer: existingCustomer } : {}),
    subscription_data: {
      metadata: { hbs_user_id: user_id, plan },
    },
  });

  return NextResponse.json({ url: session.url });
}
