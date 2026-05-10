const fs = require('fs');
const path = require('path');

const APPS_DIR = path.join(__dirname, 'apps');

const getPackageJson = (name) => `{
  "name": "${name}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@clerk/nextjs": "^5.0.0",
    "next": "14.2.3",
    "next-pwa": "^5.6.0",
    "react": "^18",
    "react-dom": "^18",
    "stripe": "^15.5.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.3",
    "typescript": "^5"
  }
}`;

const getNextConfig = () => `/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);`;

const getGlobalsCss = () => `:root {
  --background: #0f172a;
  --foreground: #f8fafc;
  --hive-gold: #D4AF37;
  --accent: #1e293b;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}

* { box-sizing: border-box; }

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--accent);
  margin-bottom: 3rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--hive-gold);
  text-decoration: none;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 4px;
  border: 1px solid var(--hive-gold);
  cursor: pointer;
  background-color: transparent;
  color: var(--hive-gold);
  text-decoration: none;
  text-transform: uppercase;
}

.btn-solid {
  background-color: var(--hive-gold);
  color: var(--background);
}

.card {
  background: var(--accent);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  padding: 2.5rem;
}
`;

const getLayout = (title) => `import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "${title} | Sovereign Analysis",
  description: "Enterprise clarity engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="container">
            <header className="navbar">
              <a href="/" className="logo">${title}</a>
              <div>
                <SignedIn><UserButton afterSignOutUrl="/"/></SignedIn>
                <SignedOut><a href="/sign-in" className="btn">Authenticate</a></SignedOut>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}`;

const getLandingPage = (title, domainKey) => `"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  return (
    <div style={{ maxWidth: '800px', margin: '4rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
          Universal Document: <br/>
          <span style={{ color: 'var(--hive-gold)' }}>${domainKey} Analysis</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
          A Sovereign-Lite tactical engine specifically engineered to parse, analyze, and extract strategic leverage from ${domainKey.toLowerCase()} documentation.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/sign-up" className="btn btn-solid" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            Deploy Engine
          </a>
        </div>
      </div>
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--hive-gold)', textAlign: 'center' }}>Enterprise Capabilities</h2>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          Real-Time Inference • Zero-Retention Security • $699/month Uncapped
        </div>
      </div>
    </div>
  );
}`;

const getDashboardPage = (title) => `"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulated Stripe gate check
    setTimeout(() => setIsSubscribed(false), 500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isSubscribed) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card">
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--hive-gold)' }}>Authentication Required</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            This Sovereign-Lite tactical engine is restricted to Enterprise subscribers.
          </p>
          <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>$699 <span style={{ fontSize: '1rem', color: '#64748b' }}>/ month</span></div>
          </div>
          <button className="btn btn-solid" style={{ width: '100%', padding: '1rem' }} onClick={() => {
            alert("Routing to Stripe Checkout... (Simulated success)");
            setIsSubscribed(true);
          }}>Authorize Payment & Deploy</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ color: 'var(--hive-gold)', marginBottom: '1rem' }}>${title} HUD</h2>
      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '2rem' }}>
        Network Status: <span style={{ color: isOnline ? '#10b981' : '#ef4444' }}>{isOnline ? "ONLINE (SYNCED)" : "OFFLINE (CACHING LOCALLY)"}</span>
      </div>
      <div style={{ border: '2px dashed var(--accent)', padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        Drag and drop documentation here for strategic analysis.
      </div>
    </div>
  );
}`;

const getManifest = (name) => `{
  "name": "${name}",
  "short_name": "${name}",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#D4AF37",
  "start_url": "/dashboard"
}`;

async function runCompiler() {
  if (!fs.existsSync(APPS_DIR)) return console.error('Apps directory not found');
  const apps = fs.readdirSync(APPS_DIR).filter(file => fs.statSync(path.join(APPS_DIR, file)).isDirectory());
  
  // Exclude the ones we already built
  const skipList = ['oksign', 'hive-taboo', 'hive-heritage', 'com-nav'];

  let count = 0;

  for (const app of apps) {
    if (skipList.includes(app)) continue;

    const appDir = path.join(APPS_DIR, app);
    const appDirApp = path.join(appDir, 'app');
    const appDirDashboard = path.join(appDirApp, 'dashboard');
    const appDirPublic = path.join(appDir, 'public');

    // Make dirs
    [appDir, appDirApp, appDirDashboard, appDirPublic].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // Formatting titles
    const isUd = app.startsWith('ud-');
    const rawKey = app.replace('ud-', '').replace('hive-', '').replace(/-/g, ' ');
    const domainKey = rawKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const title = isUd ? `UD ${domainKey}` : `Hive ${domainKey}`;

    // Write files
    fs.writeFileSync(path.join(appDir, 'package.json'), getPackageJson(app));
    fs.writeFileSync(path.join(appDir, 'next.config.js'), getNextConfig());
    fs.writeFileSync(path.join(appDirApp, 'globals.css'), getGlobalsCss());
    fs.writeFileSync(path.join(appDirApp, 'layout.tsx'), getLayout(title));
    fs.writeFileSync(path.join(appDirApp, 'page.tsx'), getLandingPage(title, domainKey));
    fs.writeFileSync(path.join(appDirDashboard, 'page.tsx'), getDashboardPage(title));
    fs.writeFileSync(path.join(appDirPublic, 'manifest.json'), getManifest(title));
    
    // Also add tsconfig if not exists
    if (!fs.existsSync(path.join(appDir, 'tsconfig.json'))) {
      fs.writeFileSync(path.join(appDir, 'tsconfig.json'), `{
        "compilerOptions": {
          "target": "es5", "lib": ["dom", "dom.iterable", "esnext"], "allowJs": true,
          "skipLibCheck": true, "strict": true, "noEmit": true, "esModuleInterop": true,
          "module": "esnext", "moduleResolution": "bundler", "resolveJsonModule": true,
          "isolatedModules": true, "jsx": "preserve", "incremental": true,
          "plugins": [{"name": "next"}], "paths": {"@/*": ["./*"]}
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        "exclude": ["node_modules"]
      }`);
    }

    count++;
  }

  console.log(`Successfully compiled Next.js UIs for ${count} engines.`);
}

runCompiler();
