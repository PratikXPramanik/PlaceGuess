import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.register(form)
      const { accessToken, username, userId, email } = res.data
      login({ username, userId, email }, accessToken)
      navigate('/game')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="tag mb-3">CREATE ACCOUNT</div>
          <h1 className="font-display text-5xl tracking-widest">
            SIGN <span className="text-earth-400">UP</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Username</label>
            <input
              className="input-field"
              placeholder="explorer_42"
              value={form.username}
              onChange={set('username')}
              minLength={3}
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="min. 6 characters"
              value={form.password}
              onChange={set('password')}
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="border border-red-900 bg-red-950/50 text-red-400 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full font-display text-xl tracking-widest disabled:opacity-50"
          >
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-earth-400 hover:text-earth-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
