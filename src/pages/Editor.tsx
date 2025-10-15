import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function Editor() {
    const { projectId, fileId } = useParams()
    const navigate = useNavigate()
    const [content, setContent] = React.useState('')
    const [meta, setMeta] = React.useState<any>(null)
    const [unsaved, setUnsaved] = React.useState(false)

    React.useEffect(() => {
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: any) => x.id === projectId)
        const f = p?.files.find((x: any) => x.id === fileId)
        setMeta({ projectId, fileId, name: f?.name, type: f?.type })
        if (f) {
            // try to decode dataUrl as text if text-like
            if (f.dataUrl?.startsWith('data:text') || f.name?.match(/\.(txt|md|py|js|json|css|html)$/i)) {
                // decode
                const arr = f.dataUrl.split(',')
                const text = decodeURIComponent(escape(atob(arr[1].replace(/\s/g, ''))))
                setContent(text)
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

    function save(commitMessage = 'Manual save') {
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: any) => x.id === projectId)
        const f = p.files.find((x: any) => x.id === fileId)
        // create dataUrl from text
        const b64 = btoa(unescape(encodeURIComponent(content)))
        f.dataUrl = 'data:text/plain;base64,' + b64
        // store version
        const versions = JSON.parse(localStorage.getItem('collab_versions') || '[]')
        versions.unshift({ id: 'v_' + Date.now(), projectId, fileId, content, message: commitMessage, author: localStorage.getItem('collab_user') ? JSON.parse(localStorage.getItem('collab_user')!).email : 'anonymous', ts: Date.now() })
        localStorage.setItem('collab_versions', JSON.stringify(versions))
        localStorage.setItem('collab_projects', JSON.stringify(all))
        setUnsaved(false)
        alert('Saved: ' + commitMessage)
    }

    if (!meta) return <div>Loading file...</div>

    return (
        <div>
            <h3>Editing: {meta.name}</h3>
            <textarea value={content} onChange={e => { setContent(e.target.value); setUnsaved(true) }} style={{ width: '100%', height: 320 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => save(prompt('Commit message', 'Update file') || 'Manual save')}>Save & Commit</button>
                <button onClick={() => { setUnsaved(false); navigate(-1) }}>Close</button>
            </div>
        </div>
    )
}
