import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { getTier, getStorageUsed } from '@/lib/pricing/gates'

export async function GET(_req: Request) {
  try {
    const userId = await requireUser()
    const [tier, storageUsed] = await Promise.all([getTier(userId), getStorageUsed(userId)])
    return NextResponse.json({ tier, storageUsed: storageUsed.toString() })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
