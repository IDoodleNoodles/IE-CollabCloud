import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../services/auth'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'
import api from '../services/api'

export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = React.useState({ projects: 0, versions: 0, comments: 0, topics: 0 })
    const profile = JSON.parse(localStorage.getItem('collab_profile') || '{}')

    const fullName = profile.name || user?.name || ''
    const firstName = fullName ? fullName.split(' ')[0] : user?.email?.split('@')[0] || 'User'

    React.useEffect(() => {
        // Fetch data from API instead of localStorage
        Promise.all([
            api.getProjects(),
            api.listVersions(),
            api.getComments()
        ]).then(([projects, versions, comments]) => {
            setStats({
                projects: projects.length,
                versions: versions.length,
                comments: comments.length,
                topics: 0
            })
            ActivityLogger.log(ActivityTypes.VIEW_DASHBOARD, 'Viewed dashboard')
        }).catch(err => {
            console.error('[Dashboard] Failed to fetch stats:', err)
            // Fallback to localStorage if API fails
            const projects = JSON.parse(localStorage.getItem('collab_projects') || '[]')
            const versions = JSON.parse(localStorage.getItem('collab_versions') || '[]')
            const comments = JSON.parse(localStorage.getItem('collab_comments') || '[]')
            setStats({ projects: projects.length, versions: versions.length, comments: comments.length, topics: 0 })
        })
    }, [])

    return (
        <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2.5rem 2rem'
        }}>
            {/* Header Section */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.25rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #1e88e5 0%, #2196f3 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            marginBottom: '0.5rem',
                            letterSpacing: '-0.5px'
                        }}>
                            Welcome to CollabCloud
                        </h1>
                        <p style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: '400' }}>
                            {user ? `Hello, ${firstName}! Ready to collaborate?` : 'A beginner-friendly platform for all your projects'}
                        </p>
                    </div>
                    <Link to="/projects?action=upload" style={{ textDecoration: 'none' }}>
                        <button style={{
                            background: 'linear-gradient(135deg, #1e88e5 0%, #2196f3 100%)',
                            color: 'white',
                            padding: '0.875rem 1.75rem',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)'
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)'
                            }}>
                            New Project
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid" style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.75rem',
                marginBottom: '3rem'
            }}>
                <div className="dashboard-card" style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(33, 150, 243, 0.15)'
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                    }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '0.5rem'
                        }}>Projects</h3>
                        <p style={{
                            color: '#64748b',
                            fontSize: '0.875rem',
                            lineHeight: '1.5'
                        }}>Upload and manage all your project files in one place</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            lineHeight: '1'
                        }}>{stats.projects}</div>
                        <Link to="/projects" style={{ textDecoration: 'none' }}>
                            <button style={{
                                background: '#f1f5f9',
                                color: '#1e88e5',
                                padding: '0.625rem 1.25rem',
                                borderRadius: '10px',
                                border: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#e0f2fe'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = '#f1f5f9'
                                }}>
                                View All
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="dashboard-card" style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(33, 150, 243, 0.15)'
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                    }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '0.5rem'
                        }}>Versions</h3>
                        <p style={{
                            color: '#64748b',
                            fontSize: '0.875rem',
                            lineHeight: '1.5'
                        }}>Track changes and restore previous versions easily</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            lineHeight: '1'
                        }}>{stats.versions}</div>
                        <Link to="/versions" style={{ textDecoration: 'none' }}>
                            <button style={{
                                background: '#f1f5f9',
                                color: '#1e88e5',
                                padding: '0.625rem 1.25rem',
                                borderRadius: '10px',
                                border: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#e0f2fe'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = '#f1f5f9'
                                }}>
                                See All
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="dashboard-card" style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(33, 150, 243, 0.15)'
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
                    }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '0.5rem'
                        }}>Comments</h3>
                        <p style={{
                            color: '#64748b',
                            fontSize: '0.875rem',
                            lineHeight: '1.5'
                        }}>Share feedback and collaborate with your team</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            lineHeight: '1'
                        }}>{stats.comments}</div>
                        <Link to="/comments" style={{ textDecoration: 'none' }}>
                            <button style={{
                                background: '#f1f5f9',
                                color: '#1e88e5',
                                padding: '0.625rem 1.25rem',
                                borderRadius: '10px',
                                border: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#e0f2fe'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = '#f1f5f9'
                                }}>
                                View All
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div style={{
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid #e5e7eb'
            }}>
                <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '1rem'
                }}>About CollabCloud</h4>
                <p style={{ color: '#475569', lineHeight: '1.75', fontSize: '0.9rem' }}>
                    CollabCloud is designed to be more inclusive and user-friendly than traditional platforms.
                    Whether you're working on code, documents, designs, or notes, we make it easy to share,
                    collaborate, and store your work in one place. Perfect for students, beginners, and hobbyists!
                </p>
            </div>
        </div>
    )
}
