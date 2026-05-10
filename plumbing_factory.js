const fs = require('fs');
const path = require('path');

const APPS_DIR = path.join(__dirname, 'apps');

const CHAT_ROUTE_TS = `import { NextResponse } from 'next/server';

// Queen Bee Inference Route (Scaffolded)
// Connects the UI to the LLM (OpenAI/Gemini) through the Hive Safety Guardrails
export async function POST(req) {
  try {
    const { message } = await req.json();

    // TODO: Connect to OpenAI/Gemini SDK
    // const response = await openai.chat.completions.create({ ... })
    
    // Simulated Queen Bee Response
    return NextResponse.json({
      response: "[Queen Bee Inference Active] Processing query: " + message + ". This is a placeholder for the live LLM connection."
    });
  } catch (error) {
    return NextResponse.json({ error: 'Inference Engine Error' }, { status: 500 });
  }
}
`;

const STRIPE_WEBHOOK_TS = `import { NextResponse } from 'next/server';

// Official Stripe Webhook for Hive Engine Monetization
// Handles $1/yr Trapdoors and $10/mo Pro Subscriptions
export async function POST(req) {
  try {
    // TODO: Verify Stripe Signature
    // const sig = req.headers.get('stripe-signature');
    // const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

    // Simulated Webhook Handling
    // if (event.type === 'checkout.session.completed') {
    //   // Update User DB: hasPaid = true
    // }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }
}
`;

const MIDDLEWARE_TS = `import { NextResponse } from 'next/server';

// Hive Unified Auth Middleware (Scaffolded)
// Wraps the engine in a session layer (Clerk/Supabase) to track paid status
export function middleware(request) {
  // TODO: Add Clerk or Supabase Auth logic here
  // If user is trying to access /pro and hasPaid === false, redirect to /pricing
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
`;

async function run() {
    if (!fs.existsSync(APPS_DIR)) {
        console.error('Apps directory not found:', APPS_DIR);
        return;
    }

    const apps = fs.readdirSync(APPS_DIR).filter(file => fs.statSync(path.join(APPS_DIR, file)).isDirectory());
    console.log("Found " + apps.length + " engines. Injecting Plumbing Layer (Stripe, Auth, Inference)...");

    let injectedCount = 0;

    apps.forEach((app) => {
        const appDir = path.join(APPS_DIR, app);
        const apiDir = path.join(appDir, 'app', 'api');
        
        // Ensure API directories exist
        const chatApiDir = path.join(apiDir, 'chat');
        const stripeApiDir = path.join(apiDir, 'stripe', 'webhook');

        fs.mkdirSync(chatApiDir, { recursive: true });
        fs.mkdirSync(stripeApiDir, { recursive: true });

        // Inject Queen Bee Inference Route
        fs.writeFileSync(path.join(chatApiDir, 'route.ts'), CHAT_ROUTE_TS, 'utf8');

        // Inject Stripe Webhook
        fs.writeFileSync(path.join(stripeApiDir, 'route.ts'), STRIPE_WEBHOOK_TS, 'utf8');

        // Inject Auth Middleware
        fs.writeFileSync(path.join(appDir, 'middleware.ts'), MIDDLEWARE_TS, 'utf8');

        injectedCount++;
    });

    console.log("Successfully injected Stripe, Auth, and Inference plumbing into " + injectedCount + " engines.");
}

run();
