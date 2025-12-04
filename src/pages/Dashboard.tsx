import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../services/auth'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'
import api from '../services/api'

export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = React.useState({ projects: 0, files: 0, collaborators: 0 })
    const [profile, setProfile] = React.useState<any>(null)
    const [firstName, setFirstName] = React.useState('User')

    React.useEffect(() => {
        async function loadStats() {
            try {
                const [projects, files, profileData, activities] = await Promise.all([
                    api.getProjects(),
                    api.getFiles(),
                    api.getProfile().catch(() => ({})),
                    api.getActivityLogs().catch(() => [])
                ])
                const allCollaborators = new Set<string>()
                // If backend returns collaborators in projects, collect them
                projects.forEach((p: any) => {
                    (p.collaborators || []).forEach((c: any) => allCollaborators.add(c.email))
                })
                setStats({
                    projects: projects.length,
                    files: files.length,
                    collaborators: allCollaborators.size
                })
                setProfile(profileData)
                const fullName = (profileData as any)?.name || user?.name || ''
                setFirstName(fullName ? fullName.split(' ')[0] : user?.email?.split('@')[0] || 'User')
                ActivityLogger.log(ActivityTypes.VIEW_DASHBOARD, 'Viewed dashboard')
            } catch (err) {
                console.error('Error loading dashboard stats:', err)
                setStats({ projects: 0, files: 0, collaborators: 0 })
            }
        }
        loadStats()
    }, [])

    return (
        <div style={{
            maxWidth: '1300px',
            margin: '0 auto',
            padding: '2rem'
        }}>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2.5rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '600',
                        color: '#4285F4',
                        marginBottom: '0.5rem'
                    }}>
                        Welcome to CollabCloud
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#5F6368', margin: 0 }}>
                        Hello, {firstName}! Ready to collaborate?
                    </p>
                </div>
                <Link to="/projects?action=upload" style={{ textDecoration: 'none' }}>
                    <button style={{
                        background: '#4285F4',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#3367D6'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = '#4285F4'
                        }}>
                        <span style={{ fontSize: '1.25rem' }}>+</span>
                        New Project
                    </button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {/* Total Projects Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.75rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#5F6368',
                                marginBottom: '0.25rem'
                            }}>Total Projects</h3>
                            <p style={{
                                color: '#80868B',
                                fontSize: '0.8125rem',
                                margin: 0
                            }}>All your projects in one place</p>
                        </div>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: '#E8F0FE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#4285F4',
                        lineHeight: '1'
                    }}>{stats.projects}</div>
                </div>

                {/* Total Files Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.75rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#5F6368',
                                marginBottom: '0.25rem'
                            }}>Total Files</h3>
                            <p style={{
                                color: '#80868B',
                                fontSize: '0.8125rem',
                                margin: 0
                            }}>Files across all your projects</p>
                        </div>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: '#E8F0FE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                                <polyline points="13 2 13 9 20 9" />
                            </svg>
                        </div>
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#4285F4',
                        lineHeight: '1'
                    }}>{stats.files}</div>
                </div>

                {/* Collaborators Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.75rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#5F6368',
                                marginBottom: '0.25rem'
                            }}>Collaborators</h3>
                            <p style={{
                                color: '#80868B',
                                fontSize: '0.8125rem',
                                margin: 0
                            }}>Team members across projects</p>
                        </div>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: '#E8F0FE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#4285F4',
                        lineHeight: '1'
                    }}>{stats.collaborators}</div>
                </div>
            </div>

            {/* About Section */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                border: '1px solid #E5E7EB',
                marginTop: '2.5rem'
            }}>
                <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#202124',
                    marginBottom: '1rem'
                }}>About CollabCloud</h2>
                <p style={{ color: '#5F6368', lineHeight: '1.6', fontSize: '0.9375rem', margin: 0 }}>
                    CollabCloud is designed to be more inclusive and user-friendly than traditional platforms. Whether you're working on code, documents, designs, or notes, we make it easy to share, collaborate and store your work in one place. Perfect for students, beginners, and hobbyists!
                </p>
            </div>
        </div>
    )
}

// Recent Projects Component
function RecentProjects() {
    const [projects, setProjects] = React.useState<any[]>([])

    React.useEffect(() => {
        let mounted = true
        api.getProjects().then(allProjects => {
            if (!mounted) return
            const recent = (allProjects || []).slice(0, 4)
            setProjects(recent)
        }).catch(() => {})
        return () => { mounted = false }
    }, [])

    if (projects.length === 0) return null

    return (
        <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>Recent Projects</h3>
                <Link to="/projects" style={{ textDecoration: 'none', color: '#1e88e5', fontWeight: '600', fontSize: '0.95rem' }}>
                    View All →
                </Link>
            </div>
            <div className="grid" style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
            }}>
                {projects.map(project => (
                    <Link key={project.id} to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                        <div className="card" style={{
                            padding: '1.5rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            height: '100%'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(33, 150, 243, 0.15)'
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                            }}>
                            <div style={{
                                width: '100%',
                                height: '120px',
                                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem'
                            }}>
                                📁
                            </div>
                            <h4 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#1e293b',
                                marginBottom: '0.5rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>{project.name}</h4>
                            <p className="text-muted text-sm" style={{ marginBottom: '0.75rem' }}>
                                {project.files?.length || 0} {project.files?.length === 1 ? 'file' : 'files'}
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span className="badge primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                                    Open
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

// Recent Activity Component
function RecentActivity() {
    const [activities, setActivities] = React.useState<any[]>([])

    React.useEffect(() => {
        let mounted = true
        api.getActivityLogs().then(logs => { if (mounted) setActivities((logs || []).slice(0, 8)) }).catch(() => {})
        return () => { mounted = false }
    }, [])

    if (activities.length === 0) return null

    const getActivityIcon = (type: string) => {
        const icons: any = {
            'LOGIN': '🔐',
            'LOGOUT': '👋',
            'VIEW_DASHBOARD': '📊',
            'VIEW_PROJECTS': '📁',
            'CREATE_PROJECT': '➕',
            'DELETE_PROJECT': '🗑️',
            'UPLOAD_FILE': '📤',
            'EDIT_FILE': '✏️',
            'DELETE_FILE': '❌',
            'SAVE_VERSION': '💾',
            'ADD_COMMENT': '💬',
            'DELETE_COMMENT': '🗑️',
            'SEARCH': '🔍'
        }
        return icons[type] || '📝'
    }

    return (
        <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>Recent Activity</h3>
                <Link to="/activity" style={{ textDecoration: 'none', color: '#1e88e5', fontWeight: '600', fontSize: '0.95rem' }}>
                    View All →
                </Link>
            </div>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {activities.map((activity, idx) => (
                    <div
                        key={activity.id}
                        style={{
                            padding: '1rem 1.5rem',
                            borderBottom: idx < activities.length - 1 ? '1px solid #f1f5f9' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f8fafc'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                        }}
                    >
                        <div style={{
                            fontSize: '1.75rem',
                            flexShrink: 0
                        }}>
                            {getActivityIcon(activity.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                margin: 0,
                                color: '#1e293b',
                                fontSize: '0.9rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {activity.description}
                            </p>
                            <p className="text-muted text-xs" style={{ margin: '0.25rem 0 0 0' }}>
                                {new Date(activity.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Quick Actions Component
function QuickActionsCard() {
    return (
        <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem' }}>Quick Actions</h3>
            <div className="grid" style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem'
            }}>
                <Link to="/projects?action=upload" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 50%)'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(33, 150, 243, 0.15)'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📤</div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>Upload File</h4>
                    </div>
                </Link>

                <Link to="/projects" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #f3e5f5 0%, #f5f5f5 50%)'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(156, 39, 176, 0.15)'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>Browse Projects</h4>
                    </div>
                </Link>

                <Link to="/activity" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #e8f5e9 0%, #f5f5f5 50%)'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(76, 175, 80, 0.15)'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>View Activity</h4>
                    </div>
                </Link>

                <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #fff3e0 0%, #f5f5f5 50%)'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 152, 0, 0.15)'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👤</div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>Manage Profile</h4>
                    </div>
                </Link>
            </div>
        </div>
    )
}
