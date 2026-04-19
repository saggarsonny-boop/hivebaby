import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, syncSubscription } from '@/lib/stripe/webhooks'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  try {
    const event = await constructWebhookEvent(body, signature)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as { id: string }
        await syncSubscription(sub.id)
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    console.error('[stripe webhook]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
