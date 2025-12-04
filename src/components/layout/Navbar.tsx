import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import api from '../../services/api'

export const Navbar = React.memo(() => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
        }
    }

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            logout()
            navigate('/auth')
        }
    }

    const [profile, setProfile] = useState<any>(null)
    React.useEffect(() => {
        let mounted = true
        api.getProfile().then(p => { if (mounted) setProfile(p) }).catch(() => {})
        return () => { mounted = false }
    }, [])

    const getDisplayName = () => {
        const fullName = profile?.name || user?.name || ''
        return fullName ? fullName.split(' ')[0] : user?.email?.split('@')[0] || 'User'
    }

    return (
        <div style={{
            height: '70px',
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'fixed',
            top: 0,
            left: '250px',
            right: 0,
            zIndex: 100
        }}>
            <form 
                onSubmit={handleSearch}
                style={{ 
                    flex: 1,
                    maxWidth: '500px',
                    margin: '0 auto'
                }}
            >
                <input
                    type="search"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1.25rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        background: 'white',
                        transition: 'all 0.2s'
                    }}
                    aria-label="Search files"
                />
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    {getDisplayName()}
                </span>
                <button 
                    className="secondary"
                    onClick={handleLogout}
                    style={{ 
                        padding: '0.625rem 1.25rem',
                        fontSize: '0.9rem'
                    }}
                >
                    Log out
                </button>
            </div>
        </div>
    )
})

Navbar.displayName = 'Navbar'
