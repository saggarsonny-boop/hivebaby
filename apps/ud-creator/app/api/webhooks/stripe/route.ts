import { NextResponse } from 'next/server';
import { constructWebhookEvent } from '@hive/billing';
// import { db } from '@/lib/db'; // In a real implementation, we would import drizzle DB here.

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    // The engine they subscribed to (passed via metadata)
    const engine = session.metadata?.engine;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    console.log(`[QUEEN BEE] Payment successful for ${engine}. Provisioning access for ${customerId}...`);

    // TODO: Update the neon database to grant this user access to the specific engine.
    // await db.insert(subscriptions).values({
    //   stripeCustomerId: customerId,
    //   stripeSubscriptionId: subscriptionId,
    //   plan: 'enterprise',
    //   engine: engine,
    //   status: 'active'
    // });
  }

  return NextResponse.json({ received: true });
}
