// @ts-nocheck
import React, { useState } from 'react';

export default function CrossPollinationModal({ sourceEngine, targetEngine, targetUrl, description }: { sourceEngine?: string, targetEngine?: string, targetUrl?: string, description?: string }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-5 z-50 animate-in slide-in-from-bottom-5">
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        âœ•
      </button>
      <div className="text-[10px] font-mono text-[#c8960a] mb-2 tracking-widest uppercase">The Hive Ecosystem</div>
      <h4 className="font-bold text-base mb-2 dark:text-gray-100">Try {targetEngine}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      <a 
        href={targetUrl}
        className="block w-full text-center py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Open {targetEngine} â†’
      </a>
    </div>
  );
}
