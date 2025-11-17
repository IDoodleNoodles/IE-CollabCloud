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

    React.useEffect(() => {
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: any) => x.id === projectId)
        const f = p?.files.find((x: any) => x.id === fileId)
        setMeta({ projectId, fileId, name: f?.name, type: f?.type, projectName: p?.name })
        if (f) {
            ActivityLogger.log(ActivityTypes.EDIT_FILE, `Opened file for editing: ${f.name}`)
            // try to decode dataUrl as text if text-like
            if (f.dataUrl?.startsWith('data:text') || f.name?.match(/\.(txt|md|py|js|json|css|html|ts|tsx|jsx)$/i)) {
                // decode
                const arr = f.dataUrl.split(',')
                const text = decodeFromBase64(arr[1])
                setContent(text)
                setLineCount(text.split('\n').length)
                setCharCount(text.length)
            } else {
                setContent('// binary or preview-only file')
            }
        }
    }, [projectId, fileId])

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
            <div className="empty-state">
                <div style={{ fontSize: '4rem' }}>⏳</div>
                <h3>Loading file...</h3>
            </div>
        )
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <button className="secondary" onClick={handleClose} style={{ marginBottom: '1rem' }}>
                    ← Back
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.25rem' }}>{meta.name}</h2>
                        <p className="text-muted">Project: {meta.projectName}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {unsaved && <span className="badge warning">Unsaved changes</span>}
                        <span className="badge">{lineCount} lines</span>
                        <span className="badge">{charCount} chars</span>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ 
                    background: 'var(--gray-100)', 
                    padding: '0.75rem 1rem', 
                    borderBottom: '2px solid var(--gray-200)',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center'
                }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>{meta.name}</span>
                </div>
                <textarea 
                    value={content} 
                    onChange={e => { setContent(e.target.value); setUnsaved(true) }} 
                    style={{ 
                        width: '100%', 
                        height: '500px',
                        border: 'none',
                        padding: '1.5rem',
                        fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        resize: 'vertical',
                        background: '#fafafa'
                    }}
                    placeholder="Start typing..."
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
                    zIndex: 1000
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
                        <h3>Commit Changes</h3>
                        <p className="text-muted" style={{ marginBottom: '1rem' }}>
                            Describe what changes you made to this file
                        </p>
                        <div className="form-group">
                            <label htmlFor="commit-message">Commit Message</label>
                            <input
                                id="commit-message"
                                type="text"
                                placeholder="e.g., Fixed bug in login function"
                                value={commitMessage}
                                onChange={e => setCommitMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                                autoFocus
                            />
                        </div>
                        <div className="btn-group">
                            <button className="success" onClick={handleSave} disabled={!commitMessage.trim()}>
                                Save & Commit
                            </button>
                            <button className="secondary" onClick={() => setShowCommitDialog(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div className="btn-group">
                    <button className="success" onClick={() => setShowCommitDialog(true)} disabled={!unsaved}>
                        Save & Commit
                    </button>
                    <button className="secondary" onClick={handleClose}>
                        Close Editor
                    </button>
                </div>
                <div className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center' }}>
                    {unsaved ? 'Remember to save your changes' : 'All changes saved'}
                </div>
            </div>
        </div>
    )
}
