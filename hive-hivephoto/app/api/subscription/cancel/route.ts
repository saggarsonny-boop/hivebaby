import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { sql } from '@/lib/db/client'
import { getStripe } from '@/lib/stripe/client'

export async function POST(_req: Request) {
  try {
    const userId = await requireUser()
    const rows = await sql`
      SELECT stripe_subscription_id FROM user_subscriptions
      WHERE user_id = ${userId} AND stripe_subscription_id IS NOT NULL
      LIMIT 1
    `
    if (!rows.length) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    }
    const subId = (rows[0] as { stripe_subscription_id: string }).stripe_subscription_id
    const stripe = getStripe()
    await stripe.subscriptions.update(subId, { cancel_at_period_end: true })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
