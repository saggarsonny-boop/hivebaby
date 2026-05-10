const fs = require('fs');
const path = require('path');

const write = (relPath, content) => {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
};

console.log("Scaffolding HiveSTRM Client...");

write('apps/hive-strm/app/page.tsx', `
"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveStrmClientV0() {
  const [feed] = useState([
    {
      id: 1,
      author: "@selena.strm",
      content: "The protocol is the host. We are the commensals. Building an ownerless social layer changes the physics of adoption forever.",
      timestamp: "2m ago",
      likes: 142,
      boosts: 28
    },
    {
      id: 2,
      author: "@archive.node",
      content: "Indexing all public HDF streams from the US Election. The metadata is so clean it's almost terrifying.",
      timestamp: "15m ago",
      likes: 89,
      boosts: 12
    },
    {
      id: 3,
      author: "@tom.dev",
      content: "Just deployed the V0 reference server for STRM. 25ms latency globally. The era of corporate-owned timelines is over.",
      timestamp: "1h ago",
      likes: 405,
      boosts: 102
    }
  ]);

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans">
       
       <nav className="w-full flex justify-between items-center z-20 sticky top-0 bg-[#F5F5F7]/80 backdrop-blur-md border-b border-[#E5E5EA] px-8 py-4">
         <div className="font-extrabold tracking-tighter text-xl flex items-center gap-2">
            <span className="text-blue-600 text-2xl">〰️</span> STRM
         </div>
         <div className="flex gap-6 text-sm font-semibold text-[#86868B]">
            <span className="text-[#1D1D1F] border-b-2 border-[#1D1D1F] pb-1">Global Stream</span>
            <span className="cursor-pointer hover:text-[#1D1D1F] transition-colors">Federated</span>
            <span className="cursor-pointer hover:text-[#1D1D1F] transition-colors">Mentions</span>
         </div>
         <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm shadow-sm hover:bg-blue-500 transition-colors">
            Post
         </button>
      </nav>

      <div className="flex-1 flex justify-center p-6 animate-fade-in w-full">
         
         <div className="w-full max-w-2xl flex flex-col gap-4">
            
            {/* Compose Box */}
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#E5E5EA] mb-4">
               <textarea 
                 placeholder="What's flowing?"
                 className="w-full h-24 outline-none resize-none text-lg placeholder-[#86868B]"
               />
               <div className="flex justify-between items-center mt-2 pt-4 border-t border-[#F5F5F7]">
                  <span className="text-xs text-[#86868B] uppercase tracking-widest font-bold">HDF Payload Ready</span>
                  <button className="bg-[#1D1D1F] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-black transition-colors">
                    Strm It
                  </button>
               </div>
            </div>

            {/* The Feed */}
            {feed.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#E5E5EA] flex gap-4 cursor-pointer hover:border-blue-200 transition-colors">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0"></div>
                 <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold">{post.author}</span>
                       <span className="text-sm text-[#86868B]">{post.timestamp}</span>
                    </div>
                    <p className="text-[#1D1D1F] leading-relaxed mb-4 text-[15px]">
                       {post.content}
                    </p>
                    <div className="flex gap-8 text-[#86868B] text-sm font-semibold">
                       <span className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                         💬 Reply
                       </span>
                       <span className="flex items-center gap-2 hover:text-green-500 transition-colors">
                         🔁 {post.boosts}
                       </span>
                       <span className="flex items-center gap-2 hover:text-red-500 transition-colors">
                         ❤️ {post.likes}
                       </span>
                    </div>
                 </div>
              </div>
            ))}

         </div>
      </div>

      <div className="mt-auto py-6 border-t border-[#E5E5EA]"><HiveFooter /></div>

      <style jsx global>{\`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      \`}</style>
    </main>
  );
}
`);
write('apps/hive-strm/app/layout.tsx', `
import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
`);

console.log("HiveSTRM Client scaffolded successfully.");
