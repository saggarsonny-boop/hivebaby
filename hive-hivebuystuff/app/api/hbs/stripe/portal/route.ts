import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import sql from "@/lib/db";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" })
  : null;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hivebuystuff.hive.baby";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const { user_id } = body ?? {};

  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const rows = await sql`SELECT stripe_customer_id FROM hbs_subscriptions WHERE user_id = ${user_id}`;
  const customer_id = rows[0]?.stripe_customer_id;

  if (!customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer_id,
    return_url: APP_URL,
  });

  return NextResponse.json({ url: session.url });
}
