const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');

if (!fs.existsSync(appsDir)) {
  console.error("No apps directory found");
  process.exit(1);
}

const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  const appPath = path.join(appsDir, app);
  const pkgPath = path.join(appPath, 'package.json');
  const nextConfigPath = path.join(appPath, 'next.config.js');
  
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.dependencies && !pkg.dependencies['@hive/telemetry']) {
        pkg.dependencies['@hive/telemetry'] = "file:../../packages/hive-telemetry";
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        console.log(`[+] Added telemetry dependency to ${app}`);
      }
    } catch (e) {
      console.error(`Failed to parse ${pkgPath}`);
    }
  }

  if (fs.existsSync(nextConfigPath)) {
    let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    if (!nextConfig.includes('transpilePackages')) {
      if (nextConfig.includes('const nextConfig = {')) {
        nextConfig = nextConfig.replace(
          'const nextConfig = {',
          "const nextConfig = {\n  transpilePackages: ['@hive/telemetry'],"
        );
        fs.writeFileSync(nextConfigPath, nextConfig);
        console.log(`[+] Added transpilePackages to ${app}`);
      }
    }
  }
});

console.log("Telemetry injection complete!");
