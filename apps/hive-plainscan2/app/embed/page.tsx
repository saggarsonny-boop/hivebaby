"use client";

import { useState } from "react";
import { Sparkles, FileUp, ArrowRight, ShieldCheck } from "lucide-react";

export default function EmbedWidget() {
  const [reportText, setReportText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    // Simulate API call to the host clinic's quota
    setTimeout(() => {
      setIsLoading(false);
      setIsDone(true);
    }, 2500);
  }

  if (isDone) {
    return (
      <div className="flex flex-col h-full bg-white text-slate-900 p-6">
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Sparkles size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Your Explanation is Ready!</h2>
          <p className="text-sm text-slate-500 mb-6">
            We have generated a patient-friendly summary and 3D visual diagram of your imaging report.
          </p>
          <a
            href="https://plainscan2.hive.baby"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#2563eb] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
          >
            View Full Results on Hive <ArrowRight size={18} />
          </a>
        </div>
        <div className="mt-auto pt-4 border-t text-xs text-center text-slate-400 font-mono">
          Powered by hive.baby Enterprise
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      <div className="bg-[#2563eb] text-white p-4 shadow-md">
        <h1 className="font-bold text-lg">Report Explainer</h1>
        <p className="text-xs text-blue-100">Upload your MRI or X-ray report text.</p>
      </div>
      
      <div className="flex-1 p-4 flex flex-col">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex gap-2 items-start text-xs text-blue-800">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <p>Your data is processed securely and is never used to train AI models. HIPAA-ready infrastructure.</p>
        </div>

        <label className="text-sm font-bold mb-2 block">Paste Report Text</label>
        <textarea
          className="flex-1 w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none resize-none mb-4"
          placeholder="FINDINGS: C5-C6 broad based mixed protrusion..."
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
        />
        
        <button
          onClick={handleGenerate}
          disabled={isLoading || reportText.length < 20}
          className="w-full bg-[#2563eb] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            "Analyzing..."
          ) : (
            <>
              <Sparkles size={18} /> Generate Visual Explanation
            </>
          )}
        </button>
      </div>

      <div className="p-3 text-center text-[10px] text-slate-400 bg-white border-t">
        This tool provides communication support, not a medical diagnosis.
      </div>
    </div>
  );
}
