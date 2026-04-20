import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { updateDuplicateReviewStatus } from '@/lib/db/photos'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser()
    const { id } = await params
    await updateDuplicateReviewStatus(id, userId, 'kept_both')
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
