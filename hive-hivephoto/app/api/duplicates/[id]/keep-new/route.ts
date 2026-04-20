import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { updateDuplicateReviewStatus, getPhotoById, softDeletePhoto } from '@/lib/db/photos'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser()
    const { id } = await params
    const photo = await getPhotoById(id, userId)
    if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await updateDuplicateReviewStatus(id, userId, 'kept_new')
    if (photo.nearDuplicateOf) {
      await softDeletePhoto(photo.nearDuplicateOf, userId)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
