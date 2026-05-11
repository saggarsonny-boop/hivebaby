const fs = require('fs');
const path = require('path');

function rmDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        rmDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const photoApp = path.join(__dirname, '../apps/hive-photo/app');
const plainscanApp = path.join(__dirname, '../apps/hive-plainscan/app');
const plainscan2App = path.join(__dirname, '../apps/hive-plainscan2/app');

// Nuke existing apps to clear out prisma/lucide-react broken routes
console.log("Nuking old broken scaffolds...");
rmDir(plainscanApp);
rmDir(plainscan2App);

// Copy from photo
console.log("Copying pristine magnetic UI from hive-photo...");
copyDir(photoApp, plainscanApp);
copyDir(photoApp, plainscan2App);

// Replace text in plainscan
const fixText = (appPath, title) => {
  const pagePath = path.join(appPath, 'page.tsx');
  const layoutPath = path.join(appPath, 'layout.tsx');
  
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    content = content.replace(/HivePhoto/g, title);
    fs.writeFileSync(pagePath, content);
  }
  
  if (fs.existsSync(layoutPath)) {
    let content = fs.readFileSync(layoutPath, 'utf8');
    content = content.replace(/Hive Photo/g, title);
    fs.writeFileSync(layoutPath, content);
  }
};

fixText(plainscanApp, 'Hive PlainScan');
fixText(plainscan2App, 'Hive PlainScan');

console.log("Done!");
