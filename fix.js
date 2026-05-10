const fs = require('fs');
const targets = ["ud-legal", "ud-audit", "ud-compliance", "ud-api"];

for (const t of targets) {
    const dashPath = `apps/${t}/app/dashboard/page.tsx`;
    if (fs.existsSync(dashPath)) {
        let dashContent = fs.readFileSync(dashPath, 'utf8');
        dashContent = dashContent.replace(/\\\`/g, '\`');
        dashContent = dashContent.replace(/\\\$/g, '$');
        fs.writeFileSync(dashPath, dashContent);
    }

    const pkgPath = `apps/${t}/package.json`;
    if (fs.existsSync(pkgPath)) {
        let pkgContent = fs.readFileSync(pkgPath, 'utf8');
        pkgContent = pkgContent.replace(
            '"stripe": "^15.5.0"',
            '"stripe": "^15.5.0",\n    "@anthropic-ai/sdk": "^0.20.1",\n    "mammoth": "^1.8.0",\n    "@neondatabase/serverless": "^0.9.0",\n    "pdf-parse": "^1.1.1"'
        );
        fs.writeFileSync(pkgPath, pkgContent);
    }
}
console.log("Fixed syntax and dependencies.");
