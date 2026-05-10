const fs = require('fs');
const path = require('path');

const APPS_DIR = path.join(__dirname, 'apps');

const CATEGORY_COLORS = {
    0: { name: 'Gold', hex: '#F5B400' },
    1: { name: 'Green-Teal', hex: '#00BFA5' },
    2: { name: 'Electric Blue', hex: '#1E90FF' },
    3: { name: 'Crimson', hex: '#E10600' },
    4: { name: 'Violet', hex: '#8A2BE2' },
    5: { name: 'Emerald', hex: '#00C853' },
    6: { name: 'Orange', hex: '#FF6A00' },
    7: { name: 'Sky Cyan', hex: '#00CFFF' },
    8: { name: 'Magenta', hex: '#FF2DA6' },
    9: { name: 'Silver', hex: '#C0C6CF' }
};

// Determines Category Digit and Prefix for an App Name
function getEngineMetadata(appName, index) {
    let prefix = '';
    let categoryDigit = 0;

    if (appName.startsWith('ud-')) {
        categoryDigit = 9; // Utility / Domain for all Universal Document tools
        const parts = appName.split('-');
        if (parts.length > 1) {
            // E.g., ud-reader -> UDR, ud-receipt -> URC, ud-medical -> UMD
            prefix = 'U' + parts[1].replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
            if (prefix.length < 3) prefix = prefix.padEnd(3, 'X');
        } else {
            prefix = 'UDX';
        }
    } else if (appName.startsWith('hive-')) {
        // e.g., hive-taboo, hive-puberty
        categoryDigit = 8; // Creative / Experience for emotional logic / education
        const parts = appName.split('-');
        if (parts.length > 1) {
            prefix = 'H' + parts[1].replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
            if (prefix.length < 3) prefix = prefix.padEnd(3, 'X');
        } else {
            prefix = 'HVE';
        }
    } else {
        // Catch-all
        categoryDigit = 0; 
        prefix = appName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
        if (prefix.length < 3) prefix = prefix.padEnd(3, 'X');
    }

    const sequence = String(index % 10).padStart(2, '0');
    return { prefix, categoryDigit, sequence, color: CATEGORY_COLORS[categoryDigit].hex };
}

// SVG Generator
function generateHexagonSVG(prefix, categoryDigit, sequence, colorHex, origin = 'H') {
    // 512x512 SVG Canvas
    const badgeColor = origin === 'H' ? '#F5B400' : '#4A6FA5';

    // Hexagon points for a pointy-topped hexagon in a 512x512 box (with some padding)
    // R = 240, Center = 256, 256
    // Width = sqrt(3) * 240, Height = 480
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" fill="#0D0D0D" />
  
  <!-- Hexagon Frame -->
  <!-- Points for flat-topped hexagon -->
  <polygon points="128,40 384,40 512,256 384,472 128,472 0,256" 
           fill="#111111" 
           stroke="${colorHex}" 
           stroke-width="32" 
           stroke-linejoin="round"
           filter="url(#glow)" />
           
  <!-- Prefix Text (AAA) -->
  <text x="256" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="140" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="4">
    ${prefix}
  </text>
  
  <!-- Number Text (TN) -->
  <text x="256" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="70" font-weight="600" text-anchor="middle" fill="#FFFFFF" letter-spacing="8">
    ${categoryDigit}${sequence}
  </text>
  
  <!-- Origin Badge Background -->
  <rect x="400" y="40" width="72" height="72" rx="16" fill="${badgeColor}" />
  
  <!-- Origin Badge Text -->
  <text x="436" y="92" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="45" font-weight="900" text-anchor="middle" fill="#FFFFFF">
    ${origin}
  </text>
</svg>`;
}

async function run() {
    if (!fs.existsSync(APPS_DIR)) {
        console.error('Apps directory not found:', APPS_DIR);
        return;
    }

    const apps = fs.readdirSync(APPS_DIR).filter(file => fs.statSync(path.join(APPS_DIR, file)).isDirectory());
    console.log(`Found ${apps.length} engines. Commencing mass icon injection...`);

    let generatedCount = 0;

    apps.forEach((app, index) => {
        const appDir = path.join(APPS_DIR, app, 'app');
        if (!fs.existsSync(appDir)) {
            return; // Skip if no app dir
        }

        const meta = getEngineMetadata(app, index);
        const svgContent = generateHexagonSVG(meta.prefix, meta.categoryDigit, meta.sequence, meta.color);

        // Next.js uses icon.svg or icon.png in the app directory for App Router
        // Write icon.svg
        const iconPath = path.join(appDir, 'icon.svg');
        fs.writeFileSync(iconPath, svgContent, 'utf8');

        // Optional: Remove default favicon.ico to ensure Next.js uses our SVG icon
        const faviconPath = path.join(appDir, 'favicon.ico');
        if (fs.existsSync(faviconPath)) {
            fs.unlinkSync(faviconPath);
        }

        generatedCount++;
    });

    console.log(`Successfully generated and injected official iconographs into ${generatedCount} engines.`);
}

run();
