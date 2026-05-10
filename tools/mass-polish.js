const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');

const globalCssTemplate = `body {
  color: #f8fafc;
  background: #020617;
  font-family: 'Inter', sans-serif;
  margin: 0;
}

.hive-watermark {
  background-image: url('/logo.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.05;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
`;

const footerHtml = `
        <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.875rem', position: 'relative', zIndex: 10, marginTop: 'auto' }}>
          Made with ❤️ by <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>the Hive</span>
        </footer>`;

function processApp(appName) {
  const appPath = path.join(appsDir, appName, 'app');
  if (!fs.existsSync(appPath)) return;

  // 1. Inject Global CSS
  const cssPath = path.join(appPath, 'globals.css');
  fs.writeFileSync(cssPath, globalCssTemplate);

  // 2. Inject Footer into layout.tsx
  const layoutPath = path.join(appPath, 'layout.tsx');
  if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Add import for globals.css if not present
    if (!layoutContent.includes("import './globals.css';")) {
      layoutContent = `import './globals.css';\n` + layoutContent;
    }

    // Check if body tag exists to inject footer
    if (layoutContent.includes('</body>') && !layoutContent.includes('Made with ❤️ by')) {
      layoutContent = layoutContent.replace(
        '</body>',
        `${footerHtml}\n      </body>`
      );
      fs.writeFileSync(layoutPath, layoutContent);
      console.log(`[+] Polished layout for ${appName}`);
    }
  }
}

const apps = fs.readdirSync(appsDir);
apps.forEach(app => {
  if (fs.statSync(path.join(appsDir, app)).isDirectory()) {
    processApp(app);
  }
});

console.log("Mass Polish Complete!");
