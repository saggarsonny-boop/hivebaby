const fs = require('fs');
const path = require('path');

const pageContent = `
"use client";

import React, { useState, useEffect } from 'react';
import HiveFooter from "@/components/HiveFooter";

const CORE_PERSONAS = ['jesus', 'aurelius', 'buddha', 'sherlock', 'navy seal', 'marcus aurelius', 'therapist', 'ceo', 'monk', 'strategist'];
const ROTATING_EXAMPLES = [
  "What would Jesus do?",
  "What would Marcus Aurelius do?",
  "What would Musashi do?",
  "What would a Navy SEAL do?",
  "What would Sherlock Holmes deduce?",
  "What would Buddha advise?",
  "What would Captain Picard decide?",
  "What would a Therapist say?",
  "What would a CEO do?"
];

export default function WWXDEngineV0() {
  const [situation, setSituation] = useState('');
  const [persona, setPersona] = useState('');
  const [view, setView] = useState('input'); // 'input', 'output'
  const [output, setOutput] = useState<any>(null);
  
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % ROTATING_EXAMPLES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAsk = () => {
    if (!situation.trim() || !persona.trim()) return;
    
    const p = persona.toLowerCase().trim();
    const isCore = CORE_PERSONAS.includes(p) || p.includes('jesus') || p.includes('sherlock') || p.includes('buddha');
    
    if (isCore) {
      setOutput({
        isLite: false,
        name: persona,
        lens: "Focus only on what is within your control, and discard anxiety about the rest.",
        perspective: "The obstacle you face is not an impediment to your action, but the very material for it. The situation itself is neutral; your judgment makes it difficult.",
        actions: [
          "Separate what you can control (your response) from what you cannot (the outcome).",
          "Accept the reality of the situation without wishing it were different.",
          "Take the next logical step grounded in virtue, not emotion."
        ],
        emotional: "Calm, detached, yet fully present and purposeful.",
        strategic: "Treat this not as a crisis, but as an opportunity to practice resilience.",
        koan: "The impediment to action advances action. What stands in the way becomes the way."
      });
    } else {
      setOutput({
        isLite: true,
        name: persona,
        lens: "Simplify the situation and act decisively.",
        actions: [
          "Focus on the essential.",
          "Cut away what is unnecessary."
        ]
      });
    }
    
    setView('output');
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans relative">
      
      {/* Header / Nav */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
         <div className="font-serif text-xl tracking-widest uppercase">WWXD</div>
         <button className="text-gray-400 text-sm hover:text-white transition-colors border border-gray-800 px-4 py-2 rounded-full flex items-center gap-2">
            Council Mode <span className="bg-gray-800 text-xs px-2 py-0.5 rounded text-gray-300">Premium</span>
         </button>
      </div>

      <div className="z-10 text-center max-w-2xl w-full mt-20 mb-auto">
        {view === 'input' ? (
          <div className="animate-fade-in flex flex-col items-center w-full">
            <h1 className="text-5xl font-serif text-white tracking-wide mb-4 opacity-90">What Would They Do?</h1>
            <p className="text-gray-400 mb-12 font-light text-lg">Identity-based decision clarity.</p>

            <div className="w-full relative mb-6">
              <input 
                type="text"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="Name a persona (e.g., Marcus Aurelius, a CEO)"
                className="w-full bg-gray-900 border border-gray-800 text-white px-6 py-4 rounded-xl outline-none placeholder-gray-600 focus:border-gray-500 transition-colors font-serif text-xl text-center"
              />
            </div>
            
            <div className="w-full relative">
              <textarea 
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder={ROTATING_EXAMPLES[placeholderIdx]}
                className="w-full h-48 bg-gray-900 border border-gray-800 text-white p-6 rounded-2xl outline-none resize-none placeholder-gray-600 focus:border-gray-500 transition-colors font-serif text-lg leading-relaxed"
              />
            </div>

            <button 
              onClick={handleAsk}
              disabled={!situation.trim() || !persona.trim()}
              className="mt-8 bg-white text-black px-12 py-4 rounded-full font-bold tracking-wide uppercase text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Seek Counsel
            </button>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col w-full text-left">
             
             {output.isLite && (
               <div className="mb-8 flex items-center justify-center">
                  <div className="bg-gray-900 border border-gray-800 rounded-full px-6 py-2 text-sm text-gray-400 tracking-wide flex items-center gap-3">
                     Lite Persona Mode <span className="bg-gray-800 text-xs px-2 py-0.5 rounded text-gray-300">Full modeling available in Premium</span>
                  </div>
               </div>
             )}

             <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                <h2 className="text-3xl font-serif text-white mb-8 border-b border-gray-800 pb-4 capitalize">{output.name}</h2>
                
                <div className="space-y-8">
                   <div>
                     <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-2">Core Principle</h3>
                     <p className="text-xl font-serif text-white">{output.lens}</p>
                   </div>
                   
                   {!output.isLite && output.perspective && (
                     <div>
                       <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-2">How They See It</h3>
                       <p className="text-gray-300 leading-relaxed">{output.perspective}</p>
                     </div>
                   )}

                   <div>
                     <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-2">What They Would Do</h3>
                     <ul className="space-y-3">
                        {output.actions.map((act: string, i: number) => (
                          <li key={i} className="flex gap-4 items-start">
                             <span className="text-gray-600">—</span>
                             <span className="text-gray-200">{act}</span>
                          </li>
                        ))}
                     </ul>
                   </div>

                   {!output.isLite && output.emotional && (
                     <div className="grid grid-cols-2 gap-8 pt-4">
                       <div>
                         <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-2">Emotional Posture</h3>
                         <p className="text-gray-400 text-sm">{output.emotional}</p>
                       </div>
                       <div>
                         <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-2">Strategic Posture</h3>
                         <p className="text-gray-400 text-sm">{output.strategic}</p>
                       </div>
                     </div>
                   )}

                   {!output.isLite && output.koan && (
                     <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                        <p className="font-serif italic text-gray-400 text-lg">"{output.koan}"</p>
                     </div>
                   )}
                </div>
             </div>
             
             {/* Premium Teasers */}
             <div className="mt-8 flex gap-4 justify-center">
                <button className="bg-gray-900 border border-gray-800 text-gray-400 px-6 py-3 rounded-xl font-medium tracking-wide text-sm hover:text-white transition-colors flex items-center gap-2">
                  What if they were anxious? <span className="bg-gray-800 text-xs px-2 py-0.5 rounded text-gray-300">Premium</span>
                </button>
             </div>

             <div className="mt-12 text-center">
               <button 
                 onClick={() => { setView('input'); setOutput(null); setSituation(''); setPersona(''); }}
                 className="text-gray-500 hover:text-white transition-colors uppercase tracking-widest text-sm font-bold"
               >
                 Consult Another
               </button>
             </div>
          </div>
        )}
      </div>

      <div className="w-full mt-auto pt-12 z-20 relative">
        <HiveFooter />
      </div>

      <style jsx global>{\`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      \`}</style>
    </main>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'apps/hive-wwxd/app/page.tsx'), pageContent.trim(), 'utf8');

let layout = fs.readFileSync(path.join(__dirname, 'apps/hive-wwxd/app/layout.tsx'), 'utf8');
layout = layout.replace(/Secret Box/g, 'WWXD Engine');
layout = layout.replace(/Share a secret. Receive a secret. Feel less alone./g, 'Universal perspective-switching decision clarity.');
fs.writeFileSync(path.join(__dirname, 'apps/hive-wwxd/app/layout.tsx'), layout, 'utf8');

console.log('WWXD Engine V0 UI implemented.');
