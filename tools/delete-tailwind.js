const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  const postcssPath = path.join(appsDir, app, 'postcss.config.js');
  const tailwindPath = path.join(appsDir, app, 'tailwind.config.ts');
  const tailwindJsPath = path.join(appsDir, app, 'tailwind.config.js');
  
  if (fs.existsSync(postcssPath)) {
      fs.unlinkSync(postcssPath);
      console.log(`[+] Deleted postcss.config.js from ${app}`);
  }
  if (fs.existsSync(tailwindPath)) {
      fs.unlinkSync(tailwindPath);
      console.log(`[+] Deleted tailwind.config.ts from ${app}`);
  }
  if (fs.existsSync(tailwindJsPath)) {
      fs.unlinkSync(tailwindJsPath);
      console.log(`[+] Deleted tailwind.config.js from ${app}`);
  }
});

console.log("Tailwind config files deleted from all apps.");
