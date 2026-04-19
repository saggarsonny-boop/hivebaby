import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { getOrCreateSubscription } from '@/lib/db/subscriptions'

export async function GET(_req: NextRequest) {
  try {
    const userId = await requireAuth()
    const sub = await getOrCreateSubscription(userId)

    return NextResponse.json({
      usedBytes: sub.storageUsedBytes,
      limitBytes: sub.storageLimitBytes,
      unlimited: sub.storageLimitBytes === -1,
      usedPercent: sub.storageLimitBytes === -1
        ? null
        : Math.min(100, Math.round((sub.storageUsedBytes / Math.max(sub.storageLimitBytes, 1)) * 100)),
      tierId: sub.tierId,
    })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
