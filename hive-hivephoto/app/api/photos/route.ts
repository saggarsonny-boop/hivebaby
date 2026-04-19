import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { getGalleryPage } from '@/lib/db/photos'

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth()
    const url = new URL(req.url)
    const cursor = url.searchParams.get('cursor') ?? null
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Math.min(100, parseInt(limitParam)) : 40

    const page = await getGalleryPage(userId, cursor, limit)
    return NextResponse.json(page)
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[photos GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
