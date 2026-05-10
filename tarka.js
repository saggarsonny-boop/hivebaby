const fs = require('fs');
const path = require('path');

const APPS_DIR = path.join(__dirname, 'apps');

// The 40+ No-Shame Engines
const engines = [
  // Hygiene & Body Basics
  { id: 'hive-fresh', name: 'FreshSense', title: 'Hygiene & Body Clarity', icon: '🧼' },
  { id: 'hive-flatulence', name: 'FlatulenceSense', title: 'Digestive Education', icon: '💨' },
  { id: 'hive-sweat', name: 'SweatSense', title: 'Sweat & Body Odor', icon: '💧' },
  { id: 'hive-bodycare', name: 'BodyCareSense', title: 'Grooming Basics', icon: '🧴' },
  { id: 'hive-period', name: 'PeriodSense', title: 'Menstrual Clarity', icon: '🩸' },
  { id: 'hive-vaginalhealth', name: 'VaginalHealthBasics', title: 'Vaginal Education', icon: '🌸' },
  { id: 'hive-incontinence', name: 'IncontinenceSense', title: 'Pelvic Floor & Bladder', icon: '🚽' },
  { id: 'hive-skin', name: 'SkinSense', title: 'Acne & Skin Care', icon: '✨' },
  { id: 'hive-hairremoval', name: 'HairRemovalSense', title: 'Shaving & Waxing', icon: '🪒' },
  { id: 'hive-hair', name: 'HairSense', title: 'Thinning & Scalp', icon: '💇' },

  // Puberty & Teen Clarity
  { id: 'hive-puberty', name: 'PubertySense', title: 'Puberty Clarity', icon: '🌱' },
  { id: 'hive-bodyunderstanding', name: 'BodyUnderstandingSense', title: 'Body Changes', icon: '🧬' },
  { id: 'hive-bra', name: 'BraSense', title: 'Bra Sizing & Fit', icon: '👙' },
  { id: 'hive-teensocial', name: 'TeenSocialSense', title: 'Teen Social Anxiety', icon: '📱' },
  { id: 'hive-normal', name: 'NormalSense', title: 'What is Normal?', icon: '⚖️' },
  { id: 'hive-embarrassment', name: 'EmbarrassmentSense', title: 'Handling Embarrassment', icon: '🙈' },
  { id: 'hive-familycommunication', name: 'FamilyCommunicationSense', title: 'Talking to Parents', icon: '🗣️' },

  // Emotional & Identity
  { id: 'hive-emotional', name: 'EmotionalSense', title: 'Emotional Regulation', icon: '❤️' },
  { id: 'hive-confidence', name: 'ConfidenceSense', title: 'Confidence Building', icon: '🦁' },
  { id: 'hive-selfworth', name: 'SelfWorthSense', title: 'Self Worth & Value', icon: '💎' },
  { id: 'hive-identity', name: 'IdentitySense', title: 'Identity & Belonging', icon: '🌈' },
  { id: 'hive-comparison', name: 'ComparisonSense', title: 'Stop Comparing', icon: '⚖️' },
  { id: 'hive-rejection', name: 'RejectionSense', title: 'Handling Rejection', icon: '🛡️' },
  { id: 'hive-solitude', name: 'SolitudeSense', title: 'Being Alone', icon: '🧘' },
  { id: 'hive-selfforgiveness', name: 'SelfForgivenessSense', title: 'Self Forgiveness', icon: '🕊️' },
  { id: 'hive-attention', name: 'AttentionSense', title: 'Handling Attention', icon: '👀' },

  // Social & Relationship Clarity
  { id: 'hive-boundaries', name: 'BoundariesSense', title: 'Setting Boundaries', icon: '🚧' },
  { id: 'hive-social', name: 'SocialSense', title: 'Social Skills', icon: '🤝' },
  { id: 'hive-belonging', name: 'BelongingSense', title: 'Finding Belonging', icon: '🌍' },
  { id: 'hive-datingclarity', name: 'DatingClaritySense', title: 'Dating Clarity', icon: '💞' },
  { id: 'hive-repair', name: 'RepairSense', title: 'Apologies & Repair', icon: '🔧' },
  { id: 'hive-help', name: 'HelpSense', title: 'Asking for Help', icon: '🙋' },
  { id: 'hive-comfort', name: 'ComfortSense', title: 'Touch & Comfort', icon: '🫂' },

  // Life Skills & Adulting
  { id: 'hive-adulting', name: 'AdultingSense', title: 'Adulting Basics', icon: '🏠' },
  { id: 'hive-home', name: 'HomeSense', title: 'Home Maintenance', icon: '🧹' },
  { id: 'hive-cooking', name: 'CookingSense', title: 'Cooking Basics', icon: '🍳' },
  { id: 'hive-moneybasics', name: 'MoneyBasicsSense', title: 'Money Basics', icon: '💵' },
  { id: 'hive-financial', name: 'FinancialSense', title: 'Financial Literacy', icon: '📈' },
  { id: 'hive-workbasics', name: 'WorkBasicsSense', title: 'Workplace Skills', icon: '💼' },
  { id: 'hive-techbasics', name: 'TechBasicsSense', title: 'Tech Basics', icon: '💻' },
  { id: 'hive-seniortech', name: 'SeniorTechSense', title: 'Senior Tech Skills', icon: '👴' },

  // Physical Skills
  { id: 'hive-yoga', name: 'YogaSense', title: 'Yoga Basics', icon: '🧘‍♀️' },
  { id: 'hive-posture', name: 'PostureSense', title: 'Posture Correction', icon: '🧍' },
  { id: 'hive-mobility', name: 'MobilitySense', title: 'Mobility & Balance', icon: '🦵' },
  { id: 'hive-balance', name: 'BalanceSense', title: 'Balance Skills', icon: '⚖️' },
  { id: 'hive-dance', name: 'DanceSense', title: 'Dance Basics', icon: '💃' },
  { id: 'hive-gym', name: 'GymSense', title: 'Gym Basics', icon: '🏋️' },
  { id: 'hive-swim', name: 'SwimSense', title: 'Swimming Basics', icon: '🏊' },

  // Special Shame Clusters
  { id: 'hive-reentry', name: 'ReentrySense', title: 'Ex-Felon Basics', icon: '🚪' },
  { id: 'hive-literacy', name: 'LiteracySense', title: 'Reading & Writing', icon: '📚' },
  { id: 'hive-addictionedu', name: 'AddictionEducation', title: 'Habits & Triggers', icon: '🧠' },
  { id: 'hive-anger', name: 'AngerSense', title: 'Anger Management', icon: '🌋' },
  { id: 'hive-desire', name: 'DesireSense', title: 'Understanding Desire', icon: '🔥' },

  // MicrobiomeSense Cluster
  { id: 'hive-gutmicrobiome', name: 'GutMicrobiomeSense', title: 'Gut Ecosystem', icon: '🦠' },
  { id: 'hive-skinmicrobiome', name: 'SkinMicrobiomeSense', title: 'Skin Ecosystem', icon: '🔬' },
  { id: 'hive-oralmicrobiome', name: 'OralMicrobiomeSense', title: 'Oral Ecosystem', icon: '👄' },
  { id: 'hive-vaginalmicrobiome', name: 'VaginalMicrobiomeSense', title: 'Vaginal Ecosystem', icon: '🌺' },
  { id: 'hive-envmicrobiome', name: 'EnvironmentalMicrobiomeSense', title: 'Home Ecosystem', icon: '🏡' },
  { id: 'hive-foodmicrobiome', name: 'FoodMicrobiomeSense', title: 'Food Fermentation', icon: '🧀' },
  { id: 'hive-petmicrobiome', name: 'PetMicrobiomeSense', title: 'Pet Ecosystem', icon: '🐕' },
  { id: 'hive-plantmicrobiome', name: 'PlantMicrobiomeSense', title: 'Plant Ecosystem', icon: '🌿' }
];

// Helper to generate a unique pastel color based on the string
const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 95%)`;
};

// Generate layout.tsx
const generateLayout = () => {
    return `import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}`;
};

// Generate globals.css
const generateCss = (bgColor) => {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', sans-serif;
  background-color: ${bgColor};
  color: #111827;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out forwards;
}`;
};

// Generate page.tsx
const generatePage = (engine) => {
    return `"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function ${engine.name}() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setResponse("");
    setTimeout(() => {
      setLoading(false);
      setResponse("This is a shame-free educational space. " +
      "The Hive does not diagnose or prescribe. Here is general clarity regarding your question: " + 
      "It is incredibly common to have questions about this topic, and many people experience exactly what you are describing. " +
      "Biologically and socially, wide variation exists, and much of what causes anxiety is simply a lack of open education.");
    }, 1200);
  };

  return (
    <main className="min-h-screen text-[#111827] flex flex-col font-sans items-center pt-12 pb-24">
      <div className="max-w-3xl w-full px-6 mb-8 text-center animate-slide-in">
        <div className="inline-block px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold tracking-wide mb-4 shadow-sm">
           SHAME-FREE CLARITY
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
           ${engine.title} <span className="text-4xl">${engine.icon}</span>
        </h1>
        <p className="text-slate-600 text-lg md:text-xl font-medium">
          A sovereign, private space for education. No judgment. No expectations.
        </p>
      </div>

      <div className="w-full max-w-3xl px-6 flex flex-col gap-6 flex-1 mb-12 relative z-10 animate-slide-in" style={{animationDelay: '0.1s'}}>
         <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 p-2 transition-all focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row gap-2 relative">
               <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="I have a question about..." 
                  className="w-full bg-transparent text-slate-800 text-lg rounded-2xl px-6 py-4 outline-none placeholder:text-slate-400"
               />
               <button 
                  type="submit" 
                  disabled={!query}
                  className="mx-2 mb-2 sm:mx-0 sm:mb-0 bg-slate-900 text-white font-bold px-8 py-3 rounded-2xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
               >
                  Learn
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
               </button>
            </form>
         </div>

         {loading && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 p-8 mt-4 animate-pulse">
               <div className="h-4 bg-slate-100 rounded w-1/4 mb-6"></div>
               <div className="space-y-3">
                 <div className="h-4 bg-slate-100 rounded w-full"></div>
                 <div className="h-4 bg-slate-100 rounded w-full"></div>
                 <div className="h-4 bg-slate-100 rounded w-5/6"></div>
               </div>
            </div>
         )}

         {response && !loading && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-8 mt-4 animate-slide-in">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-800">Educational Clarity</h3>
               </div>
               <div className="prose prose-slate max-w-none text-lg">
                  <p>{response}</p>
               </div>
               <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-400 max-w-sm">This is an educational space. If you are experiencing concerning symptoms or distress, please consult a professional.</p>
                  <button onClick={() => {setResponse(""); setQuery("");}} className="text-sm font-bold text-slate-600 hover:text-slate-900">Explore another topic</button>
               </div>
            </div>
         )}
      </div>

      <div className="mt-auto w-full max-w-3xl px-6 pt-12 relative z-10">
         <HiveFooter />
      </div>
    </main>
  );
}`;
};

// Run the compiler
console.log("Starting Tarka Compiler (No-Shame Swarm Edition)...");
if (!fs.existsSync(APPS_DIR)) {
    fs.mkdirSync(APPS_DIR, { recursive: true });
}

let count = 0;
engines.forEach(engine => {
    const appDir = path.join(APPS_DIR, engine.id, 'app');
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir, { recursive: true });
    }

    const layoutPath = path.join(appDir, 'layout.tsx');
    const cssPath = path.join(appDir, 'globals.css');
    const pagePath = path.join(appDir, 'page.tsx');

    // Create files if they don't exist
    if (!fs.existsSync(layoutPath)) {
        fs.writeFileSync(layoutPath, generateLayout());
    }
    
    // Always regenerate to ensure correct colors/formatting for this run
    const bgColor = stringToColor(engine.name);
    fs.writeFileSync(cssPath, generateCss(bgColor));
    fs.writeFileSync(pagePath, generatePage(engine));

    console.log(`[Generated] ${engine.id} (${engine.name})`);
    count++;
});

console.log(`\nTarka Compilation Complete. Generated/Updated ${count} No-Shame Engines.`);
