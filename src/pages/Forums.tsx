import React from 'react'

export default function Forums() {
    const [topics, setTopics] = React.useState<any[]>(() => JSON.parse(localStorage.getItem('collab_forums') || '[]'))
    const [title, setTitle] = React.useState('')
    const [body, setBody] = React.useState('')

    function post() {
        const t = { id: 't_' + Date.now(), title, body, ts: Date.now(), replies: [] }
        const next = [t, ...topics]
        localStorage.setItem('collab_forums', JSON.stringify(next))
        setTopics(next)
        setTitle(''); setBody('')
    }

    function remove(id: string) { setTopics(prev => prev.filter(t => t.id !== id)) }

    return (
        <div>
            <h2>Forums</h2>
            <div style={{ display: 'grid', gap: 8 }}>
                <input placeholder="Topic title" value={title} onChange={e => setTitle(e.target.value)} />
                <textarea placeholder="Body" value={body} onChange={e => setBody(e.target.value)} />
                <button onClick={post}>Create topic</button>
            </div>
            <div className="list" style={{ marginTop: 12 }}>
                {topics.map(t => (
                    <div key={t.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div><strong>{t.title}</strong><div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(t.ts).toLocaleString()}</div></div>
                            <div><button onClick={() => remove(t.id)}>Delete</button></div>
                        </div>
                        <div style={{ marginTop: 8 }}>{t.body}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
