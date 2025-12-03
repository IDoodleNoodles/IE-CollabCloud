import React from 'react'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'
import { getTimeAgo } from '../utils/helpers'
import api from '../services/api'

type Comment = { id: string; projectId?: string; text: string; author: string; ts: number }

export default function Comments() {
    const [comments, setComments] = React.useState<Comment[]>([])
    const [text, setText] = React.useState('')
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        loadComments()
    }, [])

    async function loadComments() {
        try {
            const data = await api.getComments()
            setComments(data || [])
        } catch (err: any) {
            console.error('Error loading comments:', err)
            setComments([])
        } finally {
            setLoading(false)
        }
    }

    async function add() {
        if (!text.trim()) {
            alert('Please enter a comment')
            return
        }
        try {
            const newComment = await api.postComment(text)
            setComments(prev => [newComment, ...prev])
            ActivityLogger.log(ActivityTypes.ADD_COMMENT, `Added comment: ${text.substring(0, 50)}...`)
            setText('')
        } catch (err: any) {
            alert('Error posting comment: ' + err.message)
        }
    }

    async function remove(id: string, commentText: string) {
        if (!confirm(`Delete comment: "${commentText.substring(0, 50)}..."?`)) return
        try {
            await api.deleteComment(id)
            setComments(prev => prev.filter(c => c.id !== id))
            ActivityLogger.log(ActivityTypes.DELETE_COMMENT, `Deleted comment`)
        } catch (err: any) {
            alert('Error deleting comment: ' + err.message)
        }
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2>Comments</h2>
                <p className="text-muted">Share feedback and collaborate with your team</p>
            </div>

            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(66, 165, 245, 0.05))' }}>
                <div className="form-group">
                    <label htmlFor="comment-input">Write a Comment</label>
                    <textarea
                        id="comment-input"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Share your thoughts, feedback, or questions..."
                        rows={3}
                        onKeyDown={e => e.key === 'Enter' && e.ctrlKey && add()}
                    />
                    <small className="text-muted">Press Ctrl+Enter to post</small>
                </div>
                <button className="success" onClick={add} disabled={!text.trim()}>
                    Post Comment
                </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <h3>All Comments ({comments.length})</h3>
            </div>

            <div className="list">
                {comments.map(c => (
                    <div key={c.id} className="card">
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                flexShrink: 0
                            }}>
                                {(c.author || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div>
                                        <strong>{c.author}</strong>
                                        <span className="text-muted text-sm" style={{ marginLeft: '0.75rem' }}>
                                            {getTimeAgo(c.ts)}
                                        </span>
                                    </div>
                                    <button className="danger" onClick={() => remove(c.id, c.text)}>Delete</button>
                                </div>
                                <p style={{ color: 'var(--gray-700)', lineHeight: '1.6', margin: 0 }}>{c.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <div className="empty-state">
                        <div style={{ fontSize: '4rem' }}>💬</div>
                        <h3>No comments yet</h3>
                        <p className="text-muted">Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
