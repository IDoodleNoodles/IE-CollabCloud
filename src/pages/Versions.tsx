import React from 'react'
import { Link } from 'react-router-dom'

export default function Versions() {
    const [versions, setVersions] = React.useState<any[]>(() => JSON.parse(localStorage.getItem('collab_versions') || '[]'))
    const [projects] = React.useState<any[]>(() => JSON.parse(localStorage.getItem('collab_projects') || '[]'))

    function restore(v: any) {
        if (!confirm(`Restore version: "${v.message}"? This will overwrite the current file.`)) return
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: any) => x.id === v.projectId)
        if (!p) return alert('Project not found')
        const f = p.files.find((x: any) => x.id === v.fileId)
        if (!f) return alert('File not found')
        const b64 = encodeToBase64(v.content)
        f.dataUrl = 'data:text/plain;base64,' + b64
        localStorage.setItem('collab_projects', JSON.stringify(all))
        alert('✅ Version restored successfully!')
        setVersions(JSON.parse(localStorage.getItem('collab_versions') || '[]'))
    }

    function getProjectName(projectId: string) {
        const p = projects.find(x => x.id === projectId)
        return p?.name || 'Unknown Project'
    }

    function getFileName(projectId: string, fileId: string) {
        const p = projects.find(x => x.id === projectId)
        const f = p?.files.find((x: any) => x.id === fileId)
        return f?.name || 'Unknown File'
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2>Version History</h2>
                <p className="text-muted">Track all changes and restore previous versions</p>
            </div>

            {versions.length === 0 ? (
                <div className="empty-state">
                    <div style={{ fontSize: '4rem' }}>📝</div>
                    <h3>No versions yet</h3>
                    <p className="text-muted">Edit files in your projects to create version history</p>
                    <Link to="/projects"><button>Go to Projects</button></Link>
                </div>
            ) : (
                <div style={{ position: 'relative' }}>
                    <div style={{ 
                        position: 'absolute', 
                        left: '20px', 
                        top: '0', 
                        bottom: '0', 
                        width: '2px', 
                        background: 'var(--gray-200)'
                    }}></div>
                    
                    <div className="list">
                        {versions.map((v, idx) => (
                            <div key={v.id} style={{ position: 'relative', paddingLeft: '3rem' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '20px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: idx === 0 ? 'var(--success)' : 'white',
                                    border: `3px solid ${idx === 0 ? 'var(--success)' : 'var(--gray-300)'}`
                                }}></div>
                                
                                <div className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                <h4 style={{ marginBottom: 0 }}>{v.message}</h4>
                                                {idx === 0 && <span className="badge success">Latest</span>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                                <span className="badge primary">{getProjectName(v.projectId)}</span>
                                                <span className="badge">{getFileName(v.projectId, v.fileId)}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <span className="text-muted text-sm">{v.author}</span>
                                                <span className="text-muted text-sm">{new Date(v.ts).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="btn-group">
                                            <Link to={`/editor/${v.projectId}/${v.fileId}`}>
                                                <button className="secondary">View File</button>
                                            </Link>
                                            <button onClick={() => restore(v)}>Restore</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
