const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  const packageJsonPath = path.join(appsDir, app, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies['openai'] = '^4.20.1';
    pkg.dependencies['zod'] = '^3.22.4';
    pkg.dependencies['lucide-react'] = '^0.292.0';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
    console.log(`[+] Added deps to ${app}`);
  }
});

console.log("All dependencies forcefully injected into individual package.jsons!");
