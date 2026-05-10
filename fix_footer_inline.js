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
const fixedFooter = fs.readFileSync('HiveFooterTemplateInline.txt', 'utf-8');

for (const file of files) {
  fs.writeFileSync(file, fixedFooter);
}
console.log('Fixed ' + files.length + ' HiveFooter.tsx files using inline styles template.');
