import Link from "next/link";


export default function Landing() {
  return (
    <main className="min-h-screen bg-white text-[#243b53] flex flex-col items-center justify-center p-6 font-sans">
      <div className="z-10 text-center max-w-4xl w-full">
        <h1 className="text-5xl font-black tracking-tight mb-4 font-serif text-[#1e2d3d]">
          HiveCompliance
        </h1>
        <p className="text-xl text-[#64748b] mb-12 font-light tracking-wide">
          SOC2 & HIPAA Architecture Auditing.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-16 text-left">
          
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
      <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Free</h3>
      <p className="text-3xl font-black text-[#D4AF37] mb-4">$0<span className="text-sm font-normal text-gray-500">/mo</span></p>
      <ul className="text-sm text-gray-600 mb-6 flex-grow space-y-2">
        <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>1 policy scan</span></li><li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Basic gaps</span></li><li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Standard checks</span></li><li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Cancel anytime</span></li>
      </ul>
      <button className="w-full py-3 rounded-lg font-bold transition-all border border-gray-300 text-gray-700 hover:bg-gray-50">Start Free</button>
    </div>
  
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
      <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Pro</h3>
      <p className="text-3xl font-black text-[#D4AF37] mb-4">$99<span className="text-sm font-normal text-gray-500">/mo</span></p>
      <ul className="text-sm text-gray-600 mb-6 flex-grow space-y-2">
        <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Monthly gap analysis</span></li><li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Startup tier</span></li><li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Actionable fixes</span></li><li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Cancel anytime</span></li>
      </ul>
      <button className="w-full py-3 rounded-lg font-bold transition-all bg-[#D4AF37] text-[#1e2d3d] hover:bg-[#b08d2b]">Upgrade to Pro</button>
    </div>
  
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
      <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Enterprise</h3>
      <p className="text-3xl font-black text-[#D4AF37] mb-4">$999<span className="text-sm font-normal text-gray-500">/mo</span></p>
      <ul className="text-sm text-gray-600 mb-6 flex-grow space-y-2">
        <li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Unlimited scanning</span></li><li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>BAA Coverage</span></li><li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Verification Badge</span></li><li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>Cancel anytime</span></li>
      </ul>
      <button className="w-full py-3 rounded-lg font-bold transition-all border border-gray-300 text-gray-700 hover:bg-gray-50">Contact Sales</button>
    </div>
  
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="px-8 py-4 bg-[#1e2d3d] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
            Access Dashboard →
          </Link>
        </div>
      </div>
      
    </main>
  );
}