import { useState, useEffect, useRef } from 'react'
import { gameApi } from '../services/api'
import { useGameStore } from '../store/gameStore'
import GuessMap from '../components/game/GuessMap'
import RoundResult from '../components/game/RoundResult'
import GameOver from '../components/game/GameOver'

const DEFAULT_STREET_VIEW = { heading: 0, pitch: 0, fov: 90 }

export default function GamePage() {
  const {
    gameId, currentRound, totalRounds, totalScore,
    roundResults, status, currentRoundData, lastResult,
    setGame, setRoundResult, nextRound, finishGame, reset,
  } = useGameStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [streetView, setStreetView] = useState(DEFAULT_STREET_VIEW)
  const [streetViewFailed, setStreetViewFailed] = useState(false)
  const [streetViewSourceIndex, setStreetViewSourceIndex] = useState(0)
  const startTimeRef = useRef(null)

  // Auto-start a game on mount if idle
  useEffect(() => {
    if (status === 'idle') startGame()
    return () => { if (status === 'idle') reset() }
  }, [])

  const startGame = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await gameApi.start()
      setGame(res.data)
      startTimeRef.current = Date.now()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start game')
    } finally {
      setLoading(false)
    }
  }

  const handleGuess = async ({ lat, lng }) => {
    if (submitting || !gameId) return
    setSubmitting(true)
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000)
    try {
      const res = await gameApi.submitGuess({
        gameId,
        roundNumber: currentRound,
        guessedLat: lat,
        guessedLng: lng,
        timeTakenSeconds: timeTaken,
      })
      setRoundResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Guess failed')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    setStreetView(DEFAULT_STREET_VIEW)
    setStreetViewFailed(false)
    setStreetViewSourceIndex(0)
  }, [currentRoundData?.roundId, currentRound])

  const handleNext = async () => {
    if (currentRound >= totalRounds) {
      finishGame()
      return
    }

    const nextRoundPayload = lastResult?.nextRoundData ?? lastResult?.nextRound
    if (nextRoundPayload) {
      nextRound(nextRoundPayload)
      startTimeRef.current = Date.now()
      return
    }

    try {
      const res = await gameApi.getCurrentRound(gameId)
      nextRound(res.data)
      startTimeRef.current = Date.now()
    } catch {
      finishGame()
    }
  }

  const handlePlayAgain = () => {
    reset()
    startGame()
  }

  // ── States ────────────────────────────────────────────────────────────────

  if (loading) return <LoadingScreen />

  if (error) return (
    <div className="min-h-[80vh] flex items-center justify-center flex-col gap-4">
      <p className="text-red-400">{error}</p>
      <button onClick={startGame} className="btn-primary">Try Again</button>
    </div>
  )

  if (status === 'finished') return (
    <GameOver
      roundResults={roundResults}
      totalScore={totalScore}
      onPlayAgain={handlePlayAgain}
    />
  )

  if (status === 'idle') return null

  const streetViewSources = getStreetViewUrls(currentRoundData)
  const streetViewUrl = buildStreetViewUrl(streetViewSources[streetViewSourceIndex] ?? '', streetView)
  const showStreetView = Boolean(streetViewUrl) && !streetViewFailed

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      {/* HUD */}
      <div className="bg-panel border-b border-border px-4 py-2 flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 uppercase tracking-widest">Round</span>
          <span className="font-display text-2xl text-earth-400">
            {currentRound}<span className="text-white/20 text-lg">/{totalRounds}</span>
          </span>
        </div>

        {/* Round pips */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalRounds }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 transition-all duration-500 ${
                i < currentRound - 1
                  ? 'bg-earth-400'
                  : i === currentRound - 1
                  ? 'bg-earth-400/60'
                  : 'bg-border'
              }`}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-white/30 uppercase tracking-widest">Score</span>
          <span className="font-display text-2xl text-white">{totalScore.toLocaleString()}</span>
        </div>
      </div>

      {/* Main area: Street View | Map */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Street View panel */}
        <div className="flex-1 bg-black relative streetview-frame">
          {showStreetView ? (
            isEmbeddableStreetView(streetViewUrl) ? (
              <iframe
                key={streetViewUrl}
                src={streetViewUrl}
                title="Street View"
                className="w-full h-full border-0"
                allowFullScreen
                loading="eager"
              />
            ) : (
              <img
                key={streetViewUrl}
                src={streetViewUrl}
                alt="Street View"
                className="w-full h-full object-cover"
                onError={() => {
                  if (streetViewSourceIndex < streetViewSources.length - 1) {
                    setStreetViewSourceIndex((index) => index + 1)
                  } else {
                    setStreetViewFailed(true)
                  }
                }}
              />
            )
          ) : null}

          {/* Fallback for missing/invalid API key */}
          <div
            className="absolute inset-0 items-center justify-center flex-col gap-3 text-white/30"
            style={{ display: showStreetView ? 'none' : 'flex' }}
          >
            <span className="text-5xl">🌍</span>
            <p className="font-mono text-sm">Street View unavailable</p>
            <p className="font-mono text-xs">Check backend Street View image endpoint</p>
          </div>

          {showStreetView && !isEmbeddableStreetView(streetViewUrl) && (
            <StreetViewControls view={streetView} onChange={setStreetView} />
          )}

          {/* Location hint badge */}
          <div className="absolute bottom-4 left-4">
            <div className="tag">FIND THIS LOCATION</div>
          </div>
        </div>

        {/* Guess map panel */}
        <div className="w-[420px] border-l border-border flex flex-col relative">
          <GuessMap
            key={`${gameId}-${currentRound}`}
            onGuess={handleGuess}
            result={status === 'round_result' ? lastResult : null}
            disabled={status === 'round_result' || submitting}
          />

          {submitting && (
            <div className="absolute inset-0 bg-void/60 flex items-center justify-center">
              <div className="font-mono text-earth-400 text-sm animate-pulse">Submitting...</div>
            </div>
          )}
        </div>

        {/* Round result overlay */}
        {status === 'round_result' && lastResult && (
          <RoundResult
            result={lastResult}
            onNext={handleNext}
            isLastRound={currentRound >= totalRounds}
            totalScore={totalScore}
          />
        )}
      </div>
    </div>
  )
}

function StreetViewControls({ view, onChange }) {
  const rotate = (delta) => {
    onChange((current) => ({
      ...current,
      heading: (current.heading + delta + 360) % 360,
    }))
  }

  const tilt = (delta) => {
    onChange((current) => ({
      ...current,
      pitch: clamp(current.pitch + delta, -60, 60),
    }))
  }

  const zoom = (delta) => {
    onChange((current) => ({
      ...current,
      fov: clamp(current.fov + delta, 30, 110),
    }))
  }

  return (
    <div className="absolute right-4 top-4 flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-px bg-border border border-border shadow-xl">
        <StreetViewButton label="Look up" onClick={() => tilt(10)}>↑</StreetViewButton>
        <StreetViewButton label="Zoom in" onClick={() => zoom(-10)}>+</StreetViewButton>
        <StreetViewButton label="Look down" onClick={() => tilt(-10)}>↓</StreetViewButton>
        <StreetViewButton label="Turn left" onClick={() => rotate(-30)}>←</StreetViewButton>
        <StreetViewButton label="Reset view" onClick={() => onChange(DEFAULT_STREET_VIEW)}>•</StreetViewButton>
        <StreetViewButton label="Turn right" onClick={() => rotate(30)}>→</StreetViewButton>
      </div>
      <button
        type="button"
        title="Zoom out"
        onClick={() => zoom(10)}
        className="h-10 bg-panel/90 border border-border text-earth-400 font-display text-2xl hover:bg-earth-500 hover:text-void transition-colors"
      >
        -
      </button>
    </div>
  )
}

function StreetViewButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="w-10 h-10 bg-panel/90 text-earth-400 font-display text-2xl hover:bg-earth-500 hover:text-void transition-colors"
    >
      {children}
    </button>
  )
}

function getStreetViewUrls(roundData) {
  if (!roundData) return []
  if (typeof roundData === 'string') return [roundData]

  return uniqueUrls([
    roundData.streetViewUrl,
    roundData.streetViewURL,
    roundData.streetViewProxyUrl,
    roundData.streetViewDirectUrl,
    roundData.streetViewImageUrl,
    roundData.streetViewImageURL,
    roundData.streetviewUrl,
    roundData.streetviewImageUrl,
    roundData.streetView?.url,
    roundData.streetView?.imageUrl,
    roundData.imageUrl,
    roundData.imageURL,
    roundData.photoUrl,
    roundData.url,
  ])
}

function uniqueUrls(urls) {
  return [...new Set(urls.filter((url) => typeof url === 'string' && url.trim()))]
}

function buildStreetViewUrl(rawUrl, view) {
  if (!rawUrl) return ''

  try {
    const url = new URL(rawUrl, window.location.origin)
    url.searchParams.set('heading', String(view.heading))
    url.searchParams.set('pitch', String(view.pitch))
    url.searchParams.set('fov', String(view.fov))
    return url.toString()
  } catch {
    return rawUrl
  }
}

function isEmbeddableStreetView(url) {
  return /google\.[^/]+\/maps\/embed|\/embed\?/.test(url)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function LoadingScreen() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center flex-col gap-4">
      <div className="font-display text-4xl tracking-widest text-earth-400 animate-pulse-slow">
        LOADING LOCATION...
      </div>
      <div className="font-mono text-xs text-white/30">Dropping you somewhere on Earth</div>
    </div>
  )
}
