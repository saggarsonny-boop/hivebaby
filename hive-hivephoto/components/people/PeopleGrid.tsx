'use client'
import Link from 'next/link'
import Image from 'next/image'
import type { Person } from '@/lib/types/photo'

interface Props {
  people: Person[]
}

export function PeopleGrid({ people }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {people.map((person) => (
        <Link
          key={person.id}
          href={`/people/${person.id}`}
          className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-colors border border-zinc-800 hover:border-zinc-700 text-center group"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-800 mx-auto mb-3 overflow-hidden flex items-center justify-center">
            {person.coverThumbUrl ? (
              <Image src={person.coverThumbUrl} alt={person.name} width={64} height={64} className="object-cover w-full h-full rounded-full" />
            ) : (
              <span className="text-2xl text-zinc-600">
                {person.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <p className="font-medium text-sm truncate">{person.name}</p>
          <p className="text-zinc-500 text-xs mt-0.5">{person.photoCount} photos</p>
        </Link>
      ))}
    </div>
  )
}
