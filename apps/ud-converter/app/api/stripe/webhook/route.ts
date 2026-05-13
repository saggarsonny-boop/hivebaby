import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('[STRIPE_WEBHOOK_ERROR]', error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const clerkUserId = session.metadata?.clerkUserId;

    if (clerkUserId) {
      // Update Clerk metadata to unlock Plus features
      await clerkClient.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          isPlusPaid: true,
          stripeCustomerId: session.customer as string,
        },
      });
      console.log(`[STRIPE] Successfully unlocked Plus for ${clerkUserId}`);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    // Handle cancellations (optional for Phase 1, but good practice)
    const subscription = event.data.object as Stripe.Subscription;
    // You would typically query Clerk by stripeCustomerId here to revoke access
  }

  return new NextResponse('OK', { status: 200 });
}
