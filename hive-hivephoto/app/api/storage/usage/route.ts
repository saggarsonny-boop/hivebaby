import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { getStorageUsed, getEffectiveTier } from '@/lib/pricing/gates'
import { getRecentStorageEvents } from '@/lib/db/photos'

export async function GET(_req: Request) {
  try {
    const userId = await requireUser()
    const [used, tier, events] = await Promise.all([
      getStorageUsed(userId),
      getEffectiveTier(userId),
      getRecentStorageEvents(userId, 20),
    ])
    return NextResponse.json({
      usedBytes: used.toString(),
      totalBytes: tier.storageBytes.toString(),
      tierName: tier.tierName,
      events,
    })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
