import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'
import { encodeToBase64, decodeFromBase64 } from '../utils/helpers'
import api from '../services/api'
import session from '../services/session'

export default function Editor() {
    const { projectId, fileId } = useParams()
    const navigate = useNavigate()
    const [content, setContent] = React.useState('')
    const [meta, setMeta] = React.useState<any>(null)
    const [unsaved, setUnsaved] = React.useState(false)
    const [commitMessage, setCommitMessage] = React.useState('')
    const [showCommitDialog, setShowCommitDialog] = React.useState(false)
    const [lineCount, setLineCount] = React.useState(1)
    const [charCount, setCharCount] = React.useState(0)
    const [loading, setLoading] = React.useState(true)
    const [imageUrl, setImageUrl] = React.useState<string | null>(null)
    const isReadOnly = new URLSearchParams(window.location.search).get('readonly') === 'true'

    React.useEffect(() => {
        async function loadFile() {
            console.log('[Editor] Loading file:', { projectId, fileId })
            setLoading(true)
            try {
                const urlParams = new URLSearchParams(window.location.search)
                const versionId = urlParams.get('versionId')

                // Always load project & file from backend
                console.log('[Editor] Loading from API...')
                const p = await api.getProject(projectId as string)
                console.log('[Editor] Project from API:', p)
                const f = p?.files?.find((x: any) => String(x.id) === String(fileId))
                console.log('[Editor] File from API:', f)

                if (!p) {
                    console.error('[Editor] Project not found (backend)')
                    alert('Project not found')
                    navigate('/projects')
                    return
                }

                if (!f) {
                    console.error('[Editor] File not found in project (backend)')
                    alert('File not found')
                    navigate(`/projects/${projectId}`)
                    return
                }

                setMeta({ projectId, fileId, name: f?.name, type: f?.type, projectName: p?.name })

                // If viewing a specific version, load that version's content from API
                if (versionId && isReadOnly) {
                    try {
                        const versions = await api.listVersions()
                        const version = versions.find((v: any) => String(v.id) === String(versionId))
                        if (version) {
                            setContent(version.content)
                            setLineCount(version.content.split('\n').length)
                            setCharCount(version.content.length)
                            ActivityLogger.log(ActivityTypes.EDIT_FILE, `Viewing version: ${version.message}`, projectId)
                            setLoading(false)
                            return
                        }
                    } catch (err) {
                        console.warn('[Editor] Failed to load versions from API:', err)
                    }
                }

                ActivityLogger.log(ActivityTypes.EDIT_FILE, `Opened file for editing: ${f.name}`, projectId)

                // Load file content
                if (f.dataUrl && !f.dataUrl.startsWith('data:')) {
                    // File is stored on backend, fetch it
                    console.log('[Editor] Fetching file content from backend:', f.dataUrl)

                    // Check if file is an image
                    const isImage = f.type?.startsWith('image/')

                    if (isImage) {
                        // For images, just set the URL for preview
                        const imagePreviewUrl = `/api/files/${fileId}/download`
                        setImageUrl(imagePreviewUrl)
                        console.log('[Editor] Image file, using preview URL:', imagePreviewUrl)
                        setLoading(false)
                        return
                    }

                    try {
                        // Add timestamp to prevent caching
                        const cacheBuster = `?t=${Date.now()}`
                        const response = await fetch(`/api/files/${fileId}/download${cacheBuster}`, {
                            cache: 'no-store'
                        })
                        if (response.ok) {
                            const blob = await response.blob()
                            const text = await blob.text()
                            setContent(text)
                            setLineCount(text.split('\n').length)
                            setCharCount(text.length)
                            console.log('[Editor] File content loaded from backend')
                        } else {
                            console.error('[Editor] Failed to fetch file:', response.status)
                            setContent('// Error loading file from server')
                        }
                    } catch (err) {
                        console.error('[Editor] Error fetching file:', err)
                        setContent('// Error loading file from server')
                    }
                } else {
                    // Decode from data URL or handle images
                    const isImage = f.type?.startsWith('image/')

                    if (isImage && f.dataUrl?.startsWith('data:')) {
                        // For data URL images, use directly for preview
                        setImageUrl(f.dataUrl)
                        console.log('[Editor] Image file with data URL')
                        setLoading(false)
                        return
                    }

                    try {
                        if (f.dataUrl?.startsWith('data:text') || f.name?.match(/\.(txt|md|py|js|json|css|html|ts|tsx|jsx)$/i)) {
                            const arr = f.dataUrl.split(',')
                            if (arr[1]) {
                                const text = decodeFromBase64(arr[1])
                                setContent(text)
                                setLineCount(text.split('\n').length)
                                setCharCount(text.length)
                            } else {
                                setContent('// Empty file')
                            }
                        } else {
                            setContent('// Binary or preview-only file')
                        }
                    } catch (error) {
                        console.error('[Editor] Error decoding file:', error)
                        setContent('// Error loading file content')
                    }
                }
            } catch (error) {
                console.error('[Editor] Error loading file:', error)
                alert('Error loading file')
            } finally {
                setLoading(false)
            }
        }

        loadFile()
    }, [projectId, fileId, isReadOnly, navigate])

    React.useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (unsaved) { e.preventDefault(); e.returnValue = ''; }
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [unsaved])

    React.useEffect(() => {
        setLineCount(content.split('\n').length)
        setCharCount(content.length)
    }, [content])

    async function handleSave() {
        if (!commitMessage.trim()) {
            setShowCommitDialog(true)
            return
        }

        try {
            // Get current user for tracking
            const user = session.getUser()
            const userId = user?.userId || user?.id

            // Update file content on backend
            const token = session.getToken()
            try {
                await fetch(`/api/files/${fileId}/content`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ 
                        content,
                        userId: userId ? String(userId) : undefined
                    })
                })
            } catch (err) {
                console.warn('[Editor] Failed to update file content via API:', err)
            }

            // Save version using API
            await api.saveVersion(
                projectId as string,
                fileId as string,
                content,
                commitMessage
            )

            ActivityLogger.log(ActivityTypes.SAVE_VERSION, `Saved version: ${commitMessage} for file: ${meta?.name}`, projectId)
            setUnsaved(false)
            setShowCommitDialog(false)
            setCommitMessage('')
            alert('✅ Changes saved successfully!')
        } catch (error) {
            console.error('[Editor] Error saving version:', error)
            alert('❌ Failed to save changes. Please try again.')
        }
    }

    function handleClose() {
        if (unsaved && !confirm('You have unsaved changes. Are you sure you want to close?')) {
            return
        }
        setUnsaved(false)
        navigate(-1)
    }

    if (loading || !meta) {
        return (
            <div style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                background: '#F0F4F9',
                minHeight: '100vh'
            }}>
                <div style={{ fontSize: '4rem' }}>⏳</div>
                <h3>Loading file...</h3>
            </div>
        )
    }

    return (
        <div style={{
            padding: '2rem 3rem',
            background: '#F0F4F9',
            minHeight: '100vh'
        }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <button
                    onClick={handleClose}
                    style={{
                        padding: '0.625rem 1.25rem',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        background: 'white',
                        color: '#5F6368',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    ← Back
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{
                            marginBottom: '0.25rem',
                            fontSize: '1.875rem',
                            fontWeight: '600',
                            color: '#202124'
                        }}>{meta.name}</h2>
                        <p style={{
                            color: '#5F6368',
                            fontSize: '0.875rem',
                            margin: 0
                        }}>Project: {meta.projectName}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {unsaved && (
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                background: '#FEF3C7',
                                color: '#92400E',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                            }}>Unsaved changes</span>
                        )}
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            background: '#E8F0FE',
                            color: '#4285F4',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                        }}>{meta.type || 'unknown'}</span>
                        {!imageUrl && (
                            <>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    background: '#E8F0FE',
                                    color: '#4285F4',
                                    fontSize: '0.75rem',
                                    fontWeight: '500'
                                }}>{lineCount} lines</span>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    background: '#E8F0FE',
                                    color: '#4285F4',
                                    fontSize: '0.75rem',
                                    fontWeight: '500'
                                }}>{charCount} chars</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div style={{
                padding: 0,
                overflow: 'hidden',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                border: '1px solid #E5E7EB'
            }}>
                <div style={{
                    background: '#F9FAFB',
                    padding: '0.75rem 1rem',
                    borderBottom: '2px solid #E5E7EB',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center'
                }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: '#5F6368' }}>{meta.name}</span>
                </div>

                {imageUrl ? (
                    // Image preview
                    <div style={{
                        padding: '2rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '500px',
                        background: '#fafafa'
                    }}>
                        <img
                            src={imageUrl}
                            alt={meta.name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '700px',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                    </div>
                ) : (
                    // Text editor
                    <textarea
                        value={content}
                        onChange={e => { if (!isReadOnly) { setContent(e.target.value); setUnsaved(true) } }}
                        readOnly={isReadOnly}
                        style={{
                            width: '100%',
                            height: '500px',
                            border: 'none',
                            padding: '1.5rem',
                            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            resize: 'vertical',
                            background: isReadOnly ? '#f5f5f5' : '#fafafa',
                            cursor: isReadOnly ? 'default' : 'text'
                        }}
                        placeholder={isReadOnly ? "Read-only view" : "Start typing..."}
                    />
                )}
            </div>

            {showCommitDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        width: '90%',
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#202124',
                            marginBottom: '0.5rem'
                        }}>Commit Changes</h3>
                        <p style={{
                            color: '#5F6368',
                            fontSize: '14px',
                            marginBottom: '1.5rem'
                        }}>
                            Describe what changes you made to this file
                        </p>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                htmlFor="commit-message"
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#202124',
                                    marginBottom: '0.5rem'
                                }}
                            >Commit Message</label>
                            <input
                                id="commit-message"
                                type="text"
                                placeholder="e.g., Fixed bug in login function"
                                value={commitMessage}
                                onChange={e => setCommitMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                                autoFocus
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
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={handleSave}
                                disabled={!commitMessage.trim()}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: !commitMessage.trim() ? '#E5E7EB' : '#4285F4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: !commitMessage.trim() ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setShowCommitDialog(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'white',
                                    color: '#5F6368',
                                    border: '1px solid #DADCE0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {!isReadOnly && !imageUrl && (
                        <button
                            onClick={() => setShowCommitDialog(true)}
                            disabled={!unsaved}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: !unsaved ? '#E5E7EB' : '#4285F4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: !unsaved ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Save Changes
                        </button>
                    )}
                    <button
                        onClick={handleClose}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'white',
                            color: '#5F6368',
                            border: '1px solid #DADCE0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        {isReadOnly ? 'Close' : 'Close Editor'}
                    </button>
                </div>
                <div style={{
                    fontSize: '0.875rem',
                    color: '#5F6368',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {imageUrl ? 'Image preview' : (isReadOnly ? 'Read-only view' : (unsaved ? 'Remember to save your changes' : 'All changes saved'))}
                </div>
            </div>
        </div>
    )
}
