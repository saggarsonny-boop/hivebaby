const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const apps = fs.readdirSync(appsDir);

apps.forEach(app => {
  if (app === 'hive-plainscan' || app === 'hive-plainscan2') return;

  const plainscanDir = path.join(appsDir, app, 'app', 'plainscan');
  if (fs.existsSync(plainscanDir)) {
    fs.rmdirSync(plainscanDir, { recursive: true });
    console.log(`[+] Deleted broken plainscan scaffold from ${app}`);
  }
});

// Fix syntax error in plainscan2
const pagePath = path.join(appsDir, 'hive-plainscan2', 'app', 'plainscan', 'page.tsx');
if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    content = content.replace("import type {\r\nimport PhilanthropicFooter", "import type {\n  ExplainPayload");
    content = content.replace("import type {\nimport PhilanthropicFooter", "import type {\n  ExplainPayload");
    fs.writeFileSync(pagePath, content);
}
const pagePath1 = path.join(appsDir, 'hive-plainscan', 'app', 'plainscan', 'page.tsx');
if (fs.existsSync(pagePath1)) {
    let content = fs.readFileSync(pagePath1, 'utf8');
    content = content.replace("import type {\r\nimport PhilanthropicFooter", "import type {\n  ExplainPayload");
    content = content.replace("import type {\nimport PhilanthropicFooter", "import type {\n  ExplainPayload");
    fs.writeFileSync(pagePath1, content);
}

console.log("Broken syntax errors obliterated.");
