const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  const packageJsonPath = path.join(appsDir, app, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies['@anthropic-ai/sdk'] = '^0.32.1';
    pkg.dependencies['@neondatabase/serverless'] = '^0.9.0';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
    console.log(`[+] Added missing anthropic/neon deps to ${app}`);
  }
});

console.log("All dependencies forcefully injected into individual package.jsons!");
