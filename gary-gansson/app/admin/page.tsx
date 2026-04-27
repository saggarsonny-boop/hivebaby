'use client'

import { useEffect, useState } from 'react'

interface Submission {
  id: number
  name: string | null
  country: string | null
  response: string
  created_at: string
  used: boolean
  episode_id: number | null
}

interface Episode {
  id: number
  title: string
  script: string | null
  audio_url: string | null
  video_url: string | null
  published_at: string | null
  created_at: string
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [tab, setTab] = useState<'submissions' | 'episodes'>('submissions')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthed(true)
      loadData()
    } else {
      setAuthError('Incorrect password')
    }
  }

  async function loadData() {
    setLoading(true)
    const [subRes, epRes] = await Promise.all([
      fetch('/api/admin/submissions'),
      fetch('/api/admin/episodes'),
    ])
    if (subRes.ok) setSubmissions(await subRes.json())
    if (epRes.ok) setEpisodes(await epRes.json())
    setLoading(false)
  }

  async function toggleUsed(id: number, used: boolean) {
    await fetch('/api/admin/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, used: !used }),
    })
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, used: !used } : s))
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-white mb-2">Gary Gansson Admin</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-teal-500/60 transition text-sm"
          />
          {authError && <p className="text-red-400 text-sm">{authError}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm transition"
            style={{ backgroundColor: '#d4a017', color: '#0d1b2a' }}
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white px-4 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Gary Gansson Admin</h1>
        <button onClick={loadData} className="text-teal-400 text-sm hover:text-teal-300 transition">
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['submissions', 'episodes'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              tab === t ? 'bg-teal-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <p className="text-white/40 text-sm">Loading…</p>}

      {/* Submissions */}
      {tab === 'submissions' && !loading && (
        <div className="space-y-3">
          <p className="text-white/40 text-sm mb-4">
            {submissions.length} total · {submissions.filter(s => !s.used).length} unused
          </p>
          {submissions.map(s => (
            <div
              key={s.id}
              className={`border rounded-xl p-4 transition ${
                s.used ? 'border-white/5 bg-white/2 opacity-50' : 'border-white/15 bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/40 text-xs">#{s.id}</span>
                    {s.name && <span className="text-teal-300 text-xs font-medium">{s.name}</span>}
                    {s.country && <span className="text-white/40 text-xs">· {s.country}</span>}
                    <span className="text-white/25 text-xs">
                      · {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">{s.response}</p>
                  {s.episode_id && (
                    <span className="text-gold-400 text-xs mt-1 block">Episode #{s.episode_id}</span>
                  )}
                </div>
                <button
                  onClick={() => toggleUsed(s.id, s.used)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    s.used
                      ? 'bg-white/10 text-white/40 hover:bg-white/15'
                      : 'bg-teal-600/30 text-teal-300 hover:bg-teal-600/50'
                  }`}
                >
                  {s.used ? 'Used' : 'Mark used'}
                </button>
              </div>
            </div>
          ))}
          {submissions.length === 0 && (
            <p className="text-white/30 text-sm text-center py-12">No submissions yet.</p>
          )}
        </div>
      )}

      {/* Episodes */}
      {tab === 'episodes' && !loading && (
        <div className="space-y-3">
          {episodes.map(ep => (
            <div key={ep.id} className="border border-white/15 bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white">{ep.title}</h3>
                <span className="text-white/30 text-xs">
                  {new Date(ep.created_at).toLocaleDateString('en-GB')}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {ep.audio_url && (
                  <audio controls src={ep.audio_url} className="h-8 max-w-full" />
                )}
                {ep.video_url && (
                  <a href={ep.video_url} target="_blank" rel="noopener noreferrer"
                    className="text-teal-400 text-xs hover:underline">
                    Preview video ↗
                  </a>
                )}
                {ep.published_at && (
                  <span className="text-gold-400 text-xs">Published {new Date(ep.published_at).toLocaleDateString('en-GB')}</span>
                )}
              </div>
            </div>
          ))}
          {episodes.length === 0 && (
            <p className="text-white/30 text-sm text-center py-12">No episodes yet. Generate a script to get started.</p>
          )}
        </div>
      )}
    </div>
  )
}
