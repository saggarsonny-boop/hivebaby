const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');

const apps = fs.readdirSync(appsDir);
apps.forEach(app => {
  const packageJsonPath = path.join(appsDir, app, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (pkg.name !== app) {
      pkg.name = app;
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
      console.log(`[+] Fixed package.json name for ${app}`);
    }
  }
});
console.log("Workspace conflicts resolved!");
