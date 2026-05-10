"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveMedMaster() {
  const [isPremium, setIsPremium] = useState(false);
  const [audience, setAudience] = useState("Medical Student (MS3)");
  const [voice, setVoice] = useState("OnlineMedEd Pacing (Default)");
  const [freeText, setFreeText] = useState("");
  const [loading, setLoading] = useState(false);

  // Simulated content generation based on state
  const getContent = () => {
    if (!isPremium) return "Sepsis is a life-threatening organ dysfunction caused by a dysregulated host response to infection...";
    
    if (audience === "Nursing Student") {
      return "Sepsis is an emergency. Your priorities: recognize the signs early (SIRS criteria, altered mental status), monitor vitals constantly, ensure IV access, and administer fluids and antibiotics as soon as the doctor orders them. Time is tissue.";
    }
    if (audience === "Paramedic") {
      return "En route: Suspect sepsis if the patient has a known infection, hypotension, and altered mentation. Oxygen, large-bore IVs, fluids wide open. Alert the ED for a sepsis workup upon arrival.";
    }
    if (audience === "My Dog") {
      return "Woof! The bad bugs got into the blood and now the body is very angry and confused. We need to go to the vet for water and special treats (antibiotics) right now or it's game over!";
    }
    if (freeText.toLowerCase().includes("tired resident")) {
      return "Look, it's 3 AM. If they have an infection, low BP, and altered mental status, it's sepsis. Pan-culture them, slam 30cc/kg of crystalloid, start broad-spectrum antibiotics within the hour, check lactate, and call the ICU if they don't respond. Don't overthink it right now, just stabilize.";
    }

    return "Sepsis is defined as life-threatening organ dysfunction caused by a dysregulated host response to infection (Sepsis-3). The core mechanism involves vasodilation, capillary leak, and microvascular thrombosis leading to inadequate tissue perfusion. Immediate management requires the 1-hour bundle: measure lactate, obtain blood cultures, administer broad-spectrum antibiotics, begin rapid administration of 30 mL/kg crystalloid for hypotension or lactate ≥4 mmol/L, and apply vasopressors if hypotensive during or after fluid resuscitation.";
  };

  const handleRewrite = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const handleCheckout = () => {
    setIsPremium(true);
    alert("Stripe Payment Successful! You've secured the Hive MedMaster Year 1 Rate: $3/year.");
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] text-[#111827] flex flex-col font-sans items-center pt-12">
      
      {/* Header */}
      <div className="max-w-4xl w-full px-6 mb-8 text-center animate-slide-in">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-3 flex items-center justify-center gap-3">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
           Hive MedMaster Engine
        </h1>
        <p className="text-slate-500 text-lg">The universal medical learning engine. Adaptive. Multilingual. Infinite levels.</p>

        {!isPremium && (
          <div className="mt-8 bg-white border-2 border-blue-500 rounded-3xl p-6 shadow-xl max-w-lg mx-auto transform transition hover:scale-105">
             <h2 className="text-2xl font-black text-slate-800">Year 1 Land-Grab Rate</h2>
             <p className="text-slate-600 mt-2 text-sm">Secure your access before the Year 2 pricing ($29/mo). Universal medical education for the price of a coffee.</p>
             <div className="text-5xl font-black text-blue-600 my-4">$3 <span className="text-lg text-slate-500 font-medium">/ year</span></div>
             <button onClick={handleCheckout} className="w-full font-bold text-white bg-blue-600 px-6 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                Unlock MedMaster Engine
             </button>
             <p className="text-xs text-slate-400 mt-3 text-center">Join 1.5M+ medical students, nurses, and clinicians globally.</p>
          </div>
        )}
      </div>

      {/* Engine Interface (Locked/Unlocked) */}
      <div className={`w-full max-w-4xl px-6 flex flex-col gap-6 flex-1 mb-12 transition-opacity duration-500 ${!isPremium ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
         
         {/* Controls Bar */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-4">
            
            <div className="flex-1">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audience Level</label>
               <select 
                  value={audience} 
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
               >
                  <option>Medical Student (MS3)</option>
                  <option>Nursing Student</option>
                  <option>Paramedic</option>
                  <option>Internal Medicine Resident</option>
                  <option>Global Health Worker (Rural)</option>
                  <option>My Dog</option>
               </select>
            </div>

            <div className="flex-1">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Voice</label>
               <select 
                  value={voice} 
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
               >
                  <option>OnlineMedEd Pacing (Default)</option>
                  <option>Calm Nurse Educator</option>
                  <option>High-Yield / Rapid Fire</option>
                  <option>Socratic Method</option>
               </select>
            </div>

            <div className="flex-1 flex items-end">
               <div className="w-full relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Free-Text Rewrite</label>
                  <form onSubmit={handleRewrite} className="relative">
                     <input 
                        type="text" 
                        value={freeText}
                        onChange={(e) => setFreeText(e.target.value)}
                        placeholder="e.g. 'Explain like a tired resident'" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
                     />
                     <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                     </button>
                  </form>
               </div>
            </div>

         </div>

         {/* Content Display */}
         <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[400px]">
            
            {/* Sidebar (Topic Graph) */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-6">
               <h3 className="font-bold text-slate-800 mb-4">Infectious Disease</h3>
               <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-blue-700 font-bold bg-blue-50/50 p-2 rounded-lg"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Sepsis Core</li>
                  <li className="flex items-center gap-2 text-slate-600 p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Pneumonia</li>
                  <li className="flex items-center gap-2 text-slate-600 p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Malaria / Tropical</li>
                  <li className="flex items-center gap-2 text-slate-600 p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> HIV/AIDS Basics</li>
               </ul>
            </div>

            {/* Main Lesson Area */}
            <div className="flex-1 p-8 md:p-12 relative">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-extrabold text-slate-900">Sepsis</h2>
                  <div className="flex gap-2">
                     <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold tracking-wide">{audience}</span>
                     {freeText && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold tracking-wide">Custom Style</span>}
                  </div>
               </div>

               {loading ? (
                  <div className="animate-pulse space-y-4">
                     <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                     <div className="h-4 bg-slate-200 rounded w-full"></div>
                     <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  </div>
               ) : (
                  <div className="prose prose-slate max-w-none">
                     <p className="text-lg text-slate-700 leading-relaxed">
                        {getContent()}
                     </p>
                  </div>
               )}

               {/* Modality Tabs */}
               <div className="absolute bottom-0 left-0 w-full border-t border-slate-100 bg-slate-50/50 px-8 py-4 flex gap-6 overflow-x-auto hide-scrollbar">
                  <button className="text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-1 shrink-0">Text Explanation</button>
                  <button className="text-sm font-medium text-slate-500 hover:text-slate-800 pb-1 shrink-0">Generate Diagram</button>
                  <button className="text-sm font-medium text-slate-500 hover:text-slate-800 pb-1 shrink-0">Flashcards</button>
                  <button className="text-sm font-medium text-slate-500 hover:text-slate-800 pb-1 shrink-0">Qbank (Test Me)</button>
               </div>
            </div>
         </div>

      </div>

      <HiveFooter />
    </main>
  );
}
