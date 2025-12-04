import React from 'react'
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import EditProject from './pages/EditProject'
import Editor from './pages/Editor'
import Profile from './pages/Profile'
import ActivityLogs from './pages/ActivityLogs'
import Search from './pages/Search'
import { useAuth } from './services/auth'
import api from './services/api'
import { ActivityLogger, ActivityTypes } from './services/activityLogger'

export default function App() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = React.useState('')
    const [profile, setProfile] = React.useState<any>(null)

    React.useEffect(() => {
        console.log('[App] Current user session:', user)
    }, [user])

    // Fetch profile when navigating to profile page or on mount
    React.useEffect(() => {
        let mounted = true
        async function loadProfile() {
            try {
                const p = await api.getProfile()
                if (mounted) setProfile(p)
            } catch (err) {
                console.warn('[App] Failed to load profile', err)
                if (mounted) setProfile(null)
            }
        }
        if (location.pathname === '/profile' || !profile) {
            loadProfile()
        }
        return () => { mounted = false }
    }, [location.pathname])

    // Redirect to auth if not logged in and trying to access protected routes
    React.useEffect(() => {
        const publicRoutes = ['/auth']
        if (!user && !publicRoutes.includes(location.pathname)) {
            navigate('/auth')
        }
    }, [user, location.pathname, navigate])

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

    // If not logged in, only show auth page
    if (!user) {
        return (
            <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        )
    }

    return (
        <div className="app">
            {user && (
                <nav style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem 2rem',
                    background: 'white',
                    borderBottom: '1px solid #E5E7EB',
                    boxShadow: 'none',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <form onSubmit={handleSearch} style={{ width: '580px' }}>
                        <div style={{ position: 'relative' }}>
                            <svg 
                                style={{
                                    position: 'absolute',
                                    left: '1.125rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }}
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="#9CA3AF" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input 
                                type="search" 
                                placeholder="Search files..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '0.75rem 1rem 0.75rem 2.75rem', 
                                    borderRadius: '28px', 
                                    border: '1px solid #DADCE0',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    background: 'white',
                                    color: '#5F6368'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.boxShadow = '0 1px 6px rgba(32, 33, 36, 0.1)'
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            />
                        </div>
                    </form>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', position: 'absolute', right: '2rem' }}>
                        <span style={{
                            fontSize: '0.9375rem',
                            color: '#5F6368',
                            fontWeight: '500'
                        }}>
                            {profile?.name || user?.name || user?.email?.split('@')[0] || 'User'}
                        </span>
                        <button style={{
                            padding: '0.625rem 1.25rem',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            background: 'white',
                            color: '#5F6368',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#F9FAFB'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                        }}
                        onClick={handleLogout}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Log out
                        </button>
                    </div>
                </nav>
            )}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {user && (
                    <aside style={{
                        width: '260px',
                        background: 'white',
                        borderRight: '1px solid #E5E7EB',
                        padding: '2rem 1.25rem',
                        overflowY: 'auto'
                    }}>
                        <Link to="/" style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: '#4285F4',
                            textDecoration: 'none',
                            display: 'block',
                            marginBottom: '2.5rem',
                            paddingLeft: '0.75rem'
                        }}>
                            CollabCloud
                        </Link>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <Link to="/" style={{
                                padding: '0.75rem 0.875rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: location.pathname === '/' ? '#4285F4' : '#5F6368',
                                transition: 'all 0.2s',
                                background: location.pathname === '/' ? '#E8F0FE' : 'transparent',
                                fontWeight: location.pathname === '/' ? '600' : '500',
                                fontSize: '0.9375rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            onMouseOver={(e) => {
                                if (location.pathname !== '/') {
                                    e.currentTarget.style.background = '#f8fafc'
                                }
                            }}
                            onMouseOut={(e) => {
                                if (location.pathname !== '/') {
                                    e.currentTarget.style.background = 'transparent'
                                }
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                                Dashboard
                            </Link>
                            <Link to="/projects?action=upload" style={{
                                padding: '0.75rem 0.875rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: location.pathname === '/projects' && location.search.includes('upload') ? '#4285F4' : '#5F6368',
                                transition: 'all 0.2s',
                                background: location.pathname === '/projects' && location.search.includes('upload') ? '#E8F0FE' : 'transparent',
                                fontWeight: location.pathname === '/projects' && location.search.includes('upload') ? '600' : '500',
                                fontSize: '0.9375rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            onMouseOver={(e) => {
                                if (!(location.pathname === '/projects' && location.search.includes('upload'))) {
                                    e.currentTarget.style.background = '#f8fafc'
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!(location.pathname === '/projects' && location.search.includes('upload'))) {
                                    e.currentTarget.style.background = 'transparent'
                                }
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                Upload Project
                            </Link>
                            <Link to="/projects" style={{
                                padding: '0.75rem 0.875rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: location.pathname === '/projects' && !location.search.includes('upload') ? '#4285F4' : '#5F6368',
                                transition: 'all 0.2s',
                                background: location.pathname === '/projects' && !location.search.includes('upload') ? '#E8F0FE' : 'transparent',
                                fontWeight: location.pathname === '/projects' && !location.search.includes('upload') ? '600' : '500',
                                fontSize: '0.9375rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            onMouseOver={(e) => {
                                if (!(location.pathname === '/projects' && !location.search.includes('upload'))) {
                                    e.currentTarget.style.background = '#f8fafc'
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!(location.pathname === '/projects' && !location.search.includes('upload'))) {
                                    e.currentTarget.style.background = 'transparent'
                                }
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                                </svg>
                                View Projects
                            </Link>
                            <Link to="/activity" style={{
                                padding: '0.75rem 0.875rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: location.pathname === '/activity' ? '#4285F4' : '#5F6368',
                                transition: 'all 0.2s',
                                background: location.pathname === '/activity' ? '#E8F0FE' : 'transparent',
                                fontWeight: location.pathname === '/activity' ? '600' : '500',
                                fontSize: '0.9375rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            onMouseOver={(e) => {
                                if (location.pathname !== '/activity') {
                                    e.currentTarget.style.background = '#f8fafc'
                                }
                            }}
                            onMouseOut={(e) => {
                                if (location.pathname !== '/activity') {
                                    e.currentTarget.style.background = 'transparent'
                                }
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                </svg>
                                Activity Logs
                            </Link>
                            <Link to="/profile" style={{
                                padding: '0.75rem 0.875rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: location.pathname === '/profile' ? '#4285F4' : '#5F6368',
                                transition: 'all 0.2s',
                                background: location.pathname === '/profile' ? '#E8F0FE' : 'transparent',
                                fontWeight: location.pathname === '/profile' ? '600' : '500',
                                fontSize: '0.9375rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            onMouseOver={(e) => {
                                if (location.pathname !== '/profile') {
                                    e.currentTarget.style.background = '#f8fafc'
                                }
                            }}
                            onMouseOut={(e) => {
                                if (location.pathname !== '/profile') {
                                    e.currentTarget.style.background = 'transparent'
                                }
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                Manage Profile
                            </Link>
                        </nav>
                    </aside>
                )}
                <div className="content-wrapper" style={{ flex: 1, overflow: 'auto', background: '#F0F4F9' }}>
                    <Routes>
                    <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
                    <Route path="/" element={user ? <Dashboard /> : <Navigate to="/auth" replace />} />
                    <Route path="/projects" element={user ? <Projects /> : <Navigate to="/auth" replace />} />
                    <Route path="/projects/:id" element={user ? <ProjectDetail /> : <Navigate to="/auth" replace />} />
                    <Route path="/projects/:id/edit" element={user ? <EditProject /> : <Navigate to="/auth" replace />} />
                    <Route path="/editor/:projectId/:fileId" element={user ? <Editor /> : <Navigate to="/auth" replace />} />
                    <Route path="/search" element={user ? <Search /> : <Navigate to="/auth" replace />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" replace />} />
                    <Route path="/activity" element={user ? <ActivityLogs /> : <Navigate to="/auth" replace />} />
                    <Route path="*" element={<Navigate to={user ? "/" : "/auth"} replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    )
}
