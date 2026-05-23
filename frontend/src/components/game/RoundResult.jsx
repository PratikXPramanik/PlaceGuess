import { scoreColor, scoreLabel, formatDistance } from '../../utils/geo'

export default function RoundResult({ result, onNext, isLastRound, totalScore }) {
  const color = scoreColor(result.score)
  const label = scoreLabel(result.score)
  const pct = Math.round((result.score / 5000) * 100)

  return (
    <div className="absolute bottom-5 left-5 z-20 w-[min(420px,calc(100%-2.5rem))] pointer-events-none">
      <div className="card p-6 animate-score-pop shadow-2xl shadow-black/40 pointer-events-auto">
        {/* Score label */}
        <div
          className="font-display text-4xl tracking-widest text-center mb-2"
          style={{ color }}
        >
          {label}
        </div>

        {/* Points */}
        <div className="text-center mb-6">
          <span className="font-display text-6xl tracking-wider" style={{ color }}>
            {result.score.toLocaleString()}
          </span>
          <span className="text-white/30 font-mono text-sm ml-2">pts</span>
        </div>

        {/* Score bar */}
        <div className="h-1 bg-border mb-6 overflow-hidden">
          <div
            className="h-full score-bar-fill"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox label="Distance" value={formatDistance(result.distanceKm)} />
          <StatBox label="Location" value={result.locationName?.split(',')[0] ?? '-'} />
          {result.timeTakenSeconds && (
            <StatBox label="Time" value={`${result.timeTakenSeconds}s`} />
          )}
          <StatBox label="Total Score" value={totalScore.toLocaleString()} />
        </div>

        <button
          onClick={onNext}
          className="btn-primary w-full font-display text-xl tracking-widest"
        >
          {isLastRound ? 'SEE FINAL RESULTS' : 'NEXT ROUND ->'}
        </button>
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="bg-void border border-border p-3">
      <div className="text-xs text-white/30 uppercase tracking-widest mb-1">{label}</div>
      <div className="font-mono text-sm text-white truncate">{value}</div>
    </div>
  )
}
