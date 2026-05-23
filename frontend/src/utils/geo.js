const EARTH_RADIUS_KM = 6371

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg) { return (deg * Math.PI) / 180 }

export function scoreColor(score) {
  if (score >= 4000) return '#4ade80'
  if (score >= 2500) return '#facc15'
  if (score >= 1000) return '#fb923c'
  return '#f87171'
}

export function scoreLabel(score) {
  if (score >= 4500) return 'PERFECT'
  if (score >= 3500) return 'EXCELLENT'
  if (score >= 2000) return 'GOOD'
  if (score >= 500)  return 'NOT BAD'
  return 'KEEP TRYING'
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${Math.round(km).toLocaleString()} km`
}
