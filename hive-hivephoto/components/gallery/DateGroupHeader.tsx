interface Props {
  date: string
  count: number
}

export function DateGroupHeader({ date, count }: Props) {
  return (
    <div className="flex items-baseline gap-2">
      <h2 className="text-sm font-semibold text-zinc-300">{date}</h2>
      <span className="text-xs text-zinc-600">{count}</span>
    </div>
  )
}
