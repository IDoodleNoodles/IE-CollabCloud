import React from 'react'

type Comment = { id: string; projectId?: string; text: string; author: string; ts: number }

export default function Comments() {
    const [comments, setComments] = React.useState<Comment[]>(() => JSON.parse(localStorage.getItem('collab_comments') || '[]'))
    const [text, setText] = React.useState('')

    React.useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === 'collab_comments') setComments(JSON.parse(e.newValue || '[]'))
        }
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
    }, [])

    function add() {
        const author = localStorage.getItem('collab_user') ? JSON.parse(localStorage.getItem('collab_user')!).email : 'anon'
        const c = { id: 'c_' + Date.now(), text, author, ts: Date.now() }
        const next = [c, ...comments]
        localStorage.setItem('collab_comments', JSON.stringify(next))
        setComments(next)
        setText('')
        // simulate notification
        console.info('Notification: new comment by', author)
    }

    function remove(id: string) {
        if (!confirm('Delete comment?')) return
        const next = comments.filter(c => c.id !== id)
        localStorage.setItem('collab_comments', JSON.stringify(next))
        setComments(next)
    }

    return (
        <div>
            <h2>Comments</h2>
            <div style={{ display: 'flex', gap: 8 }}>
                <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment" />
                <button onClick={add}>Post</button>
            </div>
            <div className="list" style={{ marginTop: 12 }}>
                {comments.map(c => (
                    <div key={c.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div><strong>{c.author}</strong> <span style={{ color: '#6b7280', fontSize: 12 }}>— {new Date(c.ts).toLocaleString()}</span></div>
                            <div><button onClick={() => remove(c.id)}>Delete</button></div>
                        </div>
                        <div style={{ marginTop: 6 }}>{c.text}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
