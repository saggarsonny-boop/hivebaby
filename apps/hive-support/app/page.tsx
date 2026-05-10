"use client";
import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveSupportV0() {
  const [view, setView] = useState<'inbox' | 'flagged' | 'settings'>('inbox');

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#E2E8F0] p-6 flex flex-col">
         <div className="font-bold text-xl mb-8 text-[#334155]">Support Engine</div>
         <nav className="flex flex-col gap-2">
            <button onClick={() => setView('inbox')} className={`text-left px-4 py-2 rounded-lg font-bold text-sm ${view === 'inbox' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
              Inbox <span className="float-right bg-[#DBEAFE] px-2 py-0.5 rounded-full text-xs">12</span>
            </button>
            <button onClick={() => setView('flagged')} className={`text-left px-4 py-2 rounded-lg font-bold text-sm ${view === 'flagged' ? 'bg-[#FEF2F2] text-[#DC2626]' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
              Needs Review <span className="float-right bg-[#FEE2E2] px-2 py-0.5 rounded-full text-xs">3</span>
            </button>
            <button onClick={() => setView('settings')} className={`text-left px-4 py-2 rounded-lg font-bold text-sm ${view === 'settings' ? 'bg-[#F1F5F9] text-[#334155]' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
              Settings
            </button>
         </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-8">
         {view === 'inbox' && (
           <div className="animate-fade-in w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-6">Recent Interactions</h2>
              <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                 {/* Item 1 */}
                 <div className="p-4 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-sm">sara@example.com</span>
                       <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] bg-[#D1FAE5] px-2 py-1 rounded">Auto-Resolved</span>
                    </div>
                    <div className="text-sm text-[#64748B] mb-2 truncate">"How do I change my password?"</div>
                    <div className="text-xs text-[#94A3B8]">Intent: Confusion • Tone: Neutral • Action: Sent Doc Link</div>
                 </div>
                 {/* Item 2 */}
                 <div className="p-4 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-sm">mark@example.com</span>
                       <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] bg-[#DBEAFE] px-2 py-1 rounded">Draft Ready</span>
                    </div>
                    <div className="text-sm text-[#64748B] mb-2 truncate">"I loved using this tool yesterday."</div>
                    <div className="text-xs text-[#94A3B8]">Intent: Praise • Tone: Warm • Action: Queued for Send</div>
                 </div>
              </div>
           </div>
         )}

         {view === 'flagged' && (
           <div className="animate-fade-in w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-6 text-[#DC2626]">Requires Your Review</h2>
              <div className="bg-white rounded-xl shadow-sm border border-[#FCA5A5] p-6 mb-4">
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">angry.customer@example.com</span>
                    <span className="text-xs font-bold text-[#DC2626] uppercase tracking-widest">Flag: Legal Threat</span>
                 </div>
                 <div className="bg-[#FEF2F2] p-4 rounded-lg text-sm text-[#991B1B] mb-4">
                    "If you don't refund me for the last 6 months immediately, I am contacting my lawyer."
                 </div>
                 <div className="border-t border-[#E2E8F0] pt-4 flex justify-end gap-3">
                    <button className="px-4 py-2 text-sm font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg">Ignore</button>
                    <button className="px-4 py-2 text-sm font-bold bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C]">Draft Custom Reply</button>
                 </div>
              </div>
           </div>
         )}

         {view === 'settings' && (
           <div className="animate-fade-in w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-6">Engine Logic</h2>
              <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
                 <h3 className="font-bold mb-4">Auto-Send Configuration (Option B)</h3>
                 <label className="flex items-center gap-3 mb-6">
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-[#2563EB]" />
                    <span className="text-sm text-[#475569]">Automatically send safe replies on my behalf</span>
                 </label>

                 <h3 className="font-bold mb-4 border-t border-[#E2E8F0] pt-6">Flagging Rules</h3>
                 <div className="flex gap-2 flex-wrap">
                    <span className="bg-[#F1F5F9] text-[#475569] text-xs font-bold px-3 py-1.5 rounded-full">Legal Threats ✕</span>
                    <span className="bg-[#F1F5F9] text-[#475569] text-xs font-bold px-3 py-1.5 rounded-full">Medical Claims ✕</span>
                    <span className="bg-[#F1F5F9] text-[#475569] text-xs font-bold px-3 py-1.5 rounded-full">Abuse ✕</span>
                    <span className="bg-[#DBEAFE] text-[#2563EB] text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer">+ Add Rule</span>
                 </div>
              </div>
           </div>
         )}
      </div>

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}