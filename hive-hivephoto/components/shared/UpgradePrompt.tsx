'use client'
import Link from 'next/link'

interface Props {
  message: string
  onDismiss: () => void
}

export function UpgradePrompt({ message, onDismiss }: Props) {
  return (
    <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 mb-4 flex items-center justify-between">
      <div>
        <p className="text-amber-400 font-semibold text-sm">{message}</p>
        <p className="text-zinc-400 text-xs mt-0.5">Upgrade to get more storage.</p>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <Link
          href="/pricing"
          className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
        >
          Upgrade
        </Link>
        <button onClick={onDismiss} className="text-zinc-500 hover:text-white text-xs">
          ✕
        </button>
      </div>
    </div>
  )
}
