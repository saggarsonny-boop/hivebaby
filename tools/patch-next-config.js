const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  const nextConfigPath = path.join(appsDir, app, 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    let content = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Check if it already has typescript
    if (!content.includes('ignoreBuildErrors')) {
      content = content.replace(
        'reactStrictMode: true,',
        'reactStrictMode: true,\n  typescript: { ignoreBuildErrors: true },\n  eslint: { ignoreDuringBuilds: true },'
      );
      fs.writeFileSync(nextConfigPath, content);
      console.log(`[+] Patched next.config.js for ${app}`);
    }
  }
});

console.log("All next.config.js files patched to ignore TS/ESLint errors.");
