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
      if (file.endsWith('Footer.tsx') && (file.includes('HiveFooter.tsx') || file.includes('PhilanthropicFooter.tsx'))) {
        results.push(file);
      }
    }
  });
  return results;
}

const targetHtml = `        {" \\u00B7 "}
        <a href="https://converter.hive.baby" target="_blank" rel="noopener noreferrer" style={{ color: "#D4AF37" }}>
          Convert legacy PDFs to UDS
        </a>`;

const files = walk('./apps');
let modified = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes('Convert legacy PDFs to UDS')) continue;
  
  if (content.includes('privacy\n        </a>\n      </p>')) {
    content = content.replace('privacy\n        </a>\n      </p>', 'privacy\n        </a>\n' + targetHtml + '\n      </p>');
    fs.writeFileSync(file, content);
    modified++;
  }
}
console.log('Modified ' + modified + ' files.');
