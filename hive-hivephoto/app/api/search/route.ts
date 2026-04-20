import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { executeSearch } from '@/lib/search/query'

export async function GET(req: Request) {
  try {
    const userId = await requireUser()
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') ?? ''
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)
    const offset = parseInt(searchParams.get('offset') ?? '0')
    const result = await executeSearch(userId, q, limit, offset)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
