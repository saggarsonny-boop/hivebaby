const fs = require('fs');
const path = require('path');

const ENGINES = [
  'hive-plainscan',
  'hive-body-log',
  'hive-photo',
  'hive-confession',
  'hive-aestheticbestie'
];

const ROOT_DIR = path.join(__dirname, 'apps');

ENGINES.forEach(engine => {
  const engineDir = path.join(ROOT_DIR, engine);
  if (!fs.existsSync(engineDir)) {
    console.warn(`[WARN] Engine ${engine} not found. Skipping.`);
    return;
  }

  // 1. Inject dependency into package.json
  const pkgPath = path.join(engineDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies['@hive/amplifiers'] = 'file:../../packages/hive-amplifiers';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`[OK] Injected @hive/amplifiers into ${engine}/package.json`);
  }

  // 2. Inject <FloatingCompanion /> into app/layout.tsx
  const layoutPath = path.join(engineDir, 'app', 'layout.tsx');
  if (fs.existsSync(layoutPath)) {
    let layout = fs.readFileSync(layoutPath, 'utf8');
    
    // Check if already injected
    if (!layout.includes('FloatingCompanion')) {
      // Import
      if (layout.includes('import HiveOpsWidget')) {
        layout = layout.replace(
          "import HiveOpsWidget from '@/components/HiveOpsWidget';",
          "import HiveOpsWidget from '@/components/HiveOpsWidget';\nimport { FloatingCompanion } from '@hive/amplifiers';"
        );
      } else {
        layout = `import { FloatingCompanion } from '@hive/amplifiers';\n` + layout;
      }

      // Render Component before </body>
      layout = layout.replace(
        "</body>",
        `  <FloatingCompanion engineName="${engine}" />\n      </body>`
      );

      fs.writeFileSync(layoutPath, layout);
      console.log(`[OK] Injected <FloatingCompanion /> into ${engine}/app/layout.tsx`);
    } else {
      console.log(`[SKIP] <FloatingCompanion /> already exists in ${engine}/app/layout.tsx`);
    }
  } else {
    console.warn(`[WARN] No layout.tsx found for ${engine}.`);
  }
});

console.log("\n[SUCCESS] Batch injection script complete. Please run 'npm install' to link dependencies.");
