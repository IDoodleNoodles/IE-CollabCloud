// API adapter: if VITE_API_BASE is set the adapter calls REST endpoints, otherwise it falls back to localStorage.
const API_BASE: string = (import.meta as any).env?.VITE_API_BASE || ''

let idCounter = 0

// Map server resources to frontend shape
function mapServerFile(f: any) {
    return {
        id: (f?.fileId != null ? String(f.fileId) : f?.id) || `f_${Date.now()}_${idCounter++}`,
        name: f?.fileName ?? f?.name ?? 'untitled',
        type: f?.fileType ?? f?.type ?? 'unknown',
        dataUrl: undefined as string | undefined,
    }
}

function mapServerProject(p: any) {
    const id = (p?.projectId != null ? String(p.projectId) : (p?.id != null ? String(p.id) : undefined))
    return {
        id: id || `p_${Date.now()}_${idCounter++}`,
        name: p?.title ?? p?.name ?? 'Untitled',
        // ProjectEntity JSON ignores files; fetch separately when needed
        files: Array.isArray(p?.files) ? p.files.map(mapServerFile) : [],
    }
}

async function restFetch(path: string, opts: RequestInit = {}) {
    const headers = opts.headers ? opts.headers as any : {}
    if (localStorage.getItem('collab_token')) headers['Authorization'] = 'Bearer ' + localStorage.getItem('collab_token')
    const res = await fetch((API_BASE || '') + path, { ...opts, headers })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(text || res.statusText)
    }
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) return res.json()
    return res.blob()
}

// Normalize backend comment to frontend shape
function mapServerComment(c: any) {
    return {
        id: (c?.commentId != null ? String(c.commentId) : c?.id) || 'c_' + Date.now(),
        text: c?.content ?? c?.text ?? '',
        author: c?.email ?? c?.user?.email ?? 'Anonymous',
        ts: c?.createdDate ? new Date(c.createdDate).getTime() : (c?.ts ?? Date.now()),
    }
}

const api = {
    // Auth
    async register(email: string, password: string, name?: string) {
        if (API_BASE) {
            const data: any = await restFetch('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) })
            // Normalize: ensure both id and userId are set
            return {
                ...data,
                id: data.userId || data.id,
                userId: data.userId || data.id
            }
        }
        const users = JSON.parse(localStorage.getItem('collab_users') || '[]')
        if (users.some((u: any) => u.email === email)) throw new Error('email exists')
        const id = 'u_' + Date.now()
        users.push({ id, email, password, name })
        localStorage.setItem('collab_users', JSON.stringify(users))
        return { id, email, name }
    },
    async login(email: string, password: string) {
        if (API_BASE) {
            const data: any = await restFetch('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
            if (data.accessToken) localStorage.setItem('collab_token', data.accessToken)
            // Normalize: backend returns {id, userId, email, name, role}
            // Ensure both id and userId are set for compatibility
            const user = data.user || data
            return {
                ...user,
                id: user.userId || user.id,
                userId: user.userId || user.id
            }
        }
        const users = JSON.parse(localStorage.getItem('collab_users') || '[]')
        const found = users.find((u: any) => u.email === email && u.password === password)
        if (!found) throw new Error('invalid credentials')
        return { id: found.id, email: found.email }
    },
    async resetPassword(email: string) {
        if (API_BASE) {
            return restFetch('/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
        }
        const users = JSON.parse(localStorage.getItem('collab_users') || '[]')
        if (!users.some((u: any) => u.email === email)) throw new Error('not found')
        return { ok: true }
    },

    // Projects & files
    async createProject(name: string, files: any[]) {
        if (API_BASE) {
            // Get current user from localStorage
            const userStr = localStorage.getItem('collab_user')
            if (!userStr) {
                throw new Error('User not logged in')
            }
            const user = JSON.parse(userStr)
            console.log('[API] createProject user from localStorage:', user)

            // Backend expects JSON Project payload at /api/projects
            // Use userId field (backend primary key) if available, otherwise id
            const creatorId = user.userId || user.id
            console.log('[API] createProject using creator ID:', creatorId)

            if (!creatorId) {
                throw new Error('Invalid user session. Please log out and log back in.')
            }

            const payload = {
                title: name,
                description: '',
                creator: {
                    userId: creatorId
                }
            }
            const created = await restFetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            console.log('[API] Project created:', created)

            // Now create file records for each file
            const projectId = created.projectId
            if (files && files.length > 0 && projectId) {
                console.log('[API] Creating', files.length, 'file records for project', projectId)
                for (const file of files) {
                    try {
                        const filePayload = {
                            fileName: file.name,
                            fileType: file.type || 'application/octet-stream',
                            filePath: `/uploads/${projectId}/${file.name}`, // Placeholder path
                            project: {
                                projectId: projectId
                            }
                        }
                        await restFetch('/api/files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filePayload) })
                        console.log('[API] Created file record:', file.name)
                    } catch (err) {
                        console.error('[API] Failed to create file record for', file.name, ':', err)
                    }
                }

                // Re-fetch project with files
                return api.getProject(String(projectId))
            }

            return mapServerProject(created)
        }
        const projects = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const proj = { id: 'p_' + Date.now(), name, files }
        projects.unshift(proj)
        localStorage.setItem('collab_projects', JSON.stringify(projects))
        return proj
    },
    async getProjects() {
        if (API_BASE) {
            try {
                const list = await restFetch('/api/projects')
                const mapped = Array.isArray(list) ? list.map(mapServerProject) : []
                console.log('[API] getProjects returned', mapped.length, 'projects', mapped)
                return mapped
            } catch (err) {
                console.error('[API] getProjects failed:', err)
                return []
            }
        }
        return JSON.parse(localStorage.getItem('collab_projects') || '[]')
    },
    async getProject(id: string) {
        if (API_BASE) {
            // Fetch project core
            const p = await restFetch(`/api/projects/${id}`)
            const project = mapServerProject(p)
            console.log('[API] getProject base:', project)
            // Try to fetch files for this project
            try {
                const files = await restFetch(`/api/files/project/${p?.projectId ?? id}`)
                console.log('[API] getProject files:', files)
                if (Array.isArray(files)) project.files = files.map(mapServerFile)
            } catch (err) {
                console.warn('[API] getProject files fetch failed:', err)
                // ignore, leave files as []
            }
            console.log('[API] getProject final:', project)
            return project
        }
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        return all.find((p: any) => p.id === id)
    },
    async deleteProject(id: string) {
        if (API_BASE) return restFetch(`/api/projects/${id}`, { method: 'DELETE' })
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const next = all.filter((p: any) => p.id !== id)
        localStorage.setItem('collab_projects', JSON.stringify(next))
        return { ok: true }
    },
    async uploadFiles(projectId: string, fileMetas: any[]) {
        if (API_BASE) {
            // No dedicated backend endpoint provided; placeholder for future implementation
            // Fallback to returning current project after a no-op
            return restFetch(`/api/projects/${projectId}`, { method: 'GET' })
        }
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: any) => x.id === projectId)
        p.files = p.files.concat(fileMetas)
        localStorage.setItem('collab_projects', JSON.stringify(all))
        return p
    },
    async deleteFile(projectId: string, fileId: string) {
        if (API_BASE) {
            await restFetch(`/api/files/${fileId}`, { method: 'DELETE' })
            // Re-fetch the project with updated files
            return api.getProject(projectId)
        }
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: any) => x.id === projectId)
        p.files = p.files.filter((f: any) => f.id !== fileId)
        localStorage.setItem('collab_projects', JSON.stringify(all))
        return p
    },

    // Versions
    async saveVersion(projectId: string, fileId: string, content: string, message: string) {
        if (API_BASE) return restFetch(`/projects/${projectId}/files/${fileId}/versions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, message }) })
        const versions = JSON.parse(localStorage.getItem('collab_versions') || '[]')
        const v = { id: 'v_' + Date.now(), projectId, fileId, content, message, author: localStorage.getItem('collab_user') ? JSON.parse(localStorage.getItem('collab_user')!).email : 'anonymous', ts: Date.now() }
        versions.unshift(v)
        localStorage.setItem('collab_versions', JSON.stringify(versions))
        // also update file dataUrl
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: any) => x.id === projectId)
        const f = p?.files.find((x: any) => x.id === fileId)
        if (f) { f.dataUrl = 'data:text/plain;base64,' + btoa(encodeURIComponent(content)); localStorage.setItem('collab_projects', JSON.stringify(all)) }
        return v
    },
    async listVersions() {
        if (API_BASE) return restFetch('/versions')
        return JSON.parse(localStorage.getItem('collab_versions') || '[]')
    },
    async restoreVersion(projectId: string, fileId: string, versionId: string) {
        if (API_BASE) return restFetch(`/projects/${projectId}/files/${fileId}/versions/${versionId}/restore`, { method: 'POST' })
        const versions = JSON.parse(localStorage.getItem('collab_versions') || '[]')
        const v = versions.find((x: any) => x.id === versionId)
        if (!v) throw new Error('version not found')
        const all = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: any) => x.id === projectId)
        const f = p.files.find((x: any) => x.id === fileId)
        f.dataUrl = 'data:text/plain;base64,' + btoa(encodeURIComponent(v.content))
        localStorage.setItem('collab_projects', JSON.stringify(all))
        return { ok: true }
    },

    // Comments
    async getComments() {
        if (API_BASE) {
            const data: any[] = await restFetch('/api/comments')
            return Array.isArray(data) ? data.map(mapServerComment) : []
        }
        return JSON.parse(localStorage.getItem('collab_comments') || '[]')
    },
    async postComment(text: string, fileId?: number) {
        if (API_BASE) {
            const userStr = localStorage.getItem('collab_user')
            const user = userStr ? JSON.parse(userStr) : null

            if (!user?.userId && !user?.id) {
                throw new Error('User must be logged in to post comments')
            }

            const payload: any = {
                content: text,
                email: user?.email || 'Anonymous',
                user: {
                    userId: user?.userId || user?.id
                }
            }

            // File is optional - only add if provided
            if (fileId) {
                payload.file = { fileId: fileId }
            }

            const saved = await restFetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            return mapServerComment(saved)
        }
        const comments = JSON.parse(localStorage.getItem('collab_comments') || '[]')
        const author = localStorage.getItem('collab_user') ? JSON.parse(localStorage.getItem('collab_user')!).email : 'anon'
        const c = { id: 'c_' + Date.now(), text, author, ts: Date.now() }
        const next = [c, ...comments]
        localStorage.setItem('collab_comments', JSON.stringify(next))
        return c
    },
    async deleteComment(id: string) {
        if (API_BASE) return restFetch(`/api/comments/${id}`, { method: 'DELETE' })
        const comments = JSON.parse(localStorage.getItem('collab_comments') || '[]')
        const next = comments.filter((c: any) => c.id !== id)
        localStorage.setItem('collab_comments', JSON.stringify(next))
        return { ok: true }
    },

    // Profile
    async getProfile() {
        if (API_BASE) return restFetch('/users/me')
        return JSON.parse(localStorage.getItem('collab_profile') || '{}')
    },
    async saveProfile(profile: any) {
        if (API_BASE) return restFetch('/users/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) })
        localStorage.setItem('collab_profile', JSON.stringify(profile))
        return profile
    }
}

export default api
