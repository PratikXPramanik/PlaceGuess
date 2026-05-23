import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GamePage from './pages/GamePage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('pg_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route
            path="game"
            element={<ProtectedRoute><GamePage /></ProtectedRoute>}
          />
          <Route
            path="profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
