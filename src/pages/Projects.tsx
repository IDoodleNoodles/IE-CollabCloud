import React from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import api from '../services/api'
import { useAuth } from '../services/auth'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'

type FileMeta = { id: string; name: string; type: string; dataUrl?: string }
type Project = { id: string; name: string; description?: string; files: FileMeta[] }

export default function Projects() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [projects, setProjects] = React.useState<Project[]>([])
    const [name, setName] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [isCreating, setIsCreating] = React.useState(false)
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
    const [isDragging, setIsDragging] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const uploadFormRef = React.useRef<HTMLDivElement>(null)
    const profile = JSON.parse(localStorage.getItem('collab_profile') || '{}')

    React.useEffect(() => { 
        api.getProjects().then((p:any)=> {
            setProjects(p || [])
            ActivityLogger.log(ActivityTypes.VIEW_PROJECTS, `Viewed ${(p || []).length} projects`)
        }).catch((err)=> {
            console.error('Error loading projects:', err)
            setProjects([])
        }) 
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

    function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files))
        }
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(true)
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files) {
            setSelectedFiles(Array.from(e.dataTransfer.files))
        }
    }

    async function handleUploadProject() {
        if (!name.trim()) {
            alert('Please provide a project name')
            return
        }
        if (selectedFiles.length === 0) {
            alert('Please select at least one file')
            return
        }
        
        setIsCreating(true)
        try {
            const fileMetas: FileMeta[] = await Promise.all(selectedFiles.map(f => new Promise<FileMeta>((res) => {
                const reader = new FileReader()
                reader.onload = () => res({ id: nanoid(), name: f.name, type: f.type, dataUrl: reader.result as string })
                reader.readAsDataURL(f)
            })))
            const proj:any = await api.createProject(name, fileMetas)
            setProjects(prev => [proj, ...prev])
            ActivityLogger.log(ActivityTypes.UPLOAD_PROJECT, `Created project: ${name} with ${fileMetas.length} files`)
            alert('Project created successfully!')
            setName('')
            setDescription('')
            setSelectedFiles([])
            navigate('/projects')
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
        <div style={{ 
            background: '#F0F4F9',
            minHeight: '100vh'
        }}>
            {isUploadMode ? (
                <div ref={uploadFormRef} style={{ 
                    maxWidth: '1100px', 
                    margin: '0 auto', 
                    padding: '2rem'
                }}>
                    {/* Back to Dashboard Link */}
                    <Link to="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#5F6368',
                        textDecoration: 'none',
                        fontSize: '0.9375rem',
                        marginBottom: '2rem',
                        fontWeight: '500'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to Dashboard
                    </Link>

                    {/* Upload Form Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2.5rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        border: '1px solid #E5E7EB'
                    }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: '#202124',
                            marginBottom: '0.5rem'
                        }}>Upload New Project</h2>
                        <p style={{
                            color: '#5F6368',
                            fontSize: '0.9375rem',
                            marginBottom: '2rem'
                        }}>Share your work with collaborators</p>

                        {/* Project Name */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9375rem',
                                fontWeight: '500',
                                color: '#202124',
                                marginBottom: '0.5rem'
                            }}>Project Name</label>
                            <input
                                type="text"
                                placeholder="Enter project name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #DADCE0',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    color: '#202124'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#4285F4'
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)'
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#DADCE0'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            />
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9375rem',
                                fontWeight: '500',
                                color: '#202124',
                                marginBottom: '0.5rem'
                            }}>Description</label>
                            <textarea
                                placeholder="Describe your project..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #DADCE0',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    color: '#202124',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#4285F4'
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)'
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#DADCE0'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            />
                        </div>

                        {/* Upload File */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9375rem',
                                fontWeight: '500',
                                color: '#202124',
                                marginBottom: '0.5rem'
                            }}>Upload File</label>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: isDragging ? '2px solid #4285F4' : '2px dashed #DADCE0',
                                    borderRadius: '12px',
                                    padding: '3rem 2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: isDragging ? '#E8F0FE' : '#FAFBFC'
                                }}
                            >
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    background: '#E8F0FE',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem'
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                </div>
                                <p style={{
                                    fontSize: '0.9375rem',
                                    color: '#5F6368',
                                    marginBottom: '0.25rem'
                                }}>
                                    <span style={{ color: '#4285F4', fontWeight: '500' }}>Click to upload</span> or drag and drop
                                </p>
                                {selectedFiles.length > 0 && (
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: '#34A853',
                                        marginTop: '0.75rem',
                                        fontWeight: '500'
                                    }}>
                                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected: {selectedFiles.map(f => f.name).join(', ')}
                                    </p>
                                )}
                                {selectedFiles.length === 0 && (
                                    <p style={{
                                        fontSize: '0.8125rem',
                                        color: '#9CA3AF',
                                        marginTop: '0.25rem'
                                    }}>Any file type supported</p>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileInputChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Upload Button */}
                        <button
                            onClick={handleUploadProject}
                            disabled={!name.trim() || selectedFiles.length === 0 || isCreating}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#4285F4',
                                color: 'white',
                                fontSize: '0.9375rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: (!name.trim() || selectedFiles.length === 0 || isCreating) ? 0.5 : 1
                            }}
                            onMouseOver={(e) => {
                                if (name.trim() && selectedFiles.length > 0 && !isCreating) {
                                    e.currentTarget.style.background = '#3367D6'
                                }
                            }}
                            onMouseOut={(e) => {
                                if (name.trim() && selectedFiles.length > 0 && !isCreating) {
                                    e.currentTarget.style.background = '#4285F4'
                                }
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            {isCreating ? 'Uploading...' : 'Upload Project'}
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ 
                    maxWidth: '1400px', 
                    margin: '0 auto', 
                    padding: '2rem',
                    background: '#F0F4F9',
                    minHeight: '100vh'
                }}>
                    {/* Header with Back Link */}
                    <Link to="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#5F6368',
                        textDecoration: 'none',
                        fontSize: '0.9375rem',
                        marginBottom: '2rem',
                        fontWeight: '500'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to Dashboard
                    </Link>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: '600',
                            color: '#202124',
                            marginBottom: '0.5rem'
                        }}>All Projects</h2>
                        <p style={{
                            color: '#5F6368',
                            fontSize: '0.9375rem',
                            margin: 0
                        }}>Browse and manage your projects</p>
                    </div>
                    
                    {projects.length === 0 ? (
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '4rem 2rem',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #E5E7EB'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', color: '#202124', marginBottom: '0.5rem' }}>No projects yet</h3>
                            <p style={{ color: '#5F6368', marginBottom: '1.5rem' }}>Create your first project to get started</p>
                            <Link to="/projects?action=upload" style={{ textDecoration: 'none' }}>
                                <button style={{
                                    background: '#4285F4',
                                    color: 'white',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '0.9375rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}>Create Project</button>
                            </Link>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
                            gap: '1.5rem' 
                        }}>
                            {projects.map(p => (
                                <div key={p.id} style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '1.75rem',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                                    border: '1px solid #E5E7EB',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                                onClick={() => window.location.href = `/projects/${p.id}`}
                                >
                                    {/* Header with Icon and File Count */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: '#E8F0FE',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                                            </svg>
                                        </div>
                                        <span style={{
                                            background: '#E6F4EA',
                                            color: '#34A853',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8125rem',
                                            fontWeight: '500'
                                        }}>
                                            {p.files.length} {p.files.length === 1 ? 'file' : 'files'}
                                        </span>
                                    </div>

                                    {/* Project Title */}
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: '#202124',
                                        marginBottom: '0.5rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>{p.name}</h3>

                                    {/* Project Description */}
                                    <p style={{
                                        color: '#5F6368',
                                        fontSize: '0.875rem',
                                        marginBottom: '1.25rem',
                                        lineHeight: '1.5',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {p.description || 'No description provided'}
                                    </p>

                                    {/* Creator and Date */}
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '1rem', 
                                        marginBottom: '1rem',
                                        fontSize: '0.8125rem',
                                        color: '#5F6368'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                <circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            <span>{profile.name || user?.name || 'Sharaine Salutan'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    {/* Collaborators */}
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid #E5E7EB'
                                    }}>
                                        <div style={{ display: 'flex', marginRight: '0.5rem' }}>
                                            {['#4285F4', '#EA4335', '#A142F4'].slice(0, Math.min(3, Math.max(1, Math.floor(Math.random() * 3) + 1))).map((color, idx) => (
                                                <div key={idx} style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: color,
                                                    border: '2px solid white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    marginLeft: idx > 0 ? '-8px' : '0'
                                                }}>
                                                    {['J', 'E', 'M'][idx]}
                                                </div>
                                            ))}
                                        </div>
                                        <span style={{
                                            fontSize: '0.8125rem',
                                            color: '#5F6368'
                                        }}>
                                            {Math.floor(Math.random() * 3) + 1} {Math.floor(Math.random() * 3) + 1 === 1 ? 'collaborator' : 'collaborators'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
