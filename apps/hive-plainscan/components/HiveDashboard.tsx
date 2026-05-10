// @ts-nocheck
import React from 'react';

export default function HiveDashboard({ engineName, creditsUsed, maxCredits = 5 }) {
  const percentage = Math.min((creditsUsed / maxCredits) * 100, 100);
  
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-[#0f172a] shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold font-display text-lg dark:text-gray-100">Your {engineName} Usage</h3>
        <span className="text-sm text-gray-500 font-mono">{creditsUsed} / {maxCredits} Free Credits</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-6">
        <div 
          className="bg-[#c8960a] h-2 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50">
          <h4 className="font-bold text-sm mb-1 dark:text-gray-200">Free Tier</h4>
          <p className="text-xs text-gray-500 mb-3">Basic access, watermarked outputs, standard speed.</p>
          <button className="w-full py-2 text-xs font-bold border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-transparent text-gray-600 dark:text-gray-400 cursor-default">Current Plan</button>
        </div>
        
        <div className="p-4 border border-[#c8960a]/30 rounded-lg bg-[#c8960a]/5 relative">
          <div className="absolute -top-2.5 right-3 bg-[#c8960a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">RECOMMENDED</div>
          <h4 className="font-bold text-sm mb-1 text-[#c8960a]">Pro Tier</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">$14/mo. No watermarks, high-fidelity unlocks.</p>
          <button className="w-full py-2 text-xs font-bold bg-[#c8960a] text-white rounded-md hover:bg-[#b08408] transition-colors">Upgrade to Pro</button>
        </div>

        <div className="p-4 border border-blue-100 dark:border-blue-900/30 rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <h4 className="font-bold text-sm mb-1 text-blue-700 dark:text-blue-400">Enterprise</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Custom B2B schemas, Embeddable Widgets, API.</p>
          <button className="w-full py-2 text-xs font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Contact Sales</button>
        </div>
      </div>
    </div>
  );
}
