'use client'
import Link from 'next/link'
import Image from 'next/image'
import type { Person } from '@/lib/types/photo'

interface Props {
  person: Person
}

export default function PersonCard({ person }: Props) {
  return (
    <Link href={`/people/${person.id}`} className="group block">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-800 mx-auto mb-3 overflow-hidden flex items-center justify-center">
          {person.coverThumbUrl ? (
            <Image
              src={person.coverThumbUrl}
              alt={person.name}
              width={64}
              height={64}
              className="object-cover w-full h-full rounded-full"
            />
          ) : (
            <span className="text-2xl text-zinc-600">
              {person.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <p className="font-medium text-sm truncate">{person.name}</p>
        <p className="text-zinc-500 text-xs mt-0.5">{person.photoCount} photos</p>
      </div>
    </Link>
  )
}
