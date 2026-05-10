
import { UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Universal DocumentLanding() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-[#f7faff] text-[#243b53] flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#2563eb] opacity-[0.03] blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#1d4ed8] opacity-[0.02] blur-[100px]"></div>
      </div>
      
      <div className="z-10 text-center max-w-2xl">
        <div className="inline-block p-4 rounded-full bg-white border border-[#e2e8f0] mb-8 fabulous-hover">
          <svg className="w-12 h-12 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h1 className="text-6xl font-bold tracking-tight mb-4 font-serif text-[#1E3A8A]">
          HiveUniversal Document Engine
        </h1>
        <p className="text-xl text-[#64748b] mb-10 font-light tracking-wide">
          Absolute encrypted storage for your deepest secrets and confessions.
        </p>

        {userId ? (
          <div className="flex flex-col items-center gap-6 ud-fade-in">
            <div className="p-1 rounded-full bg-[#f1f5f9] border border-[#2563eb]/30">
               <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-12 h-12" } }} />
            </div>
            <Link href="/plainscan" className="ud-btn-primary px-8 py-4 text-lg fabulous-hover rounded-full bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] border-none shadow-[0_0_40px_rgba(37,99,235,0.3)]">
              Access the Sanctuary
            </Link>
          </div>
        ) : (
                    <div className="flex gap-4 justify-center ud-fade-in">
            <SignInButton mode="modal">
              <button className="ud-btn-primary px-8 py-4 text-lg fabulous-hover rounded-full bg-[#1E3A8A] text-white border border-[#1E3A8A] hover:bg-[#1E3A8A]/90 shadow-none">
                Authenticate
              </button>
            </SignInButton>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 text-center text-sm text-gray-600 font-mono tracking-widest">
        POWERED BY QUEEN BEE GOVERNANCE
      </div>
    </main>
  );
}
