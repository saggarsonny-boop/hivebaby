const fs = require('fs');
const path = require('path');

const APPS_DIR = path.join(__dirname, 'apps');

const CHAT_ROUTE_TS = `import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client using global system environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'MISSING_KEY',
});

// Queen Bee Inference Route (Live)
export async function POST(req) {
  try {
    const { message } = await req.json();

    if (process.env.OPENAI_API_KEY === 'MISSING_KEY' || !process.env.OPENAI_API_KEY) {
       return NextResponse.json({
         response: "[System Alert] Queen Bee requires OPENAI_API_KEY to be set in your global environment variables."
       });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are Queen Bee, the safety-railed inference engine for the Hive ecosystem. Provide calm, objective, educational, and judgment-free clarity. Do not diagnose or offer legal/medical advice." },
        { role: "user", content: message }
      ],
      temperature: 0.2,
    });

    return NextResponse.json({
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Inference Error:', error);
    return NextResponse.json({ error: 'Inference Engine Error' }, { status: 500 });
  }
}
`;

const STRIPE_WEBHOOK_TS = `import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'MISSING_KEY', {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!process.env.STRIPE_SECRET_KEY) {
     return NextResponse.json({ error: 'Stripe keys not configured' }, { status: 500 });
  }

  let event;

  try {
    if (endpointSecret) {
       event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } else {
       // If no webhook secret is set, fallback to parsing without signature verification (local dev only)
       event = JSON.parse(payload);
    }
  } catch (err) {
    return NextResponse.json({ error: \`Webhook Error: \${err.message}\` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Machine over human: Stripe trapdoor clears. 
    // In a real DB, you would update the user's subscription status here based on session.client_reference_id
    console.log(\`[STRIPE SUCCESS] Payment received for session: \${session.id}\`);
  }

  return NextResponse.json({ received: true });
}
`;

async function run() {
    if (!fs.existsSync(APPS_DIR)) {
        console.error('Apps directory not found:', APPS_DIR);
        return;
    }

    const apps = fs.readdirSync(APPS_DIR).filter(file => fs.statSync(path.join(APPS_DIR, file)).isDirectory());
    console.log("Found " + apps.length + " engines. Upgrading Plumbing Layer to LIVE code...");

    let injectedCount = 0;

    apps.forEach((app) => {
        const appDir = path.join(APPS_DIR, app);
        const apiDir = path.join(appDir, 'app', 'api');
        
        // Ensure API directories exist
        const chatApiDir = path.join(apiDir, 'chat');
        const stripeApiDir = path.join(apiDir, 'stripe', 'webhook');

        fs.mkdirSync(chatApiDir, { recursive: true });
        fs.mkdirSync(stripeApiDir, { recursive: true });

        // Inject Live Queen Bee Inference Route
        fs.writeFileSync(path.join(chatApiDir, 'route.ts'), CHAT_ROUTE_TS, 'utf8');

        // Inject Live Stripe Webhook
        fs.writeFileSync(path.join(stripeApiDir, 'route.ts'), STRIPE_WEBHOOK_TS, 'utf8');

        injectedCount++;
    });

    console.log("Successfully upgraded " + injectedCount + " engines to live OpenAI and Stripe execution layers.");
}

run();
