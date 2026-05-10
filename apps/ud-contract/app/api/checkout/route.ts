import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@hive/billing';

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    
    // Create Stripe Checkout Session via @hive/billing
    const session = await createCheckoutSession(
      'ud-contract',
      `${origin}/api/auth`, // Hack for mock local dev: redirect back to auth to generate JWT
      `${origin}/login`
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
