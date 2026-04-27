'use client'

import { useState } from 'react'
import Image from 'next/image'

const QUESTION = "What's the one thing you wish more people understood about you?"
const MAX_CHARS = 500

export default function Home() {
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [response, setResponse] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!response.trim()) return
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || null, country: country.trim() || null, response: response.trim() }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setStatus('success')
      setName('')
      setCountry('')
      setResponse('')
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-[#0d1b2a] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-teal-400 font-bold text-sm tracking-widest uppercase">HiveTV</span>
        </div>
        <span className="text-white/40 text-xs">AI · Always</span>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-12 pb-8 text-center">
        <div className="relative w-48 h-48 md:w-64 md:h-64 mb-6 rounded-full overflow-hidden ring-4 ring-gold-500/40 shadow-2xl shadow-gold-600/20">
          <Image
            src="/gary-avatar.png"
            alt="Gary Gansson with Pico the parrot"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
          Gary <span className="text-teal-400">Gansson</span>
        </h1>
        <p className="text-gold-400 text-lg md:text-xl font-medium mb-1">
          Everyone has a story worth telling.
        </p>
        <p className="text-white/50 text-sm max-w-md">
          West London&apos;s AI talk show host. Warm, curious, mischievous — and always listening.
          Share your story and Gary might read it on the next episode.
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 px-6 max-w-xl mx-auto mb-8">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs uppercase tracking-widest">Share your story</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Form */}
      <section className="max-w-xl mx-auto px-4 pb-16">
        {status === 'success' ? (
          <div className="bg-teal-900/40 border border-teal-500/40 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🦜</div>
            <h2 className="text-xl font-bold text-teal-300 mb-2">Right then — well done.</h2>
            <p className="text-white/60 text-sm">
              Gary&apos;s got your story. Pico&apos;s very excited. Check back for the next episode.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-6 text-teal-400 text-sm underline underline-offset-4"
            >
              Submit another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                {QUESTION}
              </label>
              <textarea
                value={response}
                onChange={e => setResponse(e.target.value.slice(0, MAX_CHARS))}
                rows={5}
                required
                placeholder="Tell Gary something real..."
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 resize-none focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40 transition text-sm"
              />
              <div className="flex justify-between mt-1">
                <span className="text-white/25 text-xs">Be honest. Gary loves that.</span>
                <span className={`text-xs ${response.length >= MAX_CHARS ? 'text-gold-400' : 'text-white/30'}`}>
                  {response.length}/{MAX_CHARS}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">
                  First name <span className="text-white/25">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">
                  Country <span className="text-white/25">(optional)</span>
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="e.g. Nigeria"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40 transition text-sm"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-400 text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting' || !response.trim()}
              className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-navy-900 font-bold py-3 rounded-xl transition text-sm tracking-wide"
              style={{ backgroundColor: '#d4a017', color: '#0d1b2a' }}
            >
              {status === 'submitting' ? 'Sending to Gary…' : 'Tell Gary →'}
            </button>

            <p className="text-white/25 text-xs text-center">
              By submitting you agree your response may be read on Gary Gansson, an AI-generated show.
            </p>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center">
        <p className="text-white/30 text-xs mb-1">
          Gary Gansson is an AI character. All content is AI-generated and clearly labelled as such.
        </p>
        <p className="text-white/20 text-xs">
          No ads. No investors. No agenda. · A{' '}
          <a href="https://hive.baby" className="text-teal-500 hover:text-teal-400 transition">
            Hive
          </a>{' '}
          production.
        </p>
      </footer>
    </main>
  )
}
