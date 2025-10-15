import React from 'react'

export default function Versions() {
    const [versions, setVersions] = React.useState<any[]>(() => JSON.parse(localStorage.getItem('collab_versions') || '[]'))

    function restore(v: any) {
        if (!confirm('Restore this version?')) return
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: any) => x.id === v.projectId)
        if (!p) return alert('project not found')
        const f = p.files.find((x: any) => x.id === v.fileId)
        if (!f) return alert('file not found')
        const b64 = btoa(unescape(encodeURIComponent(v.content)))
        f.dataUrl = 'data:text/plain;base64,' + b64
        localStorage.setItem('collab_projects', JSON.stringify(all))
        alert('Restored')
        setVersions(JSON.parse(localStorage.getItem('collab_versions') || '[]'))
    }

    return (
        <div>
            <h2>Versions</h2>
            <div className="list">
                {versions.map(v => (
                    <div key={v.id} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div><strong>{v.message}</strong></div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(v.ts).toLocaleString()} by {v.author}</div>
                        </div>
                        <div>
                            <button onClick={() => restore(v)}>Restore</button>
                        </div>
                    </div>
                ))}
                {versions.length === 0 && <div className="card">No versions yet.</div>}
            </div>
        </div>
    )
}
