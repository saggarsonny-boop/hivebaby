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
      if (file.endsWith('globals.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('../universal-document/apps');

for (const file of files) {
  if (file.includes('landing')) continue; // already processed
  let css = fs.readFileSync(file, 'utf-8');
  
  // Replace color variables
  css = css.replace(/--ud-ink:\s*#1e2d3d;/g, '--ud-ink:      #ffffff;');
  css = css.replace(/--ud-ink-2:\s*#2d4060;/g, '--ud-ink-2:    #e0e0e0;');
  css = css.replace(/--ud-paper:\s*#fafaf8;/g, '--ud-paper:    #0a0b0d;');
  css = css.replace(/--ud-paper-2:\s*#f2f1ee;/g, '--ud-paper-2:  #121418;');
  css = css.replace(/--ud-paper-3:\s*#e8e6e0;/g, '--ud-paper-3:  #1a1d24;');
  css = css.replace(/--ud-gold-3:\s*#fff3cc;/g, '--ud-gold-3:   rgba(212, 175, 55, 0.1);');
  css = css.replace(/--ud-teal:\s*#0a7a6a;/g, '--ud-teal:     #00ffcc;');
  css = css.replace(/--ud-teal-2:\s*#e0f5f0;/g, '--ud-teal-2:   rgba(0, 255, 204, 0.1);');
  css = css.replace(/--ud-border:\s*#e0ddd6;/g, '--ud-border:   #2a2d36;');
  css = css.replace(/--ud-border-2:\s*#d0cdc6;/g, '--ud-border-2: #1e2026;');
  css = css.replace(/--ud-shadow:\s*0 1px 3px rgba\(0,0,0,0\.06\);/g, '--ud-shadow:    0 4px 20px rgba(0, 0, 0, 0.4);');

  fs.writeFileSync(file, css);
}
console.log('Processed ' + files.length + ' globals.css files.');
