import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { getOrCreateSubscription } from '@/lib/db/subscriptions'

export async function GET(_req: NextRequest) {
  try {
    const userId = await requireAuth()
    const subscription = await getOrCreateSubscription(userId)
    return NextResponse.json(subscription)
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
