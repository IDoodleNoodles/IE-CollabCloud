import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
    onNavigate?: () => void
}

const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/projects', label: 'View Projects', icon: '📁' },
    { path: '/activity', label: 'Activity Logs', icon: '📋' },
    { path: '/profile', label: 'Manage Profile', icon: '👤' }
]

export const Sidebar = React.memo<SidebarProps>(({ onNavigate }) => {
    const location = useLocation()

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/'
        if (path === '/projects') {
            return location.pathname === '/projects' && !location.search.includes('upload')
        }
        return location.pathname === path
    }

    return (
        <div style={{
            width: '250px',
            background: 'white',
            borderRight: '1px solid #e5e7eb',
            padding: '2rem 1rem',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            overflowY: 'auto'
        }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #1e88e5 0%, #2196f3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.5rem'
                }}>
                    CollabCloud
                </h2>
                <p className="text-muted text-sm" style={{ margin: 0 }}>
                    Collaborate with ease
                </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <p className="text-muted text-sm" style={{ 
                    fontWeight: '600', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.75rem'
                }}>
                    Quick Actions
                </p>
            </div>

            <nav>
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onNavigate}
                        style={{
                            padding: '0.875rem 0.75rem',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            color: isActive(item.path) ? '#1e88e5' : '#64748b',
                            transition: 'all 0.2s',
                            background: isActive(item.path) ? '#e3f2fd' : 'transparent',
                            fontWeight: isActive(item.path) ? '600' : '500',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '0.25rem'
                        }}
                        onMouseOver={(e) => {
                            if (!isActive(item.path)) {
                                e.currentTarget.style.background = '#f8fafc'
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isActive(item.path)) {
                                e.currentTarget.style.background = 'transparent'
                            }
                        }}
                    >
                        <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    )
})

Sidebar.displayName = 'Sidebar'
