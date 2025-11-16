import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { nanoid } from 'nanoid'
import api from '../services/api'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'

type FileMeta = { id: string; name: string; type: string; dataUrl?: string }
type Project = { id: string; name: string; files: FileMeta[] }

export default function Projects() {
    const [searchParams] = useSearchParams()
    const [projects, setProjects] = React.useState<Project[]>([])
    const [name, setName] = React.useState('')
    const [isCreating, setIsCreating] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const uploadFormRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => { 
        api.getProjects().then((p:any)=> {
            setProjects(p || [])
            ActivityLogger.log(ActivityTypes.VIEW_PROJECTS, `Viewed ${(p || []).length} projects`)
        }).catch(()=> setProjects([])) 
    }, [])

    React.useEffect(() => {
        // Scroll to upload form if action=upload parameter is present
        if (searchParams.get('action') === 'upload' && uploadFormRef.current) {
            uploadFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
            const nameInput = uploadFormRef.current.querySelector('input[type="text"]') as HTMLInputElement
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 300)
            }
        }
    }, [searchParams])

    async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target
        if (!input.files || !name.trim()) {
            alert('Please provide a project name')
            return
        }
        setIsCreating(true)
        try {
            const files = Array.from(input.files)
            const fileMetas: FileMeta[] = await Promise.all(files.map(f => new Promise<FileMeta>((res) => {
                const reader = new FileReader()
                reader.onload = () => res({ id: nanoid(), name: f.name, type: f.type, dataUrl: reader.result as string })
                reader.readAsDataURL(f)
            })))
            const proj:any = await api.createProject(name, fileMetas)
            setProjects(prev => [proj, ...prev])
            ActivityLogger.log(ActivityTypes.UPLOAD_PROJECT, `Created project: ${name} with ${fileMetas.length} files`)
            setName('')
            input.value = ''
        } catch (err: any) {
            alert('Error creating project: ' + err.message)
        } finally {
            setIsCreating(false)
        }
    }

    function removeProject(id: string, projectName: string) {
        if (!confirm(`Delete project "${projectName}"? This cannot be undone.`)) return
        api.deleteProject(id).then(()=> {
            setProjects(prev => prev.filter(p => p.id !== id))
            ActivityLogger.log(ActivityTypes.CREATE_PROJECT, `Deleted project: ${projectName}`)
        })
    }

    const isUploadMode = searchParams.get('action') === 'upload'

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>{isUploadMode ? 'Upload New Project' : 'Your Projects'}</h2>
                    <p className="text-muted">
                        {isUploadMode ? 'Create a new project by uploading files' : `You have ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
                    </p>
                </div>
                {!isUploadMode && (
                    <Link to="/projects?action=upload">
                        <button className="success">+ New Project</button>
                    </Link>
                )}
                {isUploadMode && (
                    <Link to="/projects">
                        <button className="secondary">View All Projects</button>
                    </Link>
                )}
            </div>

            {isUploadMode ? (
                <div ref={uploadFormRef} className="card" style={{ background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(66, 165, 245, 0.05))' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Project Details</h3>
                    <div className="form-group">
                        <label htmlFor="project-name">Project Name</label>
                        <input
                            id="project-name" 
                            placeholder="Enter project name (e.g., My Awesome App)" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <h4 style={{ marginBottom: '0.5rem' }}>Upload Files</h4>
                        <p className="text-muted text-sm" style={{ marginBottom: '0.5rem' }}>
                            Select one or multiple files to include in your project
                        </p>
                        <button 
                            className="success" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!name.trim() || isCreating}
                            style={{ width: '100%' }}
                        >
                            {isCreating ? 'Creating Project...' : 'Choose Files to Upload'}
                        </button>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            multiple 
                            onChange={handleFilesChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
            ) : (
                <>
                    {projects.length === 0 ? (
                        <div className="empty-state">
                            <h3>No projects yet</h3>
                            <p className="text-muted">Create your first project to get started</p>
                            <Link to="/projects?action=upload">
                                <button className="success">Create Project</button>
                            </Link>
                        </div>
                    ) : (
                        <div className="list">
                            {projects.map(p => (
                    <div key={p.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <Link to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{p.name}</h4>
                                </Link>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span className="badge primary">{p.files.length} {p.files.length === 1 ? 'file' : 'files'}</span>
                                    {p.files.slice(0, 3).map(f => (
                                        <span key={f.id} className="badge text-xs">{f.name}</span>
                                    ))}
                                    {p.files.length > 3 && <span className="text-muted text-xs">+{p.files.length - 3} more</span>}
                                </div>
                            </div>
                            <div className="btn-group">
                                <Link to={`/projects/${p.id}`}>
                                    <button>View Details</button>
                                </Link>
                                <button className="danger" onClick={() => removeProject(p.id, p.name)}>Delete</button>
                            </div>
                        </div>
                    </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
