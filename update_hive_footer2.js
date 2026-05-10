const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('HiveFooter.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('apps');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  const oldStr = /\{\"\s*\\u00B7\s*\"\}\s*<a\s*href=\"https:\/\/converter\.hive\.baby\"[^>]*>\s*Convert legacy PDFs to UDS\s*<\/a>/g;
  
  const newStr = '{" \\\\u00B7 "}\n        <a href="https://converter.hive.baby" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#D4AF37", opacity: 0.85, textDecoration: "none", verticalAlign: "middle" }}>\n          <img src="/ud-logo-micro.png" width="14" height="14" alt="UD" style={{ borderRadius: "3px" }} />\n          Try UD Converter — Free ?\n        </a>';
        
  content = content.replace(oldStr, newStr);
  fs.writeFileSync(file, content);
}
console.log('Processed ' + files.length + ' HiveFooter.tsx files.');
