import { useState, useEffect } from 'react'
import { leaderboardApi } from '../services/api'
import { scoreColor } from '../utils/geo'

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    leaderboardApi.getTop(20)
      .then(res => setEntries(res.data))
      .catch(() => setError('Could not load leaderboard'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="tag mb-3">GLOBAL RANKINGS</div>
        <h1 className="font-display text-6xl tracking-widest">
          LEADER<span className="text-earth-400">BOARD</span>
        </h1>
        <p className="text-white/30 text-sm mt-2 font-mono">Updated every 5 minutes</p>
      </div>

      {loading && (
        <div className="text-white/30 font-mono text-sm animate-pulse">Loading rankings...</div>
      )}

      {error && (
        <div className="text-red-400 font-mono text-sm">{error}</div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="text-white/30 font-mono text-sm">
          No players yet — be the first to play!
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="card divide-y divide-border">
          {/* Column headers */}
          <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] gap-4 px-5 py-3 text-xs text-white/30 uppercase tracking-widest">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">Games</span>
            <span className="text-right">Avg</span>
            <span className="text-right">Total</span>
          </div>

          {entries.map((entry, i) => (
            <div
              key={entry.userId}
              className="grid grid-cols-[2rem_1fr_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-white/2 transition-colors"
            >
              {/* Rank */}
              <span className="font-mono text-sm">
                {i < 3 ? MEDALS[i] : <span className="text-white/30">{entry.rank}</span>}
              </span>

              {/* Username */}
              <div>
                <span className="font-medium">{entry.username}</span>
              </div>

              {/* Games played */}
              <span className="font-mono text-sm text-white/40 text-right">
                {entry.gamesPlayed}
              </span>

              {/* Average */}
              <span className="font-mono text-sm text-white/40 text-right">
                {Math.round(entry.averageScore).toLocaleString()}
              </span>

              {/* Total score */}
              <span
                className="font-display text-xl tracking-wider text-right"
                style={{ color: scoreColor(entry.averageScore) }}
              >
                {entry.totalScore.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
