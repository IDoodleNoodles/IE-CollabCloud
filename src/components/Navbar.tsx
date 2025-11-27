import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/auth'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [profile, setProfile] = React.useState<any>(
    () => JSON.parse(localStorage.getItem('collab_profile') || '{}')
  )

  React.useEffect(() => {
    if (location.pathname === '/profile') {
      setProfile(JSON.parse(localStorage.getItem('collab_profile') || '{}'))
    }
  }, [location.pathname])

  const handleLogout = () => {
    if (globalThis.confirm('Are you sure you want to log out?')) {
      ActivityLogger.log(ActivityTypes.LOGOUT, 'User logged out')
      logout()
      navigate('/auth')
      alert('You have been logged out successfully')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  if (!user) return null

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1rem 2rem', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 700, textDecoration: 'none' }}>
        CollabCloud
      </Link>

      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 500 }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          style={{ width: '100%', padding: '0.7rem' }}
        />
      </form>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/profile">
          {profile.name || user.name || user.email}
        </Link>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </nav>
  )
}
