import React from 'react'
import { Link } from 'react-router-dom'
import { nanoid } from 'nanoid'

type FileMeta = { id: string; name: string; type: string; dataUrl?: string }
type Project = { id: string; name: string; files: FileMeta[] }

function loadProjects(): Project[] {
    return JSON.parse(localStorage.getItem('collab_projects') || '[]')
}

function saveProjects(p: Project[]) { localStorage.setItem('collab_projects', JSON.stringify(p)) }

export default function Projects() {
    const [projects, setProjects] = React.useState<Project[]>(loadProjects)
    const [name, setName] = React.useState('')

    React.useEffect(() => saveProjects(projects), [projects])

    async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target
        if (!input.files || !name) return alert('Provide project name')
        const files = Array.from(input.files)
        const fileMetas: FileMeta[] = await Promise.all(files.map(f => new Promise<FileMeta>((res) => {
            const reader = new FileReader()
            reader.onload = () => res({ id: nanoid(), name: f.name, type: f.type, dataUrl: reader.result as string })
            reader.readAsDataURL(f)
        })))
        const proj: Project = { id: 'p_' + Date.now(), name, files: fileMetas }
        setProjects(prev => [proj, ...prev])
        setName('')
        input.value = ''
    }

    function removeProject(id: string) {
        if (!confirm('Delete project?')) return
        setProjects(prev => prev.filter(p => p.id !== id))
    }

    return (
        <div>
            <h2>Projects</h2>
            <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="New project name" value={name} onChange={e => setName(e.target.value)} />
                <input type="file" multiple onChange={handleFilesChange} />
            </div>

            <div className="list" style={{ marginTop: 12 }}>
                {projects.map(p => (
                    <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Link to={`/projects/${p.id}`}><strong>{p.name}</strong></Link>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{p.files.length} files</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => removeProject(p.id)}>Delete</button>
                        </div>
                    </div>
                ))}
                {projects.length === 0 && <div className="card">No projects yet. Create one using the inputs above.</div>}
            </div>
        </div>
    )
}
