import React from 'react'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'

export default function Forums() {
    const [topics, setTopics] = React.useState<any[]>(() => JSON.parse(localStorage.getItem('collab_forums') || '[]'))
    const [title, setTitle] = React.useState('')
    const [body, setBody] = React.useState('')
    const [showNewTopic, setShowNewTopic] = React.useState(false)

    function post() {
        if (!title.trim() || !body.trim()) {
            alert('Please fill in both title and body')
            return
        }
        const author = localStorage.getItem('collab_user') ? JSON.parse(localStorage.getItem('collab_user')!).email : 'Anonymous'
        const t = { id: 't_' + Date.now(), title, body, author, ts: Date.now(), replies: [] }
        const next = [t, ...topics]
        localStorage.setItem('collab_forums', JSON.stringify(next))
        setTopics(next)
        ActivityLogger.log(ActivityTypes.CREATE_TOPIC, `Created forum topic: ${title}`)
        setTitle('')
        setBody('')
        setShowNewTopic(false)
    }

    function remove(id: string, topicTitle: string) { 
        if (!confirm(`Delete topic "${topicTitle}"?`)) return
        const next = topics.filter(t => t.id !== id)
        setTopics(next)
        localStorage.setItem('collab_forums', JSON.stringify(next))
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>🗣️ Forums</h2>
                    <p className="text-muted">Discuss ideas and get help from the community</p>
                </div>
                <button className="success" onClick={() => setShowNewTopic(true)}>+ New Topic</button>
            </div>

            {showNewTopic && (
                <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(66, 165, 245, 0.05))' }}>
                    <h3>Create New Topic</h3>
                    <div className="divider"></div>
                    <div className="form-group">
                        <label>Topic Title</label>
                        <input 
                            placeholder="Enter a descriptive title" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            placeholder="Describe your topic in detail..." 
                            value={body} 
                            onChange={e => setBody(e.target.value)}
                            rows={5}
                        />
                    </div>
                    <div className="btn-group">
                        <button className="success" onClick={post} disabled={!title.trim() || !body.trim()}>📝 Post Topic</button>
                        <button className="secondary" onClick={() => { setShowNewTopic(false); setTitle(''); setBody('') }}>Cancel</button>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
                <h3>Recent Topics ({topics.length})</h3>
            </div>

            <div className="list">
                {topics.map(t => (
                    <div key={t.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>{t.title}</h4>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span className="badge">👤 {t.author || 'Anonymous'}</span>
                                    <span className="text-muted text-sm">🕒 {new Date(t.ts).toLocaleString()}</span>
                                    <span className="badge primary">💬 {t.replies?.length || 0} replies</span>
                                </div>
                            </div>
                            <button className="danger" onClick={() => remove(t.id, t.title)}>Delete</button>
                        </div>
                        <div className="divider"></div>
                        <p style={{ color: 'var(--gray-700)', lineHeight: '1.6' }}>{t.body}</p>
                    </div>
                ))}
                {topics.length === 0 && (
                    <div className="empty-state">
                        <div style={{ fontSize: '4rem' }}>🗣️</div>
                        <h3>No topics yet</h3>
                        <p className="text-muted">Be the first to start a discussion!</p>
                        <button className="success" onClick={() => setShowNewTopic(true)}>+ Create First Topic</button>
                    </div>
                )}
            </div>
        </div>
    )
}
