import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { getPhotoById } from '@/lib/db/photos'
import { createSignedGetUrl } from '@/lib/storage/r2'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth()
    const { id } = await params
    const photo = await getPhotoById(id, userId)
    if (!photo || !photo.originalKey) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const url = await createSignedGetUrl(photo.originalKey, 3600)
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString()

    return NextResponse.json({ url, expiresAt })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
