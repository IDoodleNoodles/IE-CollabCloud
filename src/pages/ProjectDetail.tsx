import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { downloadFile, getFileTypeLabel, formatFileSize, getFileSizeFromDataUrl, isTextFile } from '../utils/helpers'

export default function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        setLoading(true)
        api.getProject(id as string)
            .then((p:any)=> setProject(p))
            .catch(()=> setProject(null))
            .finally(() => setLoading(false))
    }, [id])

    function deleteFile(fileId: string, fileName: string) {
        if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return
        api.deleteFile(id as string, fileId).then((p:any)=> setProject({...p}))
    }

    const handleDownloadFile = (file: any) => {
        try {
            downloadFile(file.name, file.dataUrl, file.type)
        } catch (error) {
            alert('Error downloading file')
        }
    }

    if (loading) {
        return (
            <div className="empty-state">
                <h3>Loading project...</h3>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="empty-state">
                <h3>Project not found</h3>
                <button className="secondary" onClick={() => navigate('/projects')}>Back to Projects</button>
            </div>
        )
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <button className="secondary" onClick={() => navigate('/projects')} style={{ marginBottom: '1rem' }}>
                    Back to Projects
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>{project.name}</h2>
                    <button onClick={() => navigate(`/projects/${project.id}/collaborators`)}>
                        Manage Collaborators
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="badge primary">{project.files.length} {project.files.length === 1 ? 'file' : 'files'}</span>
                </div>
            </div>

            {project.files.length === 0 ? (
                <div className="empty-state">
                    <h3>No files in this project</h3>
                    <p className="text-muted">Upload files to get started</p>
                </div>
            ) : (
                <div className="list">
                    {project.files.map((f: any) => (
                        <div key={f.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1 }}>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        fontWeight: 'bold', 
                                        color: 'white',
                                        background: '#2196f3',
                                        padding: '0.5rem',
                                        borderRadius: '4px',
                                        minWidth: '50px',
                                        textAlign: 'center'
                                    }}>{getFileTypeLabel(f.name)}</div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ marginBottom: '0.25rem' }}>{f.name}</h4>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <span className="text-muted text-sm">{f.type || 'unknown type'}</span>
                                            {f.dataUrl && <span className="text-muted text-sm">{formatFileSize(getFileSizeFromDataUrl(f.dataUrl))}</span>}
                                            {isTextFile(f.name) && <span className="badge success text-xs">Editable</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="btn-group">
                                    {isTextFile(f.name) && (
                                        <Link to={`/editor/${project.id}/${f.id}`}>
                                            <button>Edit</button>
                                        </Link>
                                    )}
                                    <button className="secondary" onClick={() => handleDownloadFile(f)}>Download</button>
                                    <button className="danger" onClick={() => deleteFile(f.id, f.name)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
