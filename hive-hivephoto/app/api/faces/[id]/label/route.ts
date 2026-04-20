import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { labelFace, unlabelFace } from '@/lib/db/faces'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser()
    const { id } = await params
    const body = (await req.json()) as { personId: string | null }
    if (body.personId) {
      await labelFace(id, body.personId)
    } else {
      await unlabelFace(id)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
