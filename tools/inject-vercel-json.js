const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const apps = fs.readdirSync(appsDir);

const vercelJsonContent = JSON.stringify({
  installCommand: "npm install --legacy-peer-deps"
}, null, 2);

apps.forEach(app => {
  const vercelJsonPath = path.join(appsDir, app, 'vercel.json');
  fs.writeFileSync(vercelJsonPath, vercelJsonContent);
  console.log(`[+] Added vercel.json to ${app}`);
});

console.log("vercel.json successfully injected into all apps.");
