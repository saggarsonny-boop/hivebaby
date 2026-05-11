const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  const packageJsonPath = path.join(appsDir, app, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (pkg.dependencies && pkg.dependencies['lucide-react']) {
        delete pkg.dependencies['lucide-react'];
        fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
        console.log(`[+] Removed lucide-react from ${app}`);
    }
  }
});

// Also remove from root package.json
const rootPkgPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(rootPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
    if (pkg.dependencies && pkg.dependencies['lucide-react']) {
        delete pkg.dependencies['lucide-react'];
        fs.writeFileSync(rootPkgPath, JSON.stringify(pkg, null, 2));
        console.log(`[+] Removed lucide-react from root package.json`);
    }
}

console.log("lucide-react entirely eradicated.");
