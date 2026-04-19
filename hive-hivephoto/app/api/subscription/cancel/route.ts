import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { getOrCreateSubscription } from '@/lib/db/subscriptions'
import { getStripe } from '@/lib/stripe/client'

export async function POST(_req: NextRequest) {
  try {
    const userId = await requireAuth()
    const sub = await getOrCreateSubscription(userId)

    if (!sub.stripeSubscriptionId) {
      return NextResponse.json({ canceled: false, reason: 'No active Stripe subscription' }, { status: 400 })
    }

    const stripe = getStripe()
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })

    return NextResponse.json({ canceled: true, atPeriodEnd: true })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
