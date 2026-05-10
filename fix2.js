const fs = require('fs');
const targets = ["ud-legal", "ud-compliance"];

for (const t of targets) {
    const pagePath = `apps/${t}/app/plainscan/page.tsx`;
    if (fs.existsSync(pagePath)) {
        let content = fs.readFileSync(pagePath, 'utf8');
        content = content.replace('import PhilanthropicFooter from "@/components/PhilanthropicFooter";`nimport type {`n  ExplainPayload,', 'import PhilanthropicFooter from "@/components/PhilanthropicFooter";\nimport type {\n  ExplainPayload,');
        fs.writeFileSync(pagePath, content);
    }
}
console.log("Fixed newlines");
