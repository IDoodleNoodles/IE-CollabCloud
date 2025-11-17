import type { 
    User, 
    AuthResponse, 
    Project, 
    ProjectFile, 
    Version, 
    Comment, 
    Profile
} from '../types'

// API adapter: if VITE_API_BASE is set the adapter calls REST endpoints, otherwise it falls back to localStorage.
const API_BASE: string = (import.meta as any).env?.VITE_API_BASE || ''

async function restFetch(path: string, opts: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = opts.headers ? { ...(opts.headers as Record<string, string>) } : {}
    const token = localStorage.getItem('collab_token')
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    
    const res = await fetch((API_BASE || '') + path, { ...opts, headers })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(text || res.statusText)
    }
    
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
        return res.json()
    }
    return res.blob()
}

const api = {
    // Auth
    async register(email: string, password: string, name?: string): Promise<User> {
        if (API_BASE) {
            return restFetch('/auth/register', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ email, password, name }) 
            })
        }
        const users: User[] = JSON.parse(localStorage.getItem('collab_users') || '[]')
        if (users.some((u: User) => u.email === email)) {
            throw new Error('email exists')
        }
        const id = 'u_' + Date.now()
        const newUser: User = { id, email, password, name }
        users.push(newUser)
        localStorage.setItem('collab_users', JSON.stringify(users))
        return { id, email, name }
    },
    
    async login(email: string, password: string): Promise<User> {
        if (API_BASE) {
            const data: AuthResponse = await restFetch('/auth/login', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ email, password }) 
            })
            if (data.accessToken) {
                localStorage.setItem('collab_token', data.accessToken)
            }
            return data.user
        }
        const users: User[] = JSON.parse(localStorage.getItem('collab_users') || '[]')
        const found = users.find((u: User) => u.email === email && u.password === password)
        if (!found) {
            throw new Error('invalid credentials')
        }
        return { id: found.id, email: found.email, name: found.name }
    },
    
    async resetPassword(email: string): Promise<{ ok: boolean }> {
        if (API_BASE) {
            return restFetch('/auth/reset-password', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ email }) 
            })
        }
        const users: User[] = JSON.parse(localStorage.getItem('collab_users') || '[]')
        if (!users.some((u: User) => u.email === email)) {
            throw new Error('not found')
        }
        return { ok: true }
    },

    // Projects & files
    async createProject(name: string, files: ProjectFile[]): Promise<Project> {
        if (API_BASE) {
            const fd = new FormData()
            fd.append('name', name)
            for (const f of files) {
                const fileBlob = (f as any).blob || f
                fd.append('files', fileBlob, f.name)
            }
            return restFetch('/projects', { method: 'POST', body: fd })
        }
        const projects: Project[] = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const proj: Project = { 
            id: 'p_' + Date.now(), 
            name, 
            files,
            createdAt: Date.now()
        }
        projects.unshift(proj)
        localStorage.setItem('collab_projects', JSON.stringify(projects))
        return proj
    },
    
    async getProjects(): Promise<Project[]> {
        if (API_BASE) return restFetch('/projects')
        return JSON.parse(localStorage.getItem('collab_projects') || '[]')
    },
    
    async getProject(id: string): Promise<Project | undefined> {
        if (API_BASE) return restFetch(`/projects/${id}`)
        const all: Project[] = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        return all.find((p: Project) => p.id === id)
    },
    
    async deleteProject(id: string): Promise<{ ok: boolean }> {
        if (API_BASE) return restFetch(`/projects/${id}`, { method: 'DELETE' })
        const all: Project[] = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const next = all.filter((p: Project) => p.id !== id)
        localStorage.setItem('collab_projects', JSON.stringify(next))
        return { ok: true }
    },
    
    async uploadFiles(projectId: string, fileMetas: ProjectFile[]): Promise<Project | undefined> {
        if (API_BASE) {
            const fd = new FormData()
            for (const f of fileMetas) {
                const fileBlob = (f as any).blob || f
                fd.append('files', fileBlob, f.name)
            }
            return restFetch(`/projects/${projectId}/files`, { method: 'POST', body: fd })
        }
        const all: Project[] = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: Project) => x.id === projectId)
        if (p) {
            p.files = p.files.concat(fileMetas)
            localStorage.setItem('collab_projects', JSON.stringify(all))
        }
        return p
    },
    
    async deleteFile(projectId: string, fileId: string): Promise<Project | undefined> {
        if (API_BASE) return restFetch(`/projects/${projectId}/files/${fileId}`, { method: 'DELETE' })
        const all: Project[] = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: Project) => x.id === projectId)
        if (p) {
            p.files = p.files.filter((f: ProjectFile) => f.id !== fileId)
            localStorage.setItem('collab_projects', JSON.stringify(all))
        }
        return p
    },

    // Versions
    async saveVersion(projectId: string, fileId: string, content: string, message: string): Promise<Version> {
        if (API_BASE) {
            return restFetch(`/projects/${projectId}/files/${fileId}/versions`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ content, message }) 
            })
        }
        const versions: Version[] = JSON.parse(localStorage.getItem('collab_versions') || '[]')
        const userStr = localStorage.getItem('collab_user')
        const author = userStr ? JSON.parse(userStr).email : 'anonymous'
        
        const v: Version = { 
            id: 'v_' + Date.now(), 
            projectId, 
            fileId, 
            content, 
            message, 
            author, 
            ts: Date.now() 
        }
        versions.unshift(v)
        localStorage.setItem('collab_versions', JSON.stringify(versions))
        
        // also update file dataUrl
        const all: Project[] = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: Project) => x.id === projectId)
        const f = p?.files.find((x: ProjectFile) => x.id === fileId)
        if (f) { 
            f.dataUrl = 'data:text/plain;base64,' + btoa(encodeURIComponent(content))
            localStorage.setItem('collab_projects', JSON.stringify(all)) 
        }
        return v
    },
    
    async listVersions(): Promise<Version[]> {
        if (API_BASE) return restFetch('/versions')
        return JSON.parse(localStorage.getItem('collab_versions') || '[]')
    },
    
    async restoreVersion(projectId: string, fileId: string, versionId: string): Promise<{ ok: boolean }> {
        if (API_BASE) {
            return restFetch(`/projects/${projectId}/files/${fileId}/versions/${versionId}/restore`, { method: 'POST' })
        }
        const versions: Version[] = JSON.parse(localStorage.getItem('collab_versions') || '[]')
        const v = versions.find((x: Version) => x.id === versionId)
        if (!v) throw new Error('version not found')
        
        const all: Project[] = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const p = all.find((x: Project) => x.id === projectId)
        const f = p?.files.find((x: ProjectFile) => x.id === fileId)
        if (f) {
            f.dataUrl = 'data:text/plain;base64,' + btoa(encodeURIComponent(v.content))
            localStorage.setItem('collab_projects', JSON.stringify(all))
        }
        return { ok: true }
    },

    // Comments
    async getComments(): Promise<Comment[]> {
        if (API_BASE) return restFetch('/comments')
        return JSON.parse(localStorage.getItem('collab_comments') || '[]')
    },
    
    async postComment(text: string, projectId: string = '', fileId: string = ''): Promise<Comment> {
        if (API_BASE) {
            return restFetch('/projects/comments', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ text, projectId, fileId }) 
            })
        }
        const comments: Comment[] = JSON.parse(localStorage.getItem('collab_comments') || '[]')
        const userStr = localStorage.getItem('collab_user')
        const author = userStr ? JSON.parse(userStr).email : 'anon'
        
        const c: Comment = { 
            id: 'c_' + Date.now(), 
            projectId,
            fileId,
            text, 
            author, 
            ts: Date.now() 
        }
        const next = [c, ...comments]
        localStorage.setItem('collab_comments', JSON.stringify(next))
        return c
    },
    
    async deleteComment(id: string): Promise<{ ok: boolean }> {
        if (API_BASE) return restFetch(`/comments/${id}`, { method: 'DELETE' })
        const comments: Comment[] = JSON.parse(localStorage.getItem('collab_comments') || '[]')
        const next = comments.filter((c: Comment) => c.id !== id)
        localStorage.setItem('collab_comments', JSON.stringify(next))
        return { ok: true }
    },

    // Profile
    async getProfile(): Promise<Profile> {
        if (API_BASE) return restFetch('/users/me')
        return JSON.parse(localStorage.getItem('collab_profile') || '{}')
    },
    
    async saveProfile(profile: Profile): Promise<Profile> {
        if (API_BASE) {
            return restFetch('/users/me', { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(profile) 
            })
        }
        localStorage.setItem('collab_profile', JSON.stringify(profile))
        return profile
    }
}

export default api
