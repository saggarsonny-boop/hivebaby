const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const middlewareTemplate = `export { queenBeeMiddleware as middleware } from '@hive/auth/middleware';\n\nexport const config = {\n  matcher: [\n    '/((?!_next/static|_next/image|favicon.ico).*)',\n  ],\n};\n`;

if (!fs.existsSync(appsDir)) {
  console.error("No apps directory found");
  process.exit(1);
}

const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  const appPath = path.join(appsDir, app);
  const pkgPath = path.join(appPath, 'package.json');
  const middlewarePath = path.join(appPath, 'middleware.ts');
  const nextConfigPath = path.join(appPath, 'next.config.js');
  
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      let modified = false;
      if (pkg.dependencies) {
        if (!pkg.dependencies['@hive/auth']) {
          pkg.dependencies['@hive/auth'] = "file:../../packages/hive-auth";
          modified = true;
        }
        if (!pkg.dependencies['@hive/parser']) {
          pkg.dependencies['@hive/parser'] = "file:../../packages/hive-parser";
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        console.log(`[+] Added Hiveware dependencies to ${app}`);
      }
    } catch (e) {
      console.error(`Failed to parse ${pkgPath}`);
    }
  }

  if (fs.existsSync(nextConfigPath)) {
    let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    if (!nextConfig.includes('@hive/auth')) {
      nextConfig = nextConfig.replace(
        "transpilePackages: ['@hive/telemetry']",
        "transpilePackages: ['@hive/telemetry', '@hive/auth', '@hive/parser']"
      );
      fs.writeFileSync(nextConfigPath, nextConfig);
      console.log(`[+] Added transpilePackages for Hiveware to ${app}`);
    }
  }

  // Inject Queen Bee Middleware
  if (!fs.existsSync(middlewarePath) && fs.existsSync(path.join(appPath, 'next.config.js'))) {
    fs.writeFileSync(middlewarePath, middlewareTemplate);
    console.log(`[+] Injected Queen Bee Middleware into ${app}`);
  }
});

console.log("Hiveware Mass Upgrade complete!");
