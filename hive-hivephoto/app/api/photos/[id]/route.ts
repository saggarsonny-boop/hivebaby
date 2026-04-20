import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { getPhotoById, updateUserTitle, softDeletePhoto } from '@/lib/db/photos'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser()
    const { id } = await params
    const photo = await getPhotoById(id, userId)
    if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(photo)
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser()
    const { id } = await params
    const body = (await req.json()) as { title?: string }
    if (body.title !== undefined) {
      await updateUserTitle(id, userId, body.title)
    }
    const photo = await getPhotoById(id, userId)
    return NextResponse.json(photo)
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser()
    const { id } = await params
    await softDeletePhoto(id, userId)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
