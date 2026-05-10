"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function DemographyOSV0() {
  const [region, setRegion] = useState('Kyoto, Japan');
  const [timeframe, setTimeframe] = useState('10 Years');

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 flex flex-col items-center justify-start p-8 font-sans relative">
      
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-12">
         <div className="font-serif text-2xl tracking-tight text-black font-bold">Demography OS</div>
         <div className="flex gap-4">
            <select 
              value={region} 
              onChange={(e) => setRegion(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg outline-none focus:border-blue-500 shadow-sm text-sm font-medium"
            >
               <option>Kyoto, Japan</option>
               <option>Lagos, Nigeria</option>
               <option>Detroit, USA</option>
               <option>Munich, Germany</option>
            </select>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg outline-none focus:border-blue-500 shadow-sm text-sm font-medium"
            >
               <option>5 Years</option>
               <option>10 Years</option>
               <option>20 Years</option>
            </select>
         </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 z-10 mb-auto">
        
        {/* Core Metric 1 */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
           <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Projected Population Shift</h3>
           <div className="text-5xl font-light text-black mb-2">-14.2%</div>
           <p className="text-gray-500 text-sm">Critical decline in working-age adults (18-65) projected by 2036.</p>
        </div>

        {/* Core Metric 2 */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
           <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Healthcare Strain Index</h3>
           <div className="text-5xl font-light text-red-600 mb-2">Severe</div>
           <p className="text-gray-500 text-sm">Eldercare demand will exceed caregiver supply by 42% in this timeframe.</p>
        </div>

        {/* Core Metric 3 */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
           <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Infrastructure Impact</h3>
           <div className="text-5xl font-light text-blue-600 mb-2">12</div>
           <p className="text-gray-500 text-sm">Estimated primary school closures required due to birth rate decline.</p>
        </div>

        {/* Chart Area Mock */}
        <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
           <h3 className="text-gray-900 font-bold mb-6">Age Pyramid Evolution (2026 vs 2036)</h3>
           <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
              <p className="text-gray-400 font-medium">Interactive D3.js visualization rendering layer</p>
           </div>
        </div>

        {/* Alerts / Actions */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
           <h3 className="text-gray-900 font-bold mb-6">Institutional Alerts</h3>
           <ul className="space-y-4 flex-1">
              <li className="flex gap-3">
                 <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                 <p className="text-sm text-gray-700 leading-snug">Hospital staffing shortage imminent (Internal Medicine).</p>
              </li>
              <li className="flex gap-3">
                 <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5"></div>
                 <p className="text-sm text-gray-700 leading-snug">Housing surplus expected in suburban districts.</p>
              </li>
              <li className="flex gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                 <p className="text-sm text-gray-700 leading-snug">Municipal tax base projected to shrink by 8.4%.</p>
              </li>
           </ul>
           <button className="w-full mt-6 bg-black text-white py-3 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors">
              Export Institutional Report
           </button>
        </div>

      </div>

      <div className="w-full mt-16 pt-8 border-t border-gray-200">
        <HiveFooter />
      </div>
    </main>
  );
}