import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import api from '../services/api'
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

    const handleDeleteFile = (fileId: string) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            setFiles(files.filter(f => f.id !== fileId))
        }
    }

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

    const handleSaveChanges = async () => {
        if (!projectName.trim()) {
            alert('Project name is required')
            return
        }

        const updatedProject = {
            ...project,
            name: projectName,
            description: description,
            files: files,
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
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
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
                        placeholder="Complete redesign of the company website with modern UI/UX"
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

                    {/* Files List */}
                    <div style={{
                        border: '1px dashed #DADCE0',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem'
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
                                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                                                <polyline points="13 2 13 9 20 9"/>
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
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                <line x1="10" y1="11" x2="10" y2="17"/>
                                                <line x1="14" y1="11" x2="14" y2="17"/>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Icon */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            marginTop: files.length > 0 ? '1.5rem' : '0'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: '#E8F0FE',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ 
                                    margin: 0,
                                    fontSize: '14px',
                                    color: '#202124'
                                }}>
                                    <span style={{ color: '#4285F4', fontWeight: '500' }}>Add new files</span> to your project
                                </p>
                                <p style={{ 
                                    margin: '0.25rem 0 0 0',
                                    fontSize: '12px',
                                    color: '#9AA0A6'
                                }}>
                                    Any file type supported
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Add File Input */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="Enter file name (e.g., document.pdf)"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddFile()
                                }
                            }}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                fontSize: '14px',
                                border: '1px solid #DADCE0',
                                borderRadius: '8px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit'
                            }}
                        />
                        <button
                            onClick={handleAddFile}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#4285F4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add
                        </button>
                    </div>
                </div>

                {/* Save Changes Button */}
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
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Save Changes
                </button>
            </div>
        </div>
    )
}
