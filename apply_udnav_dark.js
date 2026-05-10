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
      if (file.endsWith('UDNav.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('../universal-document/apps');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/background:\s*'#1e2d3d'/g, "background: 'var(--ud-paper)'");
  content = content.replace(/boxShadow:\s*'0 1px 0 rgba\(0,0,0,0\.25\)'/g, "borderBottom: '1px solid var(--ud-border)'");
  fs.writeFileSync(file, content);
}
console.log('Processed ' + files.length + ' UDNav.tsx files.');
