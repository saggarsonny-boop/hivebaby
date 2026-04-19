import Link from 'next/link'

const links = [
  ['Gallery', '/'],
  ['Upload', '/upload'],
  ['Search', '/search'],
  ['People', '/people'],
  ['Duplicates', '/duplicates'],
  ['Map', '/map'],
  ['Pricing', '/pricing'],
  ['Account', '/account'],
] as const

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-amber-700/30 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-wide text-amber-400">HivePhoto</Link>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="rounded px-2 py-1 text-zinc-300 hover:bg-zinc-800 hover:text-amber-300">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
