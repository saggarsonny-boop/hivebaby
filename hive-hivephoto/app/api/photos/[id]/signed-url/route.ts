import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { getPhotoById } from '@/lib/db/photos'
import { getSignedGetUrl } from '@/lib/storage/r2'
import { env } from '@/lib/env'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser()
    const { id } = await params
    const photo = await getPhotoById(id, userId)
    if (!photo || !photo.originalKey) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const url = await getSignedGetUrl(env.R2_BUCKET_ORIGINALS, photo.originalKey, 3600)
    return NextResponse.json({ url, expiresIn: 3600 })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
