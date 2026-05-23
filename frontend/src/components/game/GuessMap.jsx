import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

// Fix Leaflet's default marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const GUESS_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;
    background:#d4a55a;
    border:3px solid #0a0d12;
    border-radius:50%;
    box-shadow:0 0 0 2px #d4a55a;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const ACTUAL_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;
    background:#4ade80;
    border:3px solid #0a0d12;
    border-radius:50%;
    box-shadow:0 0 0 2px #4ade80;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

export default function GuessMap({ onGuess, result, disabled }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const guessMarkerRef = useRef(null)
  const disabledRef = useRef(disabled)
  const [guessPos, setGuessPos] = useState(null)

  useEffect(() => {
    disabledRef.current = disabled
  }, [disabled])

  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    mapInstanceRef.current = map
    const initialResizeTimers = [0, 150, 400].map((delay) =>
      window.setTimeout(() => map.invalidateSize(), delay)
    )

    map.on('click', (e) => {
      if (disabledRef.current) return
      const { lat, lng } = e.latlng

      // Update or add guess marker
      if (guessMarkerRef.current) {
        guessMarkerRef.current.setLatLng([lat, lng])
      } else {
        guessMarkerRef.current = L.marker([lat, lng], { icon: GUESS_ICON }).addTo(map)
      }

      setGuessPos({ lat, lng })
    })

    return () => {
      initialResizeTimers.forEach(window.clearTimeout)
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !mapRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(mapRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const resizeTimers = [0, 100, 300].map((delay) =>
      window.setTimeout(() => map.invalidateSize(), delay)
    )

    return () => resizeTimers.forEach(window.clearTimeout)
  }, [disabled, result])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || result) return

    setGuessPos(null)
    map.setView([20, 0], 2)
    if (guessMarkerRef.current) {
      map.removeLayer(guessMarkerRef.current)
      guessMarkerRef.current = null
    }
  }, [result])

  // Show result overlay (actual location + line)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !result) return

    const coords = getResultCoords(result)
    if (!coords) return

    // Add actual location marker
    const actualMarker = L.marker([coords.actualLat, coords.actualLng], {
      icon: ACTUAL_ICON,
    })
      .addTo(map)
      .bindPopup(`<b>${result.locationName}</b>`)
      .openPopup()

    // Draw dashed line
    const line = L.polyline(
      [
        [coords.guessedLat, coords.guessedLng],
        [coords.actualLat, coords.actualLng],
      ],
      { color: '#d4a55a', weight: 2, dashArray: '6 4', opacity: 0.8 }
    ).addTo(map)

    // Fit both markers
    const bounds = L.latLngBounds(
      [coords.actualLat, coords.actualLng],
      [coords.guessedLat, coords.guessedLng]
    )
    map.fitBounds(bounds, { padding: [60, 60] })

    return () => {
      map.removeLayer(actualMarker)
      map.removeLayer(line)
    }
  }, [result])

  return (
    <div className="relative h-full flex flex-col">
      {/* Map */}
      <div
        ref={mapRef}
        className={`flex-1 ${!disabled ? 'guess-mode' : ''}`}
        style={{ minHeight: 0 }}
      />

      {/* Confirm button */}
      {!disabled && (
        <div className="p-3 bg-panel border-t border-border flex items-center gap-3">
          {guessPos ? (
            <span className="font-mono text-xs text-white/40 flex-1">
              {guessPos.lat.toFixed(4)} deg, {guessPos.lng.toFixed(4)} deg
            </span>
          ) : (
            <span className="text-xs text-white/30 flex-1">Click the map to place your guess</span>
          )}
          <button
            disabled={!guessPos}
            onClick={() => guessPos && onGuess(guessPos)}
            className="btn-primary text-sm disabled:opacity-30 disabled:cursor-not-allowed py-2 px-5 font-display tracking-widest"
          >
            SUBMIT GUESS
          </button>
        </div>
      )}
    </div>
  )
}

function getResultCoords(result) {
  const actualLat = toNumber(result.actualLat ?? result.actualLatitude)
  const actualLng = toNumber(result.actualLng ?? result.actualLongitude)
  const guessedLat = toNumber(result.guessedLat ?? result.guessedLatitude)
  const guessedLng = toNumber(result.guessedLng ?? result.guessedLongitude)

  if ([actualLat, actualLng, guessedLat, guessedLng].some((value) => value === null)) {
    return null
  }

  return { actualLat, actualLng, guessedLat, guessedLng }
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}
