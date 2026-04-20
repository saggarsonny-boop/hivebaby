'use client'
import { useEffect } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt: string
  onClose: () => void
}

export function PhotoModal({ src, alt, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white hover:text-zinc-300 text-2xl z-10"
        onClick={onClose}
      >
        ✕
      </button>
      <div
        className="relative max-w-5xl max-h-full w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="100vw"
        />
      </div>
    </div>
  )
}
