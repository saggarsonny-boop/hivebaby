import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { getPendingDuplicates } from '@/lib/db/photos'

export async function GET(_req: NextRequest) {
  try {
    const userId = await requireAuth()
    const dupes = await getPendingDuplicates(userId)
    return NextResponse.json({ duplicates: dupes, total: dupes.length })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
