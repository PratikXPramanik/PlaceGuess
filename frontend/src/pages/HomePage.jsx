import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const FACTS = [
  { icon: '🌍', label: 'Locations', value: '30+' },
  { icon: '🎯', label: 'Max Score', value: '25,000' },
  { icon: '📍', label: 'Rounds', value: '5 per game' },
  { icon: '⏱️', label: 'Max Distance', value: '5,000 km' },
]

export default function HomePage() {
  const { user } = useAuthStore()

  return (
    <div className="relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-earth-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-60 right-0 w-[400px] h-[400px] bg-ocean-700/10 blur-[100px] rounded-full" />
      </div>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 pt-24 pb-20 text-center">
        <div className="tag mb-6 animate-fade-up">BETA — FREE TO PLAY</div>

        <h1
          className="font-display text-[clamp(4rem,12vw,10rem)] leading-none text-white tracking-widest mb-6 animate-fade-up"
          style={{ animationDelay: '0.1s', opacity: 0 }}
        >
          WHERE IN THE<br />
          <span className="text-earth-400">WORLD?</span>
        </h1>

        <p
          className="text-white/50 text-lg max-w-xl mx-auto mb-10 animate-fade-up"
          style={{ animationDelay: '0.2s', opacity: 0 }}
        >
          Explore random Street Views from around the globe.
          Drop a pin. Score based on how close you get.
          Beat the leaderboard.
        </p>

        <div
          className="flex items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: '0.3s', opacity: 0 }}
        >
          <Link
            to={user ? '/game' : '/register'}
            className="btn-primary text-lg px-10 py-4 font-display tracking-widest text-xl"
          >
            {user ? 'PLAY NOW' : 'GET STARTED'}
          </Link>
          <Link to="/leaderboard" className="btn-ghost">
            View Leaderboard
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-panel/50">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border">
          {FACTS.map((f) => (
            <div key={f.label} className="text-center py-4 px-6">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="font-display text-3xl text-earth-400 tracking-wider">{f.value}</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-1">{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="font-display text-5xl tracking-widest text-center mb-16">
          HOW IT <span className="text-earth-400">WORKS</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-0 border border-border divide-x divide-border">
          {[
            {
              step: '01',
              title: 'VIEW',
              desc: 'A random Street View image drops you somewhere on Earth. Look for clues — signs, landscapes, architecture.',
              icon: '👁️',
            },
            {
              step: '02',
              title: 'GUESS',
              desc: 'Click anywhere on the world map to place your guess. The closer you are, the more points you earn.',
              icon: '📍',
            },
            {
              step: '03',
              title: 'SCORE',
              desc: 'Points decay exponentially with distance. A perfect guess nets 5,000 points. Beat all 5 rounds for glory.',
              icon: '🏆',
            },
          ].map((item) => (
            <div key={item.step} className="p-8 bg-panel/30 group hover:bg-panel/60 transition-colors">
              <div className="font-mono text-earth-700 text-xs mb-4">{item.step}</div>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-display text-3xl tracking-widest text-earth-400 mb-3">{item.title}</h3>
              <p className="text-white/50 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      {!user && (
        <section className="border-t border-border py-20 text-center">
          <h2 className="font-display text-4xl tracking-widest mb-4">
            READY TO <span className="text-earth-400">EXPLORE?</span>
          </h2>
          <p className="text-white/40 mb-8">Create a free account and start guessing.</p>
          <Link to="/register" className="btn-primary font-display text-xl tracking-widest px-12 py-4">
            JOIN NOW
          </Link>
        </section>
      )}
    </div>
  )
}
