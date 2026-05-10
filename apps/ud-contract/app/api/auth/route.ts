import { NextResponse } from 'next/server';
import { createSessionToken, serializeSessionCookie } from '@hive/auth';

export async function POST() {
  return handleMockLogin();
}

export async function GET(req: Request) {
  // Used as the mock Stripe success_url redirect
  const url = new URL(req.url);
  return handleMockLogin(url.origin);
}

async function handleMockLogin(origin: string = '/') {
  // Simulate successful enterprise login
  const token = createSessionToken({
    userId: 'mock_user_123',
    email: 'founder@universaldocument.org',
    plan: 'enterprise',
    engines: ['ud-contract']
  });

  const response = NextResponse.redirect(new URL('/', origin));
  
  // Attach the secure session cookie
  response.headers.set('Set-Cookie', serializeSessionCookie(token));
  
  return response;
}
