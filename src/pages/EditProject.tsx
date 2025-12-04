import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import api from '../services/api'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'
import { useAuth } from '../services/auth'

export default function EditProject() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [project, setProject] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const [projectName, setProjectName] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [files, setFiles] = React.useState<any[]>([])
    const [newFileName, setNewFileName] = React.useState('')
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
    const [previews, setPreviews] = React.useState<Array<{ name: string; type: string; size: number; url?: string; text?: string }>>([])
    const [isDragging, setIsDragging] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        setLoading(true)
        api.getProject(id as string)
            .then((p: any) => {
                setProject(p)
                setProjectName(p.name)
                setDescription(p.description || '')
                setFiles(p.files || [])
            })
            .catch(() => {
                alert('Project not found')
                navigate('/projects')
            })
            .finally(() => setLoading(false))
    }, [id, navigate])

    const handleDeleteFile = async (fileId: string) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                console.log('[EditProject] Deleting file:', fileId)
                await api.deleteFile(id as string, fileId)
                console.log('[EditProject] File deleted successfully')
                // Update local state
                setFiles(files.filter(f => f.id !== fileId))
                alert('File deleted successfully')
            } catch (error) {
                console.error('[EditProject] Error deleting file:', error)
                alert('Failed to delete file')
            }
        }
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files))
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files) {
            setSelectedFiles(Array.from(e.dataTransfer.files))
        }
    }

    // Generate previews
    React.useEffect(() => {
        let revoked: string[] = []
        async function gen() {
            const arr = await Promise.all(selectedFiles.map(async (f) => {
                const base: any = { name: f.name, type: f.type || 'application/octet-stream', size: f.size }
                if (f.type.startsWith('image/')) {
                    const url = URL.createObjectURL(f)
                    revoked.push(url)
                    base.url = url
                } else if (f.type.startsWith('text/')) {
                    const text = await f.text()
                    base.text = text.slice(0, 200)
                }
                return base
            }))
            setPreviews(arr)
        }
        gen()
        return () => {
            revoked.forEach(u => URL.revokeObjectURL(u))
            setPreviews([])
        }
    }, [selectedFiles])

    const handleAddFile = () => {
        if (!newFileName.trim()) {
            alert('Please enter a file name')
            return
        }

        const newFile = {
            id: nanoid(),
            name: newFileName.trim(),
            type: 'text/plain',
            dataUrl: 'data:text/plain;base64,',
            size: 0,
            uploadedAt: Date.now()
        }

        setFiles([...files, newFile])
        setNewFileName('')
    }

    const handleAddSelectedFiles = async () => {
        if (selectedFiles.length === 0) return

        const fileMetas = await Promise.all(selectedFiles.map(f => new Promise<any>((res) => {
            const reader = new FileReader()
            reader.onload = () => res({ id: nanoid(), name: f.name, type: f.type, dataUrl: reader.result as string, uploadedAt: Date.now() })
            reader.readAsDataURL(f)
        })))

        setFiles([...files, ...fileMetas])
        setSelectedFiles([])
        setPreviews([])
    }

    const handleSaveChanges = async () => {
        if (!projectName.trim()) {
            alert('Project name is required')
            return
        }

        // If there are selected files (dragged/dropped), convert them to file metadata
        // and merge into the files list so they are included in the save.
        let mergedFiles = files
        if (selectedFiles.length > 0) {
            try {
                const fileMetas = await Promise.all(selectedFiles.map(f => new Promise<any>((res) => {
                    const reader = new FileReader()
                    reader.onload = () => res({ id: nanoid(), name: f.name, type: f.type, dataUrl: reader.result as string, uploadedAt: Date.now() })
                    reader.readAsDataURL(f)
                })))
                mergedFiles = [...files, ...fileMetas]
                // update local state so UI reflects added files immediately
                setFiles(mergedFiles)
                setSelectedFiles([])
                setPreviews([])
            } catch (err) {
                console.error('[EditProject] Error processing selected files:', err)
                alert('Failed to process selected files')
                return
            }
        }

        const updatedProject = {
            ...project,
            name: projectName,
            description: description,
            files: mergedFiles,
            updatedAt: Date.now()
        }

        try {
            await api.updateProject(id as string, updatedProject)
            alert('Project updated successfully!')
            navigate(`/projects/${id}`)
        } catch (error) {
            alert('Failed to update project')
        }
    }

    const handleDeleteProject = async () => {
        if (!window.confirm('Delete this project? This cannot be undone.')) return
        try {
            await api.deleteProject(id as string)
            ActivityLogger.log(ActivityTypes.DELETE_PROJECT, `Deleted project: ${projectName}`, id)
            alert('Project deleted')
            navigate('/projects')
        } catch (err) {
            console.error('[EditProject] Failed to delete project', err)
            alert('Failed to delete project')
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div style={{
            padding: '2rem 3rem',
            background: '#F0F4F9',
            minHeight: '100vh'
        }}>
            {/* Back to Project Link */}
            <Link
                to={`/projects/${id}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#5F6368',
                    textDecoration: 'none',
                    marginBottom: '1.5rem',
                    fontSize: '14px',
                    fontWeight: '500'
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Project
            </Link>

            {/* Main Content Card */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '800px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#202124',
                        margin: '0 0 0.5rem 0'
                    }}>
                        Edit Project
                    </h2>
                    <p style={{
                        color: '#5F6368',
                        fontSize: '14px',
                        margin: 0
                    }}>
                        Update your project content and files
                    </p>
                </div>

                {/* Project Name */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#202124',
                        marginBottom: '0.5rem'
                    }}>
                        Project Name
                    </label>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Website Redesign"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '14px',
                            border: '1px solid #DADCE0',
                            borderRadius: '8px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#202124',
                        marginBottom: '0.5rem'
                    }}>
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter project description"
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '14px',
                            border: '1px solid #DADCE0',
                            borderRadius: '8px',
                            outline: 'none',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                {/* Manage Files */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#202124',
                        marginBottom: '0.5rem'
                    }}>
                        Manage Files
                    </label>

                    {/* Drag and Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: isDragging ? '2px solid #4285F4' : '2px dashed #DADCE0',
                            borderRadius: '8px',
                            padding: '2rem 1rem',
                            marginBottom: '1rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: isDragging ? '#E8F0FE' : '#FAFBFC'
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#E8F0FE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <p style={{ fontSize: '14px', color: '#5F6368', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#4285F4', fontWeight: '500' }}>Click to upload</span> or drag and drop
                        </p>
                        {selectedFiles.length > 0 && (
                            <p style={{ fontSize: '14px', color: '#34A853', marginTop: '0.75rem', fontWeight: '500' }}>
                                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                            </p>
                        )}
                        {selectedFiles.length === 0 && (
                            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '0.25rem' }}>Any file type supported</p>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                    />

                    {/* Selected Files Preview */}
                    {previews.length > 0 && (
                        <div style={{
                            marginBottom: '1rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '0.75rem'
                        }}>
                            {previews.map((p, idx) => (
                                <div key={idx} style={{
                                    background: '#F9FAFB',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    padding: '0.75rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong style={{ fontSize: '0.875rem', color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{p.name}</strong>
                                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{(p.size / (1024 * 1024)).toFixed(2)} MB</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#5F6368', marginTop: '0.25rem' }}>{p.type || 'Unknown type'}</div>
                                    {p.url && (
                                        <img src={p.url} alt={p.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', marginTop: '0.5rem' }} />
                                    )}
                                    {p.text && (
                                        <pre style={{
                                            marginTop: '0.5rem',
                                            background: 'white',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '6px',
                                            padding: '0.5rem',
                                            fontSize: '0.75rem',
                                            color: '#202124',
                                            overflow: 'auto',
                                            maxHeight: '100px'
                                        }}>{p.text}</pre>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Selected files will be added automatically when saving. */}

                    {/* Files List */}
                    <div style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        background: 'white'
                    }}>
                        {files.length === 0 ? (
                            <p style={{
                                textAlign: 'center',
                                color: '#9AA0A6',
                                fontSize: '14px',
                                margin: 0
                            }}>
                                No files in this project
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {files.map((file) => (
                                    <div
                                        key={file.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem',
                                            background: '#E8F0FE',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                                                <polyline points="13 2 13 9 20 9" />
                                            </svg>
                                            <span style={{
                                                color: '#4285F4',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}>
                                                {file.name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFile(file.id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0.25rem',
                                                color: '#EA4335',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                            title="Delete file"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                <line x1="10" y1="11" x2="10" y2="17" />
                                                <line x1="14" y1="11" x2="14" y2="17" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}


                    </div>

                    {/* Manual add controls removed — files selected above will be included when saving. */}
                </div>

                {/* Save Changes Button */}
                <div style={{display: 'flex', gap: '0.75rem', flexDirection: 'column'}}>
                    <button
                        onClick={handleSaveChanges}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: '#4285F4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Save Changes
                    </button>

                    <button
                        onClick={handleDeleteProject}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#EA4335',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete Project
                    </button>
                </div>
            </div>
        </div>
    )
}
