
import { UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function SecretBoxLanding() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#111111] to-[#000000] text-white flex flex-col items-center justify-center p-6 fabulous-glass">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37] opacity-[0.03] blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#c8960a] opacity-[0.02] blur-[100px]"></div>
      </div>
      
      <div className="z-10 text-center max-w-2xl">
        <div className="inline-block p-4 rounded-full bg-white/5 border border-white/10 mb-8 fabulous-hover">
          <svg className="w-12 h-12 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h1 className="text-6xl font-bold tracking-tight mb-4 font-serif text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          HiveField Engine
        </h1>
        <p className="text-xl text-gray-400 mb-10 font-light tracking-wide">
          Advanced field operations tracking and data collection.
        </p>

        {userId ? (
          <div className="flex flex-col items-center gap-6 ud-fade-in">
            <div className="p-1 rounded-full bg-white/10 border border-[#D4AF37]/30">
               <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-12 h-12" } }} />
            </div>
            <Link href="/clinic" className="ud-btn-primary px-8 py-4 text-lg fabulous-hover rounded-full bg-gradient-to-r from-[#D4AF37] to-[#c8960a] border-none shadow-[0_0_40px_rgba(212,175,55,0.3)]">
              Access the Vault
            </Link>
          </div>
        ) : (
                    <div className="flex gap-4 justify-center ud-fade-in">
            <SignInButton mode="modal">
              <button className="ud-btn-primary px-8 py-4 text-lg fabulous-hover rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 shadow-none">
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
