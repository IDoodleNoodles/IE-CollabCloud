import React from 'react'
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Editor from './pages/Editor'
import Profile from './pages/Profile'
import ActivityLogs from './pages/ActivityLogs'
import Search from './pages/Search'
import Collaborators from './pages/Collaborators'
import { useAuth } from './services/auth'
import { ActivityLogger, ActivityTypes } from './services/activityLogger'

export default function App() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = React.useState('')
    const [profile, setProfile] = React.useState<any>(() => JSON.parse(localStorage.getItem('collab_profile') || '{}'))

    // Update profile when localStorage changes or when navigating to profile page
    React.useEffect(() => {
        if (location.pathname === '/profile') {
            setProfile(JSON.parse(localStorage.getItem('collab_profile') || '{}'))
        }
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
    if (!user && location.pathname !== '/auth') {
        return (
            <div className="app">
                <Routes>
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </div>
        )
    }

    return (
        <div className="app">
            {user && (
                <nav style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    padding: '1rem 2rem',
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                    <Link to="/" style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #1e88e5 0%, #2196f3 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textDecoration: 'none',
                        letterSpacing: '-0.5px'
                    }}>CollabCloud</Link>

                    <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '500px', margin: '0 auto' }}>
                        <input 
                            type="text" 
                            placeholder="Search files..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '0.875rem 1.5rem', 
                                borderRadius: '12px', 
                                border: '2px solid #cbd5e1',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                                background: 'white',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#2196f3'
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)'
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#cbd5e1'
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                    </form>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/profile" style={{
                            padding: '0.625rem 1rem',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            color: location.pathname === '/profile' ? '#1e88e5' : '#334155',
                            background: location.pathname === '/profile' ? '#e3f2fd' : 'transparent',
                            fontWeight: '500',
                            fontSize: '0.95rem'
                        }}>
                            {profile.name || user.name || user.email}
                        </Link>
                        <button style={{
                            padding: '0.625rem 1.25rem',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            background: 'white',
                            color: '#64748b',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f8fafc'
                            e.currentTarget.style.borderColor = '#cbd5e1'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                            e.currentTarget.style.borderColor = '#e5e7eb'
                        }}
                        onClick={handleLogout}>Log out</button>
                    </div>
                </nav>
            )}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {user && (
                    <aside style={{
                        width: '260px',
                        background: 'white',
                        borderRight: '1px solid #e5e7eb',
                        padding: '2rem 1.25rem',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ 
                            fontSize: '0.75rem', 
                            textTransform: 'uppercase', 
                            color: '#94a3b8', 
                            marginBottom: '1.25rem', 
                            paddingLeft: '0.75rem',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>Quick Actions</h3>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            <Link to="/" style={{
                                padding: '0.875rem 0.75rem',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                color: location.pathname === '/' ? '#1e88e5' : '#64748b',
                                transition: 'all 0.2s',
                                background: location.pathname === '/' ? '#e3f2fd' : 'transparent',
                                fontWeight: location.pathname === '/' ? '600' : '500',
                                fontSize: '0.95rem',
                                display: 'block'
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
                            }}>Dashboard</Link>
                            <Link to="/projects?action=upload" style={{
                                padding: '0.875rem 0.75rem',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                color: location.pathname === '/projects' && location.search.includes('upload') ? '#1e88e5' : '#64748b',
                                transition: 'all 0.2s',
                                background: location.pathname === '/projects' && location.search.includes('upload') ? '#e3f2fd' : 'transparent',
                                fontWeight: location.pathname === '/projects' && location.search.includes('upload') ? '600' : '500',
                                fontSize: '0.95rem',
                                display: 'block'
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
                            }}>Upload Project</Link>
                            <Link to="/projects" style={{
                                padding: '0.875rem 0.75rem',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                color: location.pathname === '/projects' && !location.search.includes('upload') ? '#1e88e5' : '#64748b',
                                transition: 'all 0.2s',
                                background: location.pathname === '/projects' && !location.search.includes('upload') ? '#e3f2fd' : 'transparent',
                                fontWeight: location.pathname === '/projects' && !location.search.includes('upload') ? '600' : '500',
                                fontSize: '0.95rem',
                                display: 'block'
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
                            }}>View Projects</Link>
                            <Link to="/activity" style={{
                                padding: '0.875rem 0.75rem',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                color: location.pathname === '/activity' ? '#1e88e5' : '#64748b',
                                transition: 'all 0.2s',
                                background: location.pathname === '/activity' ? '#e3f2fd' : 'transparent',
                                fontWeight: location.pathname === '/activity' ? '600' : '500',
                                fontSize: '0.95rem',
                                display: 'block'
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
                            }}>Activity Logs</Link>
                            <Link to="/profile" style={{
                                padding: '0.875rem 0.75rem',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                color: location.pathname === '/profile' ? '#1e88e5' : '#64748b',
                                transition: 'all 0.2s',
                                background: location.pathname === '/profile' ? '#e3f2fd' : 'transparent',
                                fontWeight: location.pathname === '/profile' ? '600' : '500',
                                fontSize: '0.95rem',
                                display: 'block'
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
                            }}>Manage Profile</Link>
                        </nav>
                    </aside>
                )}
                <div className="content-wrapper" style={{ flex: 1, overflow: 'auto' }}>
                    <Routes>
                    <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
                    <Route path="/" element={user ? <Dashboard /> : <Navigate to="/auth" replace />} />
                    <Route path="/projects" element={user ? <Projects /> : <Navigate to="/auth" replace />} />
                    <Route path="/projects/:id" element={user ? <ProjectDetail /> : <Navigate to="/auth" replace />} />
                    <Route path="/projects/:projectId/collaborators" element={user ? <Collaborators /> : <Navigate to="/auth" replace />} />
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
