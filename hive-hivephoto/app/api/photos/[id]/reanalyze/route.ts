import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { analyzePhotoById } from '@/lib/pipeline/analyze-photo'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser()
    const { id } = await params
    await analyzePhotoById(id, userId)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
