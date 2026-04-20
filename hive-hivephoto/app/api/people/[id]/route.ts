import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { getPersonById, updatePersonName, deletePerson } from '@/lib/db/people'
import { getPhotosByUser } from '@/lib/db/photos'
import { getFacesByPerson } from '@/lib/db/faces'
import { sql } from '@/lib/db/client'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser()
    const { id } = await params
    const person = await getPersonById(id, userId)
    if (!person) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // Get photos for this person via faces
    const faces = await getFacesByPerson(id)
    const photoIds = [...new Set(faces.map((f) => f.photoId))]
    return NextResponse.json({ person, photoIds })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser()
    const { id } = await params
    const body = (await req.json()) as { name: string }
    await updatePersonName(id, userId, body.name)
    const person = await getPersonById(id, userId)
    return NextResponse.json(person)
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser()
    const { id } = await params
    await deletePerson(id, userId)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
