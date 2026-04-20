import { getStripe } from './client'
import { syncSubscription, cancelSubscription } from './sync'
import { env } from '@/lib/env'
import type Stripe from 'stripe'

export async function handleStripeWebhook(req: Request): Promise<void> {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) throw new Error('Missing stripe-signature header')

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${String(err)}`)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break
      const userId = session.metadata?.userId ?? session.client_reference_id
      if (!userId || !session.subscription) break
      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      await syncSubscription({
        userId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0]?.price.id ?? '',
        status: sub.status,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      })
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (!userId) break
      await syncSubscription({
        userId,
        stripeCustomerId: sub.customer as string,
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0]?.price.id ?? '',
        status: sub.status,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      })
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (!userId) break
      await cancelSubscription(userId)
      break
    }
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed': {
      // Handled via subscription.updated events
      break
    }
  }
}
