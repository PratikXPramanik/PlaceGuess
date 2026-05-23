# PlaceGuess — Frontend

React + Vite + Tailwind CSS frontend for the PlaceGuess GeoGuesser-like game.

## Tech Stack

- **React 18** with React Router v6
- **Vite** (dev server + bundler)
- **Tailwind CSS** (utility-first styling)
- **Leaflet + react-leaflet** (interactive guess map)
- **Zustand** (auth + game state)
- **Axios** (API client with JWT interceptor)

## Prerequisites

- Node.js 18+
- PlaceGuess backend running on `http://localhost:8080`

## Setup

```bash
# Install dependencies
npm install

# Start dev server (proxies /api → localhost:8080)
npm run dev
```

Open `http://localhost:5173`

## Build for Production

```bash
npm run build
# Output in dist/
```

## Project Structure

```
src/
├── pages/
│   ├── HomePage.jsx        # Landing page
│   ├── LoginPage.jsx       # Auth
│   ├── RegisterPage.jsx    # Auth
│   ├── GamePage.jsx        # Main game (Street View + Map)
│   ├── LeaderboardPage.jsx # Global rankings
│   └── ProfilePage.jsx     # User stats + history
├── components/
│   ├── layout/Layout.jsx   # Navbar + Outlet
│   └── game/
│       ├── GuessMap.jsx    # Leaflet map for placing guesses
│       ├── RoundResult.jsx # Score reveal per round
│       └── GameOver.jsx    # Final results + breakdown
├── services/api.js         # Axios + all API calls
├── store/
│   ├── authStore.js        # Zustand auth (token + user)
│   └── gameStore.js        # Zustand game state
└── utils/geo.js            # Haversine, score colors, labels
```

## Game Flow

1. `POST /api/games/start` → get first round's Street View URL
2. User clicks map to place guess
3. `POST /api/games/guess` → receive score, distance, actual location
4. Round result overlay shows; map reveals dashed line to actual spot
5. Repeat for 5 rounds → game over screen with full breakdown

## Notes

- Vite dev server proxies `/api/*` to `http://localhost:8080` — no CORS issues
- JWT is stored in `localStorage` and auto-attached by the Axios interceptor
- Leaflet marker icons are patched for Vite compatibility (no asset hash issue)
- Street View images require a valid Google Maps API key in the backend
