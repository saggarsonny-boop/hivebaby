import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { search } from '@/lib/search/parser'

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth()
    const query = new URL(req.url).searchParams.get('q') ?? ''
    const results = await search(userId, query)
    return NextResponse.json({ results })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[search]', err)
    return NextResponse.json({ results: [] }) // Always return something
  }
}
