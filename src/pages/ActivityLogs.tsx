import React from 'react'
import { Link } from 'react-router-dom'
import { ActivityLogModel } from '../models'

export default function ActivityLogs() {
    const [logs, setLogs] = React.useState<any[]>([])

    React.useEffect(() => {
        let mounted = true
        fetch('/api/activity-logs').then(r => r.ok ? r.json() : []).then(data => { if (mounted) setLogs(data || []) }).catch(() => {})
        return () => { mounted = false }
    }, [])

    function getActionIcon(actionType: string): { icon: JSX.Element; bg: string; color: string } {
        const iconMap: Record<string, { icon: JSX.Element; bg: string; color: string }> = {
            'SHARE_PROJECT': {
                bg: '#D1FAE5',
                color: '#059669',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13.5 21c-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l5.3-5.3H1c-.6 0-1-.4-1-1s.4-1 1-1h17.1l-5.3-5.3c-.4-.4-.4-1 0-1.4s1-.4 1.4 0l7 7c.4.4.4 1 0 1.4l-7 7c-.2.2-.4.3-.7.3z"/>
                    </svg>
                )
            },
            'ADD_COMMENT': {
                bg: '#D1FAE5',
                color: '#059669',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                )
            },
            'CREATE_PROJECT': {
                bg: '#DBEAFE',
                color: '#2563EB',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                    </svg>
                )
            },
            'UPLOAD_FILE': {
                bg: '#DBEAFE',
                color: '#2563EB',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                    </svg>
                )
            },
            'MANAGE_COLLABORATORS': {
                bg: '#E9D5FF',
                color: '#9333EA',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                )
            },
            'UPDATE_COLLABORATORS': {
                bg: '#E9D5FF',
                color: '#9333EA',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                )
            },
            'SAVE_VERSION': {
                bg: '#FCE7F3',
                color: '#DB2777',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                )
            },
            'CREATE_VERSION': {
                bg: '#FCE7F3',
                color: '#DB2777',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                )
            },
            'VIEW_PROJECTS': {
                bg: '#E5E7EB',
                color: '#6B7280',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                )
            }
        }
        return iconMap[actionType] || {
            bg: '#E5E7EB',
            color: '#6B7280',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
            )
        }
    }

    function getActionBadge(actionType: string): { text: string; bg: string; color: string } {
        const badgeMap: Record<string, { text: string; bg: string; color: string }> = {
            'SHARE_PROJECT': { text: 'Share', bg: '#D1FAE5', color: '#059669' },
            'ADD_COMMENT': { text: 'Comment', bg: '#D1FAE5', color: '#059669' },
            'CREATE_PROJECT': { text: 'Upload', bg: '#DBEAFE', color: '#2563EB' },
            'UPLOAD_FILE': { text: 'Upload', bg: '#DBEAFE', color: '#2563EB' },
            'MANAGE_COLLABORATORS': { text: 'Collaborator', bg: '#E9D5FF', color: '#9333EA' },
            'UPDATE_COLLABORATORS': { text: 'Collaborator', bg: '#E9D5FF', color: '#9333EA' },
            'SAVE_VERSION': { text: 'Version', bg: '#FCE7F3', color: '#DB2777' },
            'CREATE_VERSION': { text: 'Version', bg: '#FCE7F3', color: '#DB2777' },
            'VIEW_PROJECTS': { text: 'Activity', bg: '#E5E7EB', color: '#6B7280' }
        }
        return badgeMap[actionType] || { text: 'Activity', bg: '#E5E7EB', color: '#6B7280' }
    }

    function getTimeAgo(timestamp: number) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(seconds / 3600)
        const days = Math.floor(seconds / 86400)
        
        if (seconds < 60) return 'just now'
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
        
        const date = new Date(timestamp)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    function clearLogs() {
        if (window.confirm('Clear all activity logs?')) {
            setLogs([])
            // Try deleting server-side logs if supported
            fetch('/api/activity-logs', { method: 'DELETE' }).catch(() => {})
        }
    }

    return (
        <div style={{ 
            padding: '2rem',
            minHeight: '100vh',
            backgroundColor: '#F9FAFB'
        }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ 
                        margin: 0, 
                        fontSize: '1.875rem', 
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '0.5rem'
                    }}>
                        Activity Logs
                    </h1>
                    <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#6B7280'
                    }}>
                        Chronological history of system events
                    </p>
                </div>
                <button 
                    onClick={clearLogs}
                    style={{
                        padding: '0.625rem 1.25rem',
                        backgroundColor: '#EF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
                >
                    Clear Logs
                </button>
            </div>

            {logs.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <svg 
                        width="64" 
                        height="64" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="#D1D5DB" 
                        strokeWidth="1.5"
                        style={{ margin: '0 auto 1rem' }}
                    >
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p style={{ 
                        margin: 0, 
                        fontSize: '1rem', 
                        color: '#6B7280',
                        fontWeight: '500'
                    }}>
                        No activity yet
                    </p>
                    <p style={{ 
                        margin: '0.5rem 0 0 0', 
                        fontSize: '0.875rem', 
                        color: '#9CA3AF'
                    }}>
                        Your activity history will appear here
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {logs.map((log, index) => {
                        const { icon, bg, color } = getActionIcon(log.actionType)
                        const badge = getActionBadge(log.actionType)
                        
                        return (
                            <div 
                                key={index} 
                                style={{ 
                                    backgroundColor: 'white',
                                    borderRadius: '0.75rem',
                                    padding: '1.25rem',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '1rem'
                                }}
                            >
                                {/* Left side: Icon + Content */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    {/* Circular Icon */}
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        backgroundColor: bg,
                                        color: color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {icon}
                                    </div>
                                    
                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ 
                                            fontSize: '0.9375rem',
                                            color: '#111827',
                                            marginBottom: '0.375rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{ fontWeight: '600' }}>
                                                {log.actionType.split('_').map((word: string) => 
                                                    word.charAt(0) + word.slice(1).toLowerCase()
                                                ).join(' ')}
                                            </span>
                                            <span style={{ color: '#D1D5DB' }}>•</span>
                                            <span style={{ color: '#6B7280' }}>
                                                {log.userName || 'User'}
                                            </span>
                                            <span style={{ color: '#D1D5DB' }}>•</span>
                                            <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                                                {getTimeAgo(log.timestamp)}
                                            </span>
                                            {log.projectName && (
                                                <>
                                                    <span style={{ color: '#D1D5DB' }}>•</span>
                                                    {log.projectId ? (
                                                        <Link 
                                                            to={`/projects/${log.projectId}`}
                                                            style={{
                                                                color: '#4285F4',
                                                                textDecoration: 'none',
                                                                fontSize: '0.875rem',
                                                                fontWeight: '500'
                                                            }}
                                                            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                                            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                                                        >
                                                            {log.projectName}
                                                        </Link>
                                                    ) : (
                                                        <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                                            {log.projectName}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {log.details && (
                                            <div style={{ 
                                                fontSize: '0.8125rem', 
                                                color: '#6B7280',
                                                lineHeight: '1.5'
                                            }}>
                                                {log.details}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Right side: Badge */}
                                <div style={{
                                    padding: '0.375rem 0.75rem',
                                    backgroundColor: badge.bg,
                                    color: badge.color,
                                    borderRadius: '9999px',
                                    fontSize: '0.8125rem',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}>
                                    {badge.text}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
