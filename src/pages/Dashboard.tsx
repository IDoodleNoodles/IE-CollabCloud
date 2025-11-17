import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../services/auth'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'

export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = React.useState({ projects: 0, versions: 0, comments: 0, topics: 0 })
    const profile = JSON.parse(localStorage.getItem('collab_profile') || '{}')
    
    // Get first name from profile or user object
    const fullName = profile.name || user?.name || ''
    const firstName = fullName ? fullName.split(' ')[0] : user?.email?.split('@')[0] || 'User'

    React.useEffect(() => {
        const projects = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const totalFiles = projects.reduce((sum: number, p: any) => sum + (p.files?.length || 0), 0)
        
        // Count unique collaborators across all projects
        const allCollaborators = new Set<string>()
        projects.forEach((p: any) => {
            const collabKey = `collab_project_${p.id}_collaborators`
            const projectCollabs = JSON.parse(localStorage.getItem(collabKey) || '[]')
            projectCollabs.forEach((c: any) => allCollaborators.add(c.email))
        })
        
        setStats({ 
            projects: projects.length, 
            versions: totalFiles, 
            comments: allCollaborators.size, 
            topics: 0 
        })
        ActivityLogger.log(ActivityTypes.VIEW_DASHBOARD, 'Viewed dashboard')
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
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
                        }}>Total Projects</h3>
                        <p style={{ 
                            color: '#64748b', 
                            fontSize: '0.875rem',
                            lineHeight: '1.5'
                        }}>All your projects in one place</p>
                    </div>
                    <div style={{ 
                        fontSize: '3rem', 
                        fontWeight: '700', 
                        background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: '1'
                    }}>{stats.projects}</div>
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
                        }}>Total Files</h3>
                        <p style={{ 
                            color: '#64748b', 
                            fontSize: '0.875rem',
                            lineHeight: '1.5'
                        }}>Files across all your projects</p>
                    </div>
                    <div style={{ 
                        fontSize: '3rem', 
                        fontWeight: '700', 
                        background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: '1'
                    }}>{stats.versions}</div>
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
                        }}>Collaborators</h3>
                        <p style={{ 
                            color: '#64748b', 
                            fontSize: '0.875rem',
                            lineHeight: '1.5'
                        }}>Team members across projects</p>
                    </div>
                    <div style={{ 
                        fontSize: '3rem', 
                        fontWeight: '700', 
                        background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: '1'
                    }}>{stats.comments}</div>
                </div>
            </div>

            {/* Recent Projects Section */}
            <RecentProjects />

            {/* About Section */}
            <div style={{ 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)', 
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid #e5e7eb',
                marginTop: '3rem'
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

// Recent Projects Component
function RecentProjects() {
    const [projects, setProjects] = React.useState<any[]>([])

    React.useEffect(() => {
        const allProjects = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        // Sort by most recently modified (assuming projects have a timestamp or we can use creation order)
        const recent = allProjects.slice(0, 4) // Show max 4 recent projects
        setProjects(recent)
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
        const activityLogs = JSON.parse(localStorage.getItem('collab_activity_logs') || '[]')
        const recent = activityLogs.slice(0, 8) // Show last 8 activities
        setActivities(recent)
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
