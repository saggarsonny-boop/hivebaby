const fs = require('fs');

const content = `
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import HiveFooter from "@/components/HiveFooter";

export default async function HivePicturesLanding() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-white text-[#243b53] flex flex-col items-center justify-center p-6 font-sans">
      <div className="z-10 text-center max-w-4xl w-full">
        <h1 className="text-5xl font-black tracking-tight mb-4 font-serif text-[#1e2d3d]">
          HivePictures
        </h1>
        <p className="text-xl text-[#64748b] mb-12 font-light tracking-wide">
          The visual memory substrate of the Hive. Free-text driven photo intelligence.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-16 text-left">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Free</h3>
            <p className="text-3xl font-black text-[#D4AF37] mb-4">$0</p>
            <ul className="text-sm text-gray-600 mb-6 flex-grow space-y-2">
              <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Drag-and-drop ingestion</span></li>
              <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Voice-to-upload</span></li>
              <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Free-text search engine</span></li>
              <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Auto-dedupe logic</span></li>
            </ul>
            <Link href="/" className="w-full py-3 rounded-lg font-bold transition-all border border-gray-300 text-gray-700 hover:bg-gray-50 text-center block">Drop Photos Here</Link>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#D4AF37] shadow-lg flex flex-col relative">
            <div className="absolute -top-3 right-4 bg-[#D4AF37] text-white text-xs font-bold px-3 py-1 rounded-full">Eternity Tree Ready</div>
            <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Premium</h3>
            <p className="text-3xl font-black text-[#D4AF37] mb-4">$5<span className="text-sm font-normal text-gray-500">/year</span></p>
            <ul className="text-sm text-gray-600 mb-6 flex-grow space-y-2">
              <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Unlimited storage</span></li>
              <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>HD/4K uploads</span></li>
              <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Emotional clustering</span></li>
              <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Timeline mode</span></li>
              <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Cancel anytime</span></li>
            </ul>
            <Link href="/" className="w-full py-3 rounded-lg font-bold transition-all bg-[#D4AF37] text-[#1e2d3d] hover:bg-[#b08d2b] text-center block">Upgrade to Premium</Link>
          </div>
        </div>

        <div className="max-w-xl mx-auto bg-gray-50 p-6 rounded-xl border border-gray-100 mb-12">
           <h4 className="font-bold text-gray-800 mb-2">Try Free-Text Intelligence</h4>
           <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-inner">
              <input type="text" placeholder="Show me all photos of my daughter smiling in 2018..." className="flex-grow p-4 outline-none text-gray-700 bg-transparent" disabled />
              <button className="bg-[#1e2d3d] text-white px-6 font-bold" disabled>Search</button>
           </div>
        </div>

      </div>
    </main>
  );
}
`;
fs.writeFileSync('apps/hive-photo/app/page.tsx', content.trim(), 'utf8');

// Update layout
let layout = fs.readFileSync('apps/hive-photo/app/layout.tsx', 'utf8');
layout = layout.replace('HivePhoto Engine', 'HivePictures');
layout = layout.replace('Secure, AI-powered photo management and analysis.', 'The visual memory substrate of the Hive. Free-text driven photo intelligence.');
fs.writeFileSync('apps/hive-photo/app/layout.tsx', layout, 'utf8');

console.log('HivePictures landing updated.');
