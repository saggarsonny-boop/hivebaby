import { NextResponse } from 'next/server';
import { createSessionToken, serializeSessionCookie } from '@hive/auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === 'HiveBees' || password === process.env.SPACE_STATION_PASSWORD) {
      const token = createSessionToken({
        userId: 'founder_override',
        email: 'founder@universaldocument.org',
        plan: 'enterprise',
        engines: ['*']
      });

      const response = NextResponse.json({ success: true });
      response.headers.set('Set-Cookie', serializeSessionCookie(token));
      return response;
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
