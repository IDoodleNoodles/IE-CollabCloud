import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import api from '../services/api'
import { useAuth } from '../services/auth'
import { downloadFile, getFileTypeLabel, formatFileSize, getFileSizeFromDataUrl, isTextFile, getTimeAgo, encodeToBase64 } from '../utils/helpers'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'
import Collaborators from './Collaborators'

type Comment = { id: string; projectId: string; text: string; author: string; authorEmail: string; ts: number; message: string }

export default function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [project, setProject] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const [commentText, setCommentText] = React.useState('')
    const [comments, setComments] = React.useState<Comment[]>([])
    const [showCollaboratorsModal, setShowCollaboratorsModal] = React.useState(false)
    const [showShareModal, setShowShareModal] = React.useState(false)
    const profile = JSON.parse(localStorage.getItem('collab_profile') || '{}')

    React.useEffect(() => {
        setLoading(true)
        api.getProject(id as string)
            .then((p:any)=> {
                setProject(p)
                // Load project comments
                const allComments = JSON.parse(localStorage.getItem('collab_project_comments') || '[]')
                const projectComments = allComments.filter((c: Comment) => c.projectId === p.id)
                setComments(projectComments)
            })
            .catch(()=> setProject(null))
            .finally(() => setLoading(false))
    }, [id])

    const handleDownloadFile = (file: any) => {
        try {
            downloadFile(file.name, file.dataUrl, file.type)
        } catch (error) {
            alert('Error downloading file')
        }
    }

    function addComment() {
        if (!commentText.trim()) return
        
        const author = profile.name || user?.name || user?.email?.split('@')[0] || 'User'
        const authorEmail = user?.email || 'unknown@email.com'
        
        const comment: Comment = {
            id: nanoid(),
            projectId: project.id,
            text: commentText,
            message: commentText,
            author,
            authorEmail,
            ts: Date.now()
        }
        
        const allComments = JSON.parse(localStorage.getItem('collab_project_comments') || '[]')
        allComments.push(comment)
        localStorage.setItem('collab_project_comments', JSON.stringify(allComments))
        setComments([...comments, comment])
        ActivityLogger.log(ActivityTypes.ADD_COMMENT, `Added comment on project: ${project.name}`)
        setCommentText('')
    }

    function deleteComment(commentId: string) {
        if (!confirm('Delete this comment?')) return
        
        const allComments = JSON.parse(localStorage.getItem('collab_project_comments') || '[]')
        const filtered = allComments.filter((c: Comment) => c.id !== commentId)
        localStorage.setItem('collab_project_comments', JSON.stringify(filtered))
        setComments(comments.filter(c => c.id !== commentId))
        ActivityLogger.log(ActivityTypes.DELETE_COMMENT, `Deleted comment on project: ${project.name}`)
    }

    function getInitials(name: string) {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }

    function getVersions() {
        const allVersions = JSON.parse(localStorage.getItem('collab_versions') || '[]')
        return allVersions
            .filter((v: any) => v.projectId === project?.id)
            .sort((a: any, b: any) => b.ts - a.ts)
    }

    function restoreVersion(v: any) {
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
        // Refresh project
        api.getProject(id as string).then((updatedProject: any) => setProject(updatedProject))
    }

    // Load collaborators from localStorage
    const collaborators = React.useMemo(() => {
        if (!project) return []
        const collabs = JSON.parse(localStorage.getItem(`collab_project_${project.id}_collaborators`) || '[]')
        return collabs.map((c: any) => ({
            ...c,
            color: c.color || (['#6366F1', '#8B5CF6', '#EC4899'][c.email.codePointAt(0) % 3])
        }))
    }, [project])

    if (loading) {
        return (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h3>Loading project...</h3>
            </div>
        )
    }

    if (!project) {
        return (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h3>Project not found</h3>
                <button className="secondary" onClick={() => navigate('/projects')}>Back to Projects</button>
            </div>
        )
    }

    const versions = getVersions()

    return (
        <div style={{ 
            background: '#F0F4F9',
            minHeight: '100vh'
        }}>
            <div style={{ 
                maxWidth: '1600px', 
                margin: '0 auto', 
                padding: '2rem',
                display: 'flex',
                gap: '2rem'
            }}>
                {/* Main Content */}
                <div style={{ flex: '1 1 70%' }}>
                    {/* Back Link */}
                    <Link to="/projects" style={{
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
                        Back to Projects
                    </Link>

                    {/* Project Header Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        border: '1px solid #E5E7EB',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h1 style={{
                                fontSize: '1.875rem',
                                fontWeight: '600',
                                color: '#202124',
                                margin: 0
                            }}>{project.name}</h1>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button 
                                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        borderRadius: '8px',
                                        border: '1px solid #E5E7EB',
                                        background: 'white',
                                        color: '#5F6368',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    Edit
                                </button>
                                <button 
                                    onClick={() => setShowShareModal(true)}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#4285F4',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                                        <polyline points="16 6 12 2 8 6"/>
                                        <line x1="12" y1="2" x2="12" y2="15"/>
                                    </svg>
                                    Share
                                </button>
                            </div>
                        </div>
                        <p style={{
                            color: '#5F6368',
                            fontSize: '0.9375rem',
                            marginBottom: '1.5rem',
                            lineHeight: '1.6'
                        }}>{project.description || 'Complete redesign of the company website with modern UI/UX'}</p>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: '2rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid #E5E7EB'
                        }}>
                            <div>
                                <p style={{
                                    fontSize: '0.8125rem',
                                    color: '#9CA3AF',
                                    margin: '0 0 0.25rem 0',
                                    fontWeight: '500'
                                }}>Owner</p>
                                <p style={{
                                    fontSize: '0.9375rem',
                                    color: '#202124',
                                    margin: 0,
                                    fontWeight: '500'
                                }}>{profile.name || user?.name || 'Sharaine Salutan'}</p>
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '0.8125rem',
                                    color: '#9CA3AF',
                                    margin: '0 0 0.25rem 0',
                                    fontWeight: '500'
                                }}>Upload Date</p>
                                <p style={{
                                    fontSize: '0.9375rem',
                                    color: '#202124',
                                    margin: 0,
                                    fontWeight: '500'
                                }}>Nov 15, 2025, 06:30 PM</p>
                            </div>
                        </div>
                    </div>

                    {/* Files Section */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        border: '1px solid #E5E7EB',
                        marginBottom: '2rem'
                    }}>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#202124',
                            marginBottom: '1.5rem'
                        }}>Files</h2>
                        
                        {project.files.length === 0 ? (
                            <p style={{ color: '#9CA3AF' }}>No files yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {project.files.map((f: any) => (
                                    <div key={f.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        background: '#F9FAFB',
                                        borderRadius: '8px',
                                        border: '1px solid #E5E7EB'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '8px',
                                                background: '#E8F0FE',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                                                    <polyline points="13 2 13 9 20 9"/>
                                                </svg>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{
                                                    fontSize: '0.9375rem',
                                                    fontWeight: '500',
                                                    color: '#202124',
                                                    margin: '0 0 0.25rem 0'
                                                }}>{f.name}</p>
                                                <p style={{
                                                    fontSize: '0.8125rem',
                                                    color: '#9CA3AF',
                                                    margin: 0
                                                }}>{f.dataUrl ? formatFileSize(getFileSizeFromDataUrl(f.dataUrl)) : '0 MB'}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                onClick={() => {
                                                    if (!f.id) {
                                                        alert('File ID is missing. Please re-upload the file.')
                                                        return
                                                    }
                                                    navigate(`/editor/${project.id}/${f.id}`)
                                                }}
                                                style={{
                                                    background: '#F0F4F9',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '0.5rem',
                                                    color: '#5F6368',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Edit"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadFile(f)}
                                                style={{
                                                    background: '#F0F4F9',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '0.5rem',
                                                    color: '#5F6368',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Download"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                    <polyline points="7 10 12 15 17 10"/>
                                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Version History Section */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        border: '1px solid #E5E7EB'
                    }}>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#202124',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Version History
                        </h2>
                        
                        {versions.length === 0 ? (
                            <p style={{ color: '#9CA3AF' }}>No version history yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {versions.slice(0, 3).map((v: any, idx: number) => (
                                    <div key={v.id} style={{
                                        padding: '1.25rem',
                                        background: '#F9FAFB',
                                        borderRadius: '8px',
                                        border: '1px solid #E5E7EB'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.25rem 0.625rem',
                                                background: '#E8F0FE',
                                                color: '#4285F4',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>v{idx === 0 ? '1.2' : idx === 1 ? '1.1' : '1.0'}</span>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <span style={{
                                                    fontSize: '0.8125rem',
                                                    color: '#9CA3AF'
                                                }}>{new Date(v.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                <button
                                                    onClick={() => navigate(`/editor/${project.id}/${v.fileId}?readonly=true&versionId=${v.id}`)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        color: '#4285F4',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                    title="View version"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                </button>
                                                <span 
                                                    onClick={() => restoreVersion(v)}
                                                    style={{
                                                        fontSize: '0.875rem',
                                                        color: '#34A853',
                                                        fontWeight: '500',
                                                        cursor: 'pointer',
                                                        textDecoration: 'none'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.textDecoration = 'underline'
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.textDecoration = 'none'
                                                    }}
                                                >
                                                    Restore
                                                </span>
                                            </div>
                                        </div>
                                        <p style={{
                                            fontSize: '0.9375rem',
                                            color: '#202124',
                                            margin: '0 0 0.25rem 0'
                                        }}>{v.message || (idx === 0 ? 'Added mobile responsive breakpoints' : idx === 1 ? 'Updated header size and color palette' : 'Initial upload')}</p>
                                        <p style={{
                                            fontSize: '0.8125rem',
                                            color: '#9CA3AF',
                                            margin: 0
                                        }}>by {v.author || (idx === 0 ? 'John Smith' : 'Sharaine Salutan')}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div style={{ flex: '0 0 30%', maxWidth: '400px' }}>
                    {/* Collaborators Panel */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.75rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        border: '1px solid #E5E7EB',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#202124',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                Collaborators
                            </h3>
                            <button
                                onClick={() => setShowCollaboratorsModal(true)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#4285F4',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                            >
                                Manage
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {collaborators.length === 0 ? (
                                <button
                                    onClick={() => setShowCollaboratorsModal(true)}
                                    style={{
                                        padding: '0.75rem',
                                        border: '1px dashed #DADCE0',
                                        borderRadius: '8px',
                                        background: 'transparent',
                                        color: '#5F6368',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        margin: '0.5rem 0'
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    Add Collaborator
                                </button>
                            ) : (
                                collaborators.map((collab) => (
                                <div key={collab.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: collab.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '0.875rem'
                                    }}>
                                        {getInitials(collab.name)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#202124',
                                            margin: '0 0 0.125rem 0'
                                        }}>{collab.name}</p>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: '#9CA3AF',
                                            margin: 0
                                        }}>{collab.email}</p>
                                    </div>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: '#9CA3AF'
                                    }}>{collab.permission}</span>
                                </div>
                            ))
                            )}
                        </div>
                    </div>

                    {/* Comments Panel */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.75rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        border: '1px solid #E5E7EB'
                    }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#202124',
                            margin: '0 0 1.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            Comments
                        </h3>
                        
                        <div style={{ 
                            maxHeight: '400px',
                            overflowY: 'auto',
                            marginBottom: '1rem'
                        }}>
                            {comments.length === 0 ? (
                                <p style={{ color: '#9CA3AF', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No comments yet</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {comments.map((comment) => (
                                        <div key={comment.id} style={{
                                            padding: '1rem',
                                            background: '#F9FAFB',
                                            borderRadius: '8px',
                                            border: '1px solid #E5E7EB'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: '#6366F1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {getInitials(comment.author)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: '500',
                                                        color: '#202124',
                                                        margin: 0
                                                    }}>{comment.author}</p>
                                                    <p style={{
                                                        fontSize: '0.75rem',
                                                        color: '#9CA3AF',
                                                        margin: 0
                                                    }}>{getTimeAgo(comment.ts)}</p>
                                                </div>
                                                <button
                                                    onClick={() => deleteComment(comment.id)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem',
                                                        color: '#EA4335',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                    title="Delete comment"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"/>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                        <line x1="10" y1="11" x2="10" y2="17"/>
                                                        <line x1="14" y1="11" x2="14" y2="17"/>
                                                    </svg>
                                                </button>
                                            </div>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: '#5F6368',
                                                margin: 0,
                                                lineHeight: '1.5'
                                            }}>{comment.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <textarea
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #DADCE0',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    resize: 'vertical',
                                    marginBottom: '0.75rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <button
                                onClick={addComment}
                                disabled={!commentText.trim()}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: !commentText.trim() ? '#E5E7EB' : '#4285F4',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: !commentText.trim() ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collaborators Modal */}
            <Collaborators
                projectId={project.id}
                projectName={project.name}
                isOpen={showCollaboratorsModal}
                onClose={() => setShowCollaboratorsModal(false)}
            />

            {/* Share Project Modal */}
            {showShareModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '500px',
                        padding: '2rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#202124',
                                margin: 0
                            }}>
                                Share Project
                            </h2>
                            <button
                                onClick={() => setShowShareModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    color: '#9AA0A6',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        {/* Description */}
                        <p style={{
                            fontSize: '14px',
                            color: '#5F6368',
                            margin: '0 0 1.5rem 0',
                            lineHeight: '1.5'
                        }}>
                            Share this link with others to give them access to this project.
                        </p>

                        {/* Link Input */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: '#F9FAFB',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            marginBottom: '1.5rem'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/projects/${project.id}`}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    fontSize: '14px',
                                    color: '#5F6368',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Copy Link Button */}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/projects/${project.id}`)
                                alert('Link copied to clipboard!')
                            }}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: '#4285F4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Copy Link
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
