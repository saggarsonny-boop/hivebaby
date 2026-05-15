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
  status: 'draft' | 'approved' | 'audio_ready' | 'video_ready' | 'published'
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [tab, setTab] = useState<'submissions' | 'episodes'>('submissions')
  const [loading, setLoading] = useState(false)
  const [storedPw, setStoredPw] = useState('')
  const [generating, setGenerating] = useState<string | null>(null)
  const [expandedScript, setExpandedScript] = useState<number | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('gary_admin_pw')
    if (saved) { setStoredPw(saved); setAuthed(true); loadDataWithPw(saved) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function authHeaders(pw: string) {
    return { 'Authorization': `Bearer ${pw}`, 'Content-Type': 'application/json' }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      sessionStorage.setItem('gary_admin_pw', password)
      setStoredPw(password)
      setAuthed(true)
      loadDataWithPw(password)
    } else {
      setAuthError('Incorrect password')
    }
  }

  async function loadDataWithPw(pw: string) {
    setLoading(true)
    const [subRes, epRes] = await Promise.all([
      fetch('/api/admin/submissions', { headers: authHeaders(pw) }),
      fetch('/api/admin/episodes', { headers: authHeaders(pw) }),
    ])
    if (subRes.ok) setSubmissions(await subRes.json())
    if (epRes.ok) setEpisodes(await epRes.json())
    setLoading(false)
  }

  async function loadData() {
    loadDataWithPw(storedPw)
  }

  async function generateScript() {
    setGenerating('script')
    const res = await fetch('/api/generate-script', { method: 'POST', headers: authHeaders(storedPw) })
    setGenerating(null)
    if (res.ok) { loadDataWithPw(storedPw); setTab('episodes') }
    else { const e = await res.json(); alert(`Script error: ${e.error}`) }
  }

  async function approveEpisode(id: number) {
    await fetch('/api/admin/episodes/approve', { method: 'POST', headers: authHeaders(storedPw), body: JSON.stringify({ episode_id: id }) })
    setEpisodes(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e))
  }

  async function generateAudio(id: number) {
    setGenerating(`audio-${id}`)
    const res = await fetch('/api/generate-audio', { method: 'POST', headers: authHeaders(storedPw), body: JSON.stringify({ episode_id: id }) })
    setGenerating(null)
    if (res.ok) loadDataWithPw(storedPw)
    else { const e = await res.json(); alert(`Audio error: ${e.error}`) }
  }

  async function generateVideo(id: number) {
    setGenerating(`video-${id}`)
    const res = await fetch('/api/generate-video', { method: 'POST', headers: authHeaders(storedPw), body: JSON.stringify({ episode_id: id }) })
    setGenerating(null)
    if (res.ok) loadDataWithPw(storedPw)
    else { const e = await res.json(); alert(`Video error: ${e.error}`) }
  }

  async function publishEpisode(id: number, platform: string) {
    setGenerating(`publish-${id}-${platform}`)
    const res = await fetch('/api/publish', { method: 'POST', headers: authHeaders(storedPw), body: JSON.stringify({ episode_id: id, platform }) })
    setGenerating(null)
    if (res.ok) loadDataWithPw(storedPw)
    else { const e = await res.json(); alert(`Publish error: ${e.error}`) }
  }

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-white/10 text-white/40',
    approved: 'bg-teal-900/40 text-teal-300',
    audio_ready: 'bg-blue-900/40 text-blue-300',
    video_ready: 'bg-purple-900/40 text-purple-300',
    published: 'bg-gold-500/20 text-yellow-300',
  }

  async function toggleUsed(id: number, used: boolean) {
    await fetch('/api/admin/submissions', {
      method: 'PATCH',
      headers: authHeaders(storedPw),
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-sm">{episodes.length} episode{episodes.length !== 1 ? 's' : ''}</p>
            <button
              onClick={generateScript}
              disabled={generating === 'script'}
              className="px-4 py-2 rounded-lg text-sm font-medium transition bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white"
            >
              {generating === 'script' ? 'Writing script…' : '+ Generate New Episode'}
            </button>
          </div>

          {episodes.map(ep => (
            <div key={ep.id} className="border border-white/15 bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-white text-sm">{ep.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[ep.status] ?? 'bg-white/10 text-white/40'}`}>
                      {ep.status}
                    </span>
                    <span className="text-white/25 text-xs">{new Date(ep.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
                <span className="text-white/20 text-xs shrink-0">#{ep.id}</span>
              </div>

              {/* Script preview */}
              {ep.script && (
                <div>
                  <button
                    onClick={() => setExpandedScript(expandedScript === ep.id ? null : ep.id)}
                    className="text-teal-400 text-xs hover:text-teal-300"
                  >
                    {expandedScript === ep.id ? 'Hide script ↑' : 'Preview script ↓'}
                  </button>
                  {expandedScript === ep.id && (
                    <p className="text-white/60 text-xs mt-2 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto border border-white/10 rounded-lg p-3 bg-black/20">
                      {ep.script}
                    </p>
                  )}
                </div>
              )}

              {/* Audio player */}
              {ep.audio_url && (
                <audio controls src={ep.audio_url} className="w-full h-8" />
              )}

              {/* Video preview */}
              {ep.video_url && (
                <video controls src={ep.video_url} className="w-full max-h-40 rounded-lg bg-black" />
              )}

              {/* Pipeline actions */}
              <div className="flex gap-2 flex-wrap pt-1">
                {ep.status === 'draft' && (
                  <button
                    onClick={() => approveEpisode(ep.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600/30 text-teal-300 hover:bg-teal-600/50 transition"
                  >
                    Approve script
                  </button>
                )}
                {ep.status === 'approved' && (
                  <button
                    onClick={() => generateAudio(ep.id)}
                    disabled={generating === `audio-${ep.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 disabled:opacity-40 transition"
                  >
                    {generating === `audio-${ep.id}` ? 'Generating audio…' : 'Generate audio'}
                  </button>
                )}
                {ep.status === 'audio_ready' && (
                  <button
                    onClick={() => generateVideo(ep.id)}
                    disabled={generating === `video-${ep.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 disabled:opacity-40 transition"
                  >
                    {generating === `video-${ep.id}` ? 'Generating video…' : 'Generate video'}
                  </button>
                )}
                {ep.status === 'video_ready' && (
                  <div className="flex gap-2 flex-wrap">
                    {['youtube', 'tiktok', 'instagram', 'reddit', 'discord'].map(p => (
                      <button
                        key={p}
                        onClick={() => publishEpisode(ep.id, p)}
                        disabled={!!generating?.startsWith(`publish-${ep.id}`)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white/60 hover:bg-white/15 disabled:opacity-40 transition capitalize"
                      >
                        {generating === `publish-${ep.id}-${p}` ? `Publishing…` : `→ ${p}`}
                      </button>
                    ))}
                  </div>
                )}
                {ep.published_at && (
                  <span className="text-yellow-400 text-xs self-center">
                    Published {new Date(ep.published_at).toLocaleDateString('en-GB')}
                  </span>
                )}
              </div>
            </div>
          ))}
          {episodes.length === 0 && (
            <p className="text-white/30 text-sm text-center py-12">No episodes yet. Click &quot;Generate New Episode&quot; to get started.</p>
          )}
        </div>
      )}
    </div>
  )
}
