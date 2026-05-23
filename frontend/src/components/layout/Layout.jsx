import { Link, useNavigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border bg-panel/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <GlobeIcon className="w-6 h-6 text-earth-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-display text-2xl text-white tracking-widest">
              PLACE<span className="text-earth-400">GUESS</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <NavLink to="/leaderboard">Leaderboard</NavLink>

            {user ? (
              <>
                <NavLink to="/game">Play</NavLink>
                <NavLink to="/profile">{user.username}</NavLink>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-sm text-white/40 hover:text-white/80 transition-colors px-3 py-1"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link
                  to="/register"
                  className="ml-2 bg-earth-400 hover:bg-earth-300 text-void text-sm font-semibold px-4 py-1.5 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm text-white/60 hover:text-white px-3 py-1 transition-colors"
    >
      {children}
    </Link>
  )
}

function GlobeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
