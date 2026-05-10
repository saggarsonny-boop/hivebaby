const fs = require('fs');

const engines = [
  { name: 'hive-contract', disclaimer: 'This tool does not constitute legal advice. Always consult an attorney.' },
  { name: 'hive-compliance', disclaimer: 'This tool is for preliminary gap analysis only and does not replace a certified auditor.' },
  { name: 'hive-queenbee-api', disclaimer: 'Standard B2B API terms apply.' },
  { name: 'hive-clinical', disclaimer: 'This is not medical advice. Always consult a qualified clinician.' }
];

engines.forEach(eng => {
  const layout = `apps/${eng.name}/app/layout.tsx`;
  if (fs.existsSync(layout)) {
    let content = fs.readFileSync(layout, 'utf8');
    content = content.replace('This is not medical advice. Always consult a qualified clinician.', eng.disclaimer);
    fs.writeFileSync(layout, content, 'utf8');
  }

  const page = `apps/${eng.name}/app/page.tsx`;
  if (fs.existsSync(page)) {
    let content = fs.readFileSync(page, 'utf8');
    content = content.split('<div className="mt-24 w-full">\n        <HiveFooter />\n      </div>').join('');
    content = content.split('import HiveFooter from "@/components/HiveFooter";').join('');
    fs.writeFileSync(page, content, 'utf8');
  }
});
console.log('Fixed layouts and pages.');
