import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pg_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout when the backend rejects a protected request.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('pg_token')
      localStorage.removeItem('pg_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// ── Game ──────────────────────────────────────────────────────────────────────
export const gameApi = {
  start: () => api.post('/games/start'),
  getCurrentRound: (gameId) => api.get(`/games/${gameId}/round`),
  submitGuess: (data) => api.post('/games/guess', data),
  getHistory: () => api.get('/games/history'),
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
export const leaderboardApi = {
  getTop: (limit = 10) => api.get(`/leaderboard?limit=${limit}`),
}

// ── User ──────────────────────────────────────────────────────────────────────
export const userApi = {
  getMe: () => api.get('/users/me'),
}

export default api
