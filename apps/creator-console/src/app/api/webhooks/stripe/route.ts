import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }
  } else {
    // Fallback for local testing without webhook secret
    try {
      event = JSON.parse(body);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  }

  // Handle successful payments
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const engineId = session.metadata?.engine_id || 'unknown';
    const amount = (session.amount_total || 0) / 100;
    
    console.log(`Payment success: ${amount} for engine ${engineId}`);

    try {
      const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
      
      // We log the revenue event into our telemetry table
      await sql`
        INSERT INTO ecosystem_telemetry (engine_id, session_id, event_type, amount)
        VALUES (${engineId}, ${session.id}, 'payment_success', ${amount})
      `;
    } catch (dbError) {
      console.error('Failed to log payment to Neon DB', dbError);
    }
  }

  return NextResponse.json({ received: true });
}
