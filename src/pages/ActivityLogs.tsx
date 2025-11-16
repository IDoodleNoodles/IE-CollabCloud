import React from 'react'
import { ActivityLogModel } from '../models'

export default function ActivityLogs() {
    const [logs, setLogs] = React.useState<any[]>(() => {
        const stored = localStorage.getItem('collab_activity_logs')
        return stored ? JSON.parse(stored) : []
    })

    function getActionIcon(actionType: string) {
        const icons: Record<string, string> = {
            'LOGIN': '🔐',
            'LOGOUT': '🚪',
            'CREATE_PROJECT': '📦',
            'UPLOAD_FILE': '📤',
            'DELETE_FILE': '🗑️',
            'EDIT_FILE': '✏️',
            'SAVE_VERSION': '💾',
            'ADD_COMMENT': '💬',
            'DELETE_COMMENT': '❌',
            'UPDATE_PROFILE': '👤',
            'CREATE_TOPIC': '🗣️',
        }
        return icons[actionType] || '📝'
    }

    function getTimeAgo(timestamp: number) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000)
        if (seconds < 60) return 'just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        return `${Math.floor(seconds / 86400)}d ago`
    }

    function clearLogs() {
        if (!confirm('Clear all activity logs? This cannot be undone.')) return
        localStorage.setItem('collab_activity_logs', '[]')
        setLogs([])
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>Activity Logs</h2>
                    <p className="text-muted">Track all system activities and user actions</p>
                </div>
                {logs.length > 0 && (
                    <button className="danger" onClick={clearLogs}>Clear Logs</button>
                )}
            </div>

            {logs.length === 0 ? (
                <div className="empty-state">
                    <div style={{ fontSize: '4rem' }}>📊</div>
                    <h3>No activity logs yet</h3>
                    <p className="text-muted">Activity logs will appear here as you use the application</p>
                </div>
            ) : (
                <div className="list">
                    {logs.map((log: any) => (
                        <div key={log.activityID} className="card">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '2rem', flexShrink: 0 }}>
                                    {getActionIcon(log.actionType)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <h4 style={{ marginBottom: 0 }}>{log.actionType.replace(/_/g, ' ').toLowerCase()}</h4>
                                        <span className="text-muted text-sm">
                                            {getTimeAgo(log.timestamp)}
                                        </span>
                                    </div>
                                    {log.actionDetails && (
                                        <p className="text-muted" style={{ marginBottom: '0.5rem' }}>{log.actionDetails}</p>
                                    )}
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        {log.userID && <span className="badge">User: {log.userID}</span>}
                                        <span className="badge primary">{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
