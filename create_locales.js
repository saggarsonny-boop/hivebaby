const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync(path.join(__dirname, 'apps/hive-plainscan/locales/en.json'), 'utf8'));

// Very basic fallback stubbing so the structure is identical, but replacing strings. 
// A full translation API isn't strictly required since we are setting the architectural baseline.
// I will append the language code to the English string so the UI can verify i18n works.
// For example, "engine.name" -> "[es] HivePlainScan"

const langs = ['es', 'fr', 'pt', 'zh', 'ar', 'hi'];

function translateStub(obj, lang) {
  const result = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = translateStub(obj[key], lang);
    } else if (typeof obj[key] === 'string') {
      result[key] = `[${lang}] ${obj[key]}`;
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

for (const lang of langs) {
  const tr = translateStub(en, lang);
  fs.writeFileSync(
    path.join(__dirname, `apps/hive-plainscan/locales/${lang}.json`),
    JSON.stringify(tr, null, 2)
  );
}
console.log("Created locales:", langs);
