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
      if (file.endsWith('layout.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./apps').concat(walk('../universal-document/apps'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Single line
  content = content.replace(/[\ \t]*icons:\s*\{\s*icon:\s*'\/favicon\.svg'\s*\},\r?\n/g, '');
  
  // Hivebaby block
  content = content.replace(/[\ \t]*icons:\s*\{[\s\S]*?shortcut:\s*\[['"]\/favicon\.ico['"]\](?:,)?[ \t]*\r?\n[\ \t]*\},?\r?\n/g, '');

  fs.writeFileSync(file, content);
}
console.log('Processed ' + files.length + ' layout.tsx files.');
