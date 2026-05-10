"use client";
import React from 'react';

export default function HiveFeedbackV0() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col items-center justify-center font-sans p-6">
      <div className="text-center max-w-lg">
         <h1 className="text-3xl font-extrabold mb-4 tracking-tight">Feedback Categorization</h1>
         <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <div className="text-2xl mb-2">💡</div>
               <div className="font-bold text-sm">Suggestions (14)</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <div className="text-2xl mb-2">🐞</div>
               <div className="font-bold text-sm">Bugs (2)</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <div className="text-2xl mb-2">❤️</div>
               <div className="font-bold text-sm">Praise (45)</div>
            </div>
         </div>
      </div>
    </main>
  );
}