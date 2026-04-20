'use client'
interface Props {
  dates: string[]
  onJump: (date: string) => void
}

export function TimelineScrubber({ dates, onJump }: Props) {
  if (!dates.length) return null
  const years = [...new Set(dates.map((d) => new Date(d).getFullYear()))].sort((a, b) => b - a)

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-40">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onJump(String(year))}
          className="text-xs text-zinc-500 hover:text-amber-400 transition-colors"
        >
          {year}
        </button>
      ))}
    </div>
  )
}
