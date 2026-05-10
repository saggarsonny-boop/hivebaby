const fs = require('fs');
const path = require('path');

const envContent = `
# OPENAI
OPENAI_API_KEY=sk-proj-REDACTED

# ANTHROPIC (Queen Bee)
ANTHROPIC_API_KEY=sk-ant-api03-REDACTED

# STRIPE LIVE
STRIPE_SECRET_KEY=sk_live_REDACTED
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_REDACTED
STRIPE_WEBHOOK_SECRET=whsec_m6W6F16LULJ0CN4iMPL1IAQd0IsL6B0X

# DATABASE (Neon)
DATABASE_URL=postgresql://neondb_owner:npg_auswQiNL9p4T@ep-shy-mouse-am04j7mf-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# CLERK AUTH
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2hvaWNlLWRhc3NpZS02NS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_NZX6GkWzVeHuY4WKI8Fw8Qlh43i17pFF9la6Rx6AWB

# RESEND (Email)
RESEND_API_KEY=re_A6A6qrbZ_PrdcWCPYM9zupQ6T1JsKoLDr
`;

const APPS_DIR = path.join(__dirname, 'apps');

async function run() {
    if (!fs.existsSync(APPS_DIR)) {
        console.error('Apps directory not found:', APPS_DIR);
        return;
    }

    // 1. Write to the root of the hivebaby workspace
    fs.writeFileSync(path.join(__dirname, '.env.local'), envContent.trim(), 'utf8');
    console.log("Written master .env.local to root workspace.");

    // 2. Distribute to all 228 apps so local dev works seamlessly
    const apps = fs.readdirSync(APPS_DIR).filter(file => fs.statSync(path.join(APPS_DIR, file)).isDirectory());
    console.log(\`Found \${apps.length} engines. Injecting API keys...\`);

    let injectedCount = 0;

    apps.forEach((app) => {
        const appDir = path.join(APPS_DIR, app);
        fs.writeFileSync(path.join(appDir, '.env.local'), envContent.trim(), 'utf8');
        injectedCount++;
    });

    console.log(\`Successfully injected live API keys into \${injectedCount} engines.\`);
}

run();
