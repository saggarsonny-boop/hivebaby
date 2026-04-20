'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'

const navItems = [
  { href: '/', label: 'Gallery' },
  { href: '/search', label: 'Search' },
  { href: '/people', label: 'People' },
  { href: '/map', label: 'Map' },
  { href: '/duplicates', label: 'Duplicates' },
]

export function Nav() {
  const path = usePathname()

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-amber-400 text-lg">
            HivePhoto
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  path === item.href
                    ? 'text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SignedIn>
            <Link
              href="/upload"
              className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hidden sm:block"
            >
              Upload
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  )
}
