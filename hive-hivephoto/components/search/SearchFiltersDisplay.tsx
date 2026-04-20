import type { SearchFilters } from '@/lib/types/search'

interface Props {
  filters: SearchFilters
}

export function SearchFiltersDisplay({ filters }: Props) {
  const chips: string[] = []

  if (filters.dateFrom || filters.dateTo) {
    chips.push(`Date: ${filters.dateFrom ?? ''}–${filters.dateTo ?? ''}`)
  }
  if (filters.location) chips.push(`Location: ${filters.location}`)
  if (filters.personName) chips.push(`Person: ${filters.personName}`)
  if (filters.objects?.length) chips.push(`Objects: ${filters.objects.join(', ')}`)
  if (filters.scenes?.length) chips.push(`Scene: ${filters.scenes.join(', ')}`)
  if (filters.emotions?.length) chips.push(`Mood: ${filters.emotions.join(', ')}`)
  if (filters.freeText) chips.push(`"${filters.freeText}"`)

  if (!chips.length) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <span key={chip} className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full">
          {chip}
        </span>
      ))}
    </div>
  )
}
