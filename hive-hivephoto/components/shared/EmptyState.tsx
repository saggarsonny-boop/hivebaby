import Link from 'next/link'

interface Props {
  title: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800">
        <span className="text-2xl">📷</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-zinc-400 text-sm mb-6 max-w-sm">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
