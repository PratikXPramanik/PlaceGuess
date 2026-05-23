import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userApi, gameApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { scoreColor } from '../utils/geo'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([userApi.getMe(), gameApi.getHistory()])
      .then(([profileRes, historyRes]) => {
        setProfile(profileRes.data)
        setHistory(historyRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="font-mono text-white/30 text-sm animate-pulse">Loading profile...</div>
    </div>
  )

  const avg = profile?.averageScore ? Math.round(profile.averageScore) : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="tag mb-3">YOUR PROFILE</div>
        <h1 className="font-display text-6xl tracking-widest">
          {user?.username?.toUpperCase()}
        </h1>
      </div>

      {/* Stats grid */}
      {profile && (
        <div className="grid grid-cols-3 gap-0 border border-border divide-x divide-border mb-10">
          <StatCell label="Total Score" value={profile.totalScore?.toLocaleString()} color={scoreColor(avg)} />
          <StatCell label="Games Played" value={profile.gamesPlayed} />
          <StatCell label="Avg Score" value={avg.toLocaleString()} color={scoreColor(avg)} />
        </div>
      )}

      {/* Game history */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-widest text-white/70">GAME HISTORY</h2>
        <Link to="/game" className="btn-primary text-sm py-2 px-5 font-display tracking-widest">
          PLAY NOW
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="card p-8 text-center text-white/30 font-mono text-sm">
          No games yet. Start playing!
        </div>
      ) : (
        <div className="card divide-y divide-border">
          {history.map((game) => (
            <div key={game.gameId} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={game.status} />
                  <span className="font-mono text-xs text-white/30">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span
                className="font-display text-2xl tracking-wider"
                style={{ color: game.status === 'COMPLETED' ? scoreColor(game.totalScore / 5) : '#4b5563' }}
              >
                {game.totalScore?.toLocaleString() ?? '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCell({ label, value, color }) {
  return (
    <div className="p-5 bg-panel text-center">
      <div className="text-xs text-white/30 uppercase tracking-widest mb-2">{label}</div>
      <div className="font-display text-3xl tracking-wider" style={color ? { color } : {}}>
        {value ?? '—'}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    COMPLETED: 'text-green-400 border-green-900 bg-green-950/30',
    IN_PROGRESS: 'text-yellow-400 border-yellow-900 bg-yellow-950/30',
    ABANDONED: 'text-white/30 border-border bg-transparent',
  }
  return (
    <span className={`font-mono text-xs border px-2 py-0.5 ${map[status] ?? ''}`}>
      {status}
    </span>
  )
}
