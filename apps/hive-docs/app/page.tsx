"use client";
import React from 'react';

export default function HiveDocsV0() {
  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans p-6">
      <div className="text-center max-w-lg">
         <h1 className="text-3xl font-bold mb-4 tracking-tight">Documentation Engine</h1>
         <p className="text-gray-500 mb-8">Auto-generates FAQs and help articles from resolved support tickets.</p>
         <button className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm">Generate Knowledge Base</button>
      </div>
    </main>
  );
}