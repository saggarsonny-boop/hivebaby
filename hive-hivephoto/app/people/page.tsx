'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import { PeopleGrid } from '@/components/people/PeopleGrid'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Person } from '@/lib/types/photo'

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/people')
      .then((r) => r.json())
      .then((data: { people: Person[] }) => setPeople(data.people ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">People</h1>
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && people.length === 0 && (
          <EmptyState
            title="No people yet"
            description="Faces detected in your photos will appear here. Label them to group photos by person."
          />
        )}
        {!loading && people.length > 0 && <PeopleGrid people={people} />}
      </main>
    </div>
  )
}
