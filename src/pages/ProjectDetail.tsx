import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { downloadFile, getFileTypeLabel, formatFileSize, getFileSizeFromDataUrl, isTextFile, getTimeAgo, encodeToBase64 } from '../utils/helpers'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'

type Comment = { id: string; projectId: string; fileId: string; text: string; author: string; ts: number }

export default function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const [expandedFileVersions, setExpandedFileVersions] = React.useState<{[key: string]: boolean}>({})
    const [selectedFile, setSelectedFile] = React.useState<any>(null)
    const [commentText, setCommentText] = React.useState('')
    const [fileComments, setFileComments] = React.useState<Comment[]>([])

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

    function openFilePreview(file: any) {
        setSelectedFile(file)
        // Load comments for this file
        const allComments = JSON.parse(localStorage.getItem('collab_comments') || '[]')
        const filtered = allComments.filter((c: Comment) => c.projectId === project.id && c.fileId === file.id)
        setFileComments(filtered)
    }

    function closeFilePreview() {
        setSelectedFile(null)
        setCommentText('')
    }

    function addComment() {
        if (!commentText.trim()) {
            alert('Please enter a comment')
            return
        }
        const author = localStorage.getItem('collab_user') ? JSON.parse(localStorage.getItem('collab_user')!).email : 'Anonymous'
        const comment: Comment = {
            id: 'c_' + Date.now(),
            projectId: project.id,
            fileId: selectedFile.id,
            text: commentText,
            author,
            ts: Date.now()
        }
        const allComments = JSON.parse(localStorage.getItem('collab_comments') || '[]')
        allComments.unshift(comment)
        localStorage.setItem('collab_comments', JSON.stringify(allComments))
        setFileComments([comment, ...fileComments])
        ActivityLogger.log(ActivityTypes.ADD_COMMENT, `Added comment on file: ${selectedFile.name}`)
        setCommentText('')
    }

    function deleteComment(commentId: string, commentText: string) {
        if (!confirm(`Delete comment: "${commentText.substring(0, 50)}..."?`)) return
        const allComments = JSON.parse(localStorage.getItem('collab_comments') || '[]')
        const filtered = allComments.filter((c: Comment) => c.id !== commentId)
        localStorage.setItem('collab_comments', JSON.stringify(filtered))
        setFileComments(fileComments.filter(c => c.id !== commentId))
        ActivityLogger.log(ActivityTypes.DELETE_COMMENT, `Deleted comment`)
    }

    function getFileCommentCount(fileId: string): number {
        const allComments = JSON.parse(localStorage.getItem('collab_comments') || '[]')
        return allComments.filter((c: Comment) => c.projectId === project?.id && c.fileId === fileId).length
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
                    {project.files.map((f: any) => {
                        const fileVersions = JSON.parse(localStorage.getItem('collab_versions') || '[]')
                            .filter((v: any) => v.projectId === project.id && v.fileId === f.id)
                            .sort((a: any, b: any) => b.ts - a.ts)
                        const isExpanded = expandedFileVersions[f.id]
                        
                        return (
                            <div key={f.id} className="card" style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                                        <div style={{ 
                                            fontSize: '0.7rem', 
                                            fontWeight: '700', 
                                            color: 'white',
                                            background: '#2196f3',
                                            padding: '0.4rem 0.6rem',
                                            borderRadius: '6px',
                                            minWidth: '45px',
                                            textAlign: 'center',
                                            lineHeight: '1'
                                        }}>{getFileTypeLabel(f.name)}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem' }}>{f.name}</h4>
                                                {isTextFile(f.name) && <span className="badge success" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Editable</span>}
                                                {fileVersions.length > 0 && (
                                                    <span className="badge" style={{ background: '#f59e0b', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                                        v{fileVersions.length}
                                                    </span>
                                                )}
                                                {getFileCommentCount(f.id) > 0 && (
                                                    <span className="badge" style={{ background: '#e0e7ff', color: '#6366f1', fontSize: '0.7rem', padding: '0.2rem 0.5rem', fontWeight: '600' }}>
                                                        💬 {getFileCommentCount(f.id)}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <span className="text-muted text-sm">{f.type || 'unknown type'}</span>
                                                {f.dataUrl && <span className="text-muted text-sm">{formatFileSize(getFileSizeFromDataUrl(f.dataUrl))}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="btn-group" style={{ gap: '0.5rem' }}>
                                        <button onClick={() => openFilePreview(f)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View & Comment</button>
                                        {isTextFile(f.name) && (
                                            <Link to={`/editor/${project.id}/${f.id}`}>
                                                <button style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Edit</button>
                                            </Link>
                                        )}
                                        <button className="secondary" onClick={() => handleDownloadFile(f)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Download</button>
                                        {fileVersions.length > 0 && (
                                            <button 
                                                className="secondary" 
                                                onClick={() => setExpandedFileVersions(prev => ({...prev, [f.id]: !prev[f.id]}))}
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                            >
                                                🕒 {isExpanded ? 'Hide' : 'Versions'} ({fileVersions.length})
                                            </button>
                                        )}
                                        <button className="danger" onClick={() => deleteFile(f.id, f.name)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Delete</button>
                                    </div>
                                </div>

                                {isExpanded && fileVersions.length > 0 && (
                                    <div style={{ 
                                        marginTop: '1.5rem', 
                                        paddingTop: '1.5rem', 
                                        borderTop: '2px solid var(--gray-200)' 
                                    }}>
                                        <h5 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>📜 Version History</h5>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {fileVersions.map((v: any, idx: number) => (
                                                <div 
                                                    key={v.id} 
                                                    style={{ 
                                                        padding: '1rem',
                                                        background: idx === 0 ? '#f0f9ff' : '#f9fafb',
                                                        borderRadius: '8px',
                                                        border: idx === 0 ? '2px solid #3b82f6' : '1px solid var(--gray-200)',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: '1rem'
                                                    }}
                                                >
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                            <span style={{ 
                                                                fontWeight: 'bold',
                                                                color: idx === 0 ? '#3b82f6' : 'var(--gray-700)',
                                                                fontSize: '0.875rem'
                                                            }}>
                                                                v{fileVersions.length - idx}
                                                            </span>
                                                            {idx === 0 && <span className="badge primary text-xs">Latest</span>}
                                                            <span className="text-muted text-sm">{getTimeAgo(v.ts)}</span>
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{v.message}</p>
                                                        <p className="text-muted text-sm" style={{ margin: '0.25rem 0 0 0' }}>
                                                            by {v.author}
                                                        </p>
                                                    </div>
                                                    {idx !== 0 && (
                                                        <button 
                                                            className="secondary text-sm" 
                                                            onClick={() => restoreVersion(v)}
                                                            style={{ whiteSpace: 'nowrap' }}
                                                        >
                                                            Restore
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* File Preview Modal with Comments */}
            {selectedFile && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }} onClick={closeFilePreview}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        width: '95%',
                        maxWidth: '1400px',
                        height: '90vh',
                        display: 'flex',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        
                        {/* File Preview Section */}
                        <div style={{
                            flex: '1 1 65%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRight: '2px solid var(--gray-200)',
                            overflow: 'hidden'
                        }}>
                            {/* Header */}
                            <div style={{
                                padding: '1.5rem',
                                borderBottom: '2px solid var(--gray-200)',
                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>{selectedFile.name}</h3>
                                        <p className="text-muted text-sm" style={{ margin: 0 }}>
                                            {selectedFile.type} • {formatFileSize(getFileSizeFromDataUrl(selectedFile.dataUrl))}
                                        </p>
                                    </div>
                                    <button className="secondary" onClick={closeFilePreview}>✕ Close</button>
                                </div>
                            </div>

                            {/* Preview Area */}
                            <div style={{
                                flex: 1,
                                padding: '2rem',
                                overflow: 'auto',
                                background: '#fafafa'
                            }}>
                                {isTextFile(selectedFile.name) ? (
                                    <div style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--gray-200)',
                                        fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}>
                                        {selectedFile.dataUrl ? (() => {
                                            try {
                                                const arr = selectedFile.dataUrl.split(',')
                                                return atob(arr[1])
                                            } catch {
                                                return 'Unable to display file content'
                                            }
                                        })() : 'No content available'}
                                    </div>
                                ) : selectedFile.type?.startsWith('image/') ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <img 
                                            src={selectedFile.dataUrl} 
                                            alt={selectedFile.name}
                                            style={{ 
                                                maxWidth: '100%', 
                                                maxHeight: '70vh',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div style={{ fontSize: '4rem' }}>📄</div>
                                        <h3>Preview not available</h3>
                                        <p className="text-muted">This file type cannot be previewed in the browser</p>
                                        <button className="secondary" onClick={() => handleDownloadFile(selectedFile)}>
                                            Download to view
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comments Panel */}
                        <div style={{
                            flex: '0 0 35%',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'white',
                            maxWidth: '450px'
                        }}>
                            {/* Comments Header */}
                            <div style={{
                                padding: '1.5rem',
                                borderBottom: '2px solid var(--gray-200)',
                                background: '#fafafa'
                            }}>
                                <h4 style={{ margin: 0 }}>💬 Comments ({fileComments.length})</h4>
                                <p className="text-muted text-sm" style={{ margin: '0.25rem 0 0 0' }}>
                                    Discuss this file with your team
                                </p>
                            </div>

                            {/* Comments List */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '1rem'
                            }}>
                                {fileComments.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                                        <div style={{ fontSize: '3rem' }}>💭</div>
                                        <p className="text-muted text-sm">No comments yet</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {fileComments.map(comment => (
                                            <div key={comment.id} style={{
                                                padding: '1rem',
                                                background: '#f8fafc',
                                                borderRadius: '8px',
                                                border: '1px solid var(--gray-200)'
                                            }}>
                                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.875rem',
                                                        flexShrink: 0
                                                    }}>
                                                        {comment.author.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                                            <strong style={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>{comment.author}</strong>
                                                            <button 
                                                                className="danger text-xs" 
                                                                onClick={() => deleteComment(comment.id, comment.text)}
                                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                        <p className="text-muted text-xs" style={{ margin: '0 0 0.5rem 0' }}>
                                                            {getTimeAgo(comment.ts)}
                                                        </p>
                                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5', wordBreak: 'break-word' }}>
                                                            {comment.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add Comment Input */}
                            <div style={{
                                padding: '1rem',
                                borderTop: '2px solid var(--gray-200)',
                                background: '#fafafa'
                            }}>
                                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                    <textarea
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        placeholder="Add your comment..."
                                        rows={3}
                                        style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}
                                        onKeyDown={e => e.key === 'Enter' && e.ctrlKey && addComment()}
                                    />
                                    <small className="text-muted">Press Ctrl+Enter to post</small>
                                </div>
                                <button 
                                    className="success" 
                                    onClick={addComment} 
                                    disabled={!commentText.trim()}
                                    style={{ width: '100%' }}
                                >
                                    Post Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
