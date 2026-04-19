import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { getPhotoById, softDeletePhoto, updateUserTitle } from '@/lib/db/photos'
import { getFacesForPhoto } from '@/lib/db/faces'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth()
    const { id } = await params
    const photo = await getPhotoById(id, userId)
    if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const faces = await getFacesForPhoto(id)
    return NextResponse.json({ ...photo, faces })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[photos/[id] GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth()
    const { id } = await params
    const body = await req.json() as { userTitle?: string }

    if (body.userTitle !== undefined) {
      await updateUserTitle(id, userId, body.userTitle)
    }

    const updated = await getPhotoById(id, userId)
    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth()
    const { id } = await params
    const photo = await getPhotoById(id, userId)
    if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await softDeletePhoto(id, userId)
    return NextResponse.json({ deleted: true })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
