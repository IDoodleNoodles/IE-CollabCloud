import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

export default function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = React.useState<any>(() => {
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        return all.find((p: any) => p.id === id)
    })

    React.useEffect(() => {
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        setProject(all.find((p: any) => p.id === id))
    }, [id])

    function deleteFile(fileId: string) {
        if (!confirm('Delete file?')) return
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: any) => x.id === id)
        p.files = p.files.filter((f: any) => f.id !== fileId)
        localStorage.setItem('collab_projects', JSON.stringify(all))
        setProject({ ...p })
    }

    function downloadFile(file: any) {
        // file.dataUrl -> blob
        const arr = file.dataUrl.split(',')
        const mime = arr[0].match(/:(.*?);/)?.[1] || file.type || 'application/octet-stream'
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8 = new Uint8Array(n)
        while (n--) u8[n] = bstr.charCodeAt(n)
        const blob = new Blob([u8], { type: mime })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        a.click()
        URL.revokeObjectURL(url)
    }

    if (!project) return <div>Project not found</div>

    return (
        <div>
            <h2>{project.name}</h2>
            <div className="list">
                {project.files.map((f: any) => (
                    <div key={f.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div><strong>{f.name}</strong></div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{f.type || 'unknown'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Link to={`/editor/${project.id}/${f.id}`}><button>Edit</button></Link>
                            <button onClick={() => downloadFile(f)}>Download</button>
                            <button onClick={() => deleteFile(f.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: 12 }}>
                <button onClick={() => navigate('/projects')}>Back to Projects</button>
            </div>
        </div>
    )
}
