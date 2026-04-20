import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { getPhotosByUser, countPhotosByUser } from '@/lib/db/photos'

export async function GET(req: Request) {
  try {
    const userId = await requireUser()
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)
    const offset = parseInt(searchParams.get('offset') ?? '0')
    const [photos, total] = await Promise.all([
      getPhotosByUser(userId, limit, offset),
      countPhotosByUser(userId),
    ])
    return NextResponse.json({ photos, total, limit, offset })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
