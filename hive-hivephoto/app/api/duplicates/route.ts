import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { getPendingDuplicates } from '@/lib/db/photos'

export async function GET(_req: Request) {
  try {
    const userId = await requireUser()
    const photos = await getPendingDuplicates(userId)
    return NextResponse.json({ photos })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
