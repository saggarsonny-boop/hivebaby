import { NextRequest, NextResponse } from 'next/server'

export function checkAdminAuth(req: NextRequest): NextResponse | null {
  const [scheme, token] = (req.headers.get('authorization') ?? '').split(' ')
  if (scheme === 'Bearer' && token && token === process.env.ADMIN_PASSWORD) return null
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
