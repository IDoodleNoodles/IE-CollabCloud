import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'
import { encodeToBase64, decodeFromBase64 } from '../utils/helpers'

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
    const isReadOnly = new URLSearchParams(window.location.search).get('readonly') === 'true'

    React.useEffect(() => {
        console.log('Editor loading:', { projectId, fileId })
        const urlParams = new URLSearchParams(window.location.search)
        const versionId = urlParams.get('versionId')
        
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        console.log('All projects:', all)
        const p = all.find((x: any) => x.id === projectId)
        console.log('Found project:', p)
        const f = p?.files.find((x: any) => x.id === fileId)
        console.log('Found file:', f)
        
        if (!p) {
            console.error('Project not found')
            return
        }
        
        if (!f) {
            console.error('File not found')
            return
        }
        
        setMeta({ projectId, fileId, name: f?.name, type: f?.type, projectName: p?.name })
        
        // If viewing a specific version, load that version's content
        if (versionId && isReadOnly) {
            const versions = JSON.parse(localStorage.getItem('collab_versions') || '[]')
            const version = versions.find((v: any) => v.id === versionId)
            if (version) {
                setContent(version.content)
                setLineCount(version.content.split('\n').length)
                setCharCount(version.content.length)
                ActivityLogger.log(ActivityTypes.EDIT_FILE, `Viewing version: ${version.message}`)
                return
            }
        }
        
        ActivityLogger.log(ActivityTypes.EDIT_FILE, `Opened file for editing: ${f.name}`)
        
        // try to decode dataUrl as text if text-like
        try {
            if (f.dataUrl?.startsWith('data:text') || f.name?.match(/\.(txt|md|py|js|json|css|html|ts|tsx|jsx)$/i)) {
                // decode
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
            console.error('Error decoding file:', error)
            setContent('// Error loading file content')
        }
    }, [projectId, fileId, isReadOnly])

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

    function handleSave() {
        if (!commitMessage.trim()) {
            setShowCommitDialog(true)
            return
        }
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: any) => x.id === projectId)
        const f = p.files.find((x: any) => x.id === fileId)
        // create dataUrl from text
        const b64 = encodeToBase64(content)
        f.dataUrl = 'data:text/plain;base64,' + b64
        // store version
        const versions = JSON.parse(localStorage.getItem('collab_versions') || '[]')
        const author = localStorage.getItem('collab_user') ? JSON.parse(localStorage.getItem('collab_user')!).email : 'anonymous'
        versions.unshift({ id: 'v_' + Date.now(), projectId, fileId, content, message: commitMessage, author, ts: Date.now() })
        localStorage.setItem('collab_versions', JSON.stringify(versions))
        localStorage.setItem('collab_projects', JSON.stringify(all))
        ActivityLogger.log(ActivityTypes.SAVE_VERSION, `Saved version: ${commitMessage} for file: ${f.name}`)
        setUnsaved(false)
        setShowCommitDialog(false)
        setCommitMessage('')
        alert('✅ Changes saved successfully!')
    }

    function handleClose() {
        if (unsaved && !confirm('You have unsaved changes. Are you sure you want to close?')) {
            return
        }
        setUnsaved(false)
        navigate(-1)
    }

    if (!meta) {
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
                        }}>{lineCount} lines</span>
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            background: '#E8F0FE',
                            color: '#4285F4',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                        }}>{charCount} chars</span>
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
                    {!isReadOnly && (
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
                    {isReadOnly ? 'Read-only view' : (unsaved ? 'Remember to save your changes' : 'All changes saved')}
                </div>
            </div>
        </div>
    )
}
