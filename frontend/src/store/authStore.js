import { create } from 'zustand'

const stored = localStorage.getItem('pg_user')

export const useAuthStore = create((set) => ({
  user: stored ? JSON.parse(stored) : null,
  token: localStorage.getItem('pg_token') || null,

  login: (userData, token) => {
    localStorage.setItem('pg_token', token)
    localStorage.setItem('pg_user', JSON.stringify(userData))
    set({ user: userData, token })
  },

  logout: () => {
    localStorage.removeItem('pg_token')
    localStorage.removeItem('pg_user')
    set({ user: null, token: null })
  },

  isAuthenticated: () => !!localStorage.getItem('pg_token'),
}))
