import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { resolveDuplicate } from '@/lib/db/photos'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth()
    const { id } = await params
    const body = await req.json() as { status: 'kept_new' | 'kept_original' | 'kept_both' }
    if (!body.status) return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    await resolveDuplicate(id, userId, body.status)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
