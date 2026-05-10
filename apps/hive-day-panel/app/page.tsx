"use client";

import React, { useState, useEffect } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function DayPanelV0() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="min-h-screen bg-[#FDFCF8]" />;

  const hours = time.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <main className="min-h-screen bg-[#FDFCF8] text-[#1A1A1A] flex flex-col items-center justify-center p-6 font-sans relative">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center text-sm font-medium tracking-wide">
         <div>THE HIVE</div>
         <div>DAY PANEL</div>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col md:flex-row items-stretch justify-center gap-12 mt-12 mb-auto">
        
        {/* Clock Component */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative group cursor-pointer">
           <div className="absolute inset-0 bg-[#F5F3EC] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="relative z-10 text-center">
             <div className="text-[8rem] font-serif leading-none tracking-tighter mb-2">
               {hours12}:{minutes}<span className="text-3xl text-gray-400 ml-2 tracking-normal">{seconds}</span>
             </div>
             <div className="text-xl tracking-widest text-gray-500 font-medium">{ampm}</div>
             <div className="mt-8 bg-black text-white text-xs px-4 py-1.5 rounded-full inline-block font-bold tracking-widest uppercase">Clock</div>
           </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px bg-gray-200"></div>

        <div className="flex-1 flex flex-col gap-12">
          
          {/* Weather Component */}
          <div className="flex-1 flex flex-col justify-center p-8 relative group cursor-pointer">
            <div className="absolute inset-0 bg-[#F5F3EC] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-end gap-4 mb-4">
                 <div className="text-7xl font-serif leading-none tracking-tighter">72°</div>
                 <div className="text-2xl text-gray-500 pb-1">Clear</div>
              </div>
              <p className="text-gray-500 font-medium">Feels like 74°. Sunset at 8:12 PM.</p>
              <div className="mt-6 bg-black text-white text-xs px-4 py-1.5 rounded-full inline-block font-bold tracking-widest uppercase">Weather</div>
            </div>
          </div>

          {/* Horizontal Divider */}
          <div className="h-px bg-gray-200 w-full"></div>

          {/* Calendar Component */}
          <div className="flex-1 flex flex-col justify-center p-8 relative group cursor-pointer">
            <div className="absolute inset-0 bg-[#F5F3EC] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-4xl font-serif mb-4">Thursday, May 10</div>
              <ul className="space-y-3 text-lg text-gray-600">
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                   <span>No scheduled meetings.</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                   <span>Waxing Crescent Moon 🌒</span>
                 </li>
              </ul>
              <div className="mt-6 bg-black text-white text-xs px-4 py-1.5 rounded-full inline-block font-bold tracking-widest uppercase">Calendar</div>
            </div>
          </div>

        </div>

      </div>

      <div className="w-full mt-auto pt-12 text-center opacity-50">
        <HiveFooter />
      </div>

    </main>
  );
}