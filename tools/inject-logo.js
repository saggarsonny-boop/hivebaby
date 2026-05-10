const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const sourceLogo = path.join(__dirname, '..', 'assets', 'logo_master.png');

if (!fs.existsSync(appsDir)) {
  console.error("No apps directory found");
  process.exit(1);
}

const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  const appPath = path.join(appsDir, app);
  const publicDir = path.join(appPath, 'public');
  
  if (fs.statSync(appPath).isDirectory()) {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.copyFileSync(sourceLogo, path.join(publicDir, 'logo.png'));
    console.log(`[+] Injected Master Logo into ${app}`);
  }
});

console.log("Hivewide Logo Injection Complete!");
