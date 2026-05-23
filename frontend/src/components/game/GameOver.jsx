import { Link } from 'react-router-dom'
import { scoreColor, formatDistance } from '../../utils/geo'

export default function GameOver({ roundResults, totalScore, onPlayAgain }) {
  const maxScore = roundResults.length * 5000
  const pct = Math.round((totalScore / maxScore) * 100)

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="tag mb-4">GAME COMPLETE</div>
          <h1 className="font-display text-7xl tracking-widest mb-2">
            <span style={{ color: scoreColor(totalScore / roundResults.length) }}>
              {totalScore.toLocaleString()}
            </span>
          </h1>
          <p className="text-white/40 font-mono text-sm">
            {pct}% of maximum {maxScore.toLocaleString()} pts
          </p>

          {/* Grand total bar */}
          <div className="h-1 bg-border mt-4 overflow-hidden">
            <div
              className="h-full score-bar-fill"
              style={{
                width: `${pct}%`,
                backgroundColor: scoreColor(totalScore / roundResults.length),
              }}
            />
          </div>
        </div>

        {/* Per-round breakdown */}
        <div className="card divide-y divide-border mb-8">
          {roundResults.map((r, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <span className="font-mono text-xs text-white/30 w-6">R{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{r.locationName ?? 'Unknown'}</div>
                <div className="font-mono text-xs text-white/30">{formatDistance(r.distanceKm)}</div>
              </div>
              <span
                className="font-display text-2xl tracking-wider"
                style={{ color: scoreColor(r.score) }}
              >
                {r.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onPlayAgain} className="btn-primary flex-1 font-display text-xl tracking-widest">
            PLAY AGAIN
          </button>
          <Link to="/leaderboard" className="btn-ghost flex-1 text-center font-display tracking-widest">
            LEADERBOARD
          </Link>
        </div>
      </div>
    </div>
  )
}
