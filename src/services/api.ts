import type {
    User,
    AuthResponse,
    Project,
    ProjectFile,
    Version,
    Comment,
    Profile
} from '../types'

// API adapter: All operations now use the REST API backed by SQL database
const API_BASE: string = (import.meta as any).env?.VITE_API_BASE || ''

if (!API_BASE) {
    console.error('[API] VITE_API_BASE not configured! All API calls will fail.')
}

async function restFetch(path: string, opts: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = opts.headers ? { ...(opts.headers as Record<string, string>) } : {}
    const token = localStorage.getItem('collab_token')
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const url = (API_BASE || '') + path
    console.log('[restFetch] Request:', opts.method || 'GET', url)
    if (opts.body && typeof opts.body === 'string') {
        const bodyPreview = opts.body.length > 500 ? opts.body.substring(0, 500) + '...' : opts.body
        console.log('[restFetch] Body preview:', bodyPreview)
    }

    const res = await fetch(url, { ...opts, headers })
    console.log('[restFetch] Response status:', res.status, res.statusText)

    if (!res.ok) {
        const text = await res.text()
        console.error('[restFetch] Error response:', text)
        throw new Error(text || res.statusText)
    }

    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
        const json = await res.json()
        console.log('[restFetch] Response JSON:', json)
        return json
    }
    const blob = await res.blob()
    console.log('[restFetch] Response blob size:', blob.size)
    return blob
}

// Normalize backend response to frontend shape
function mapServerComment(c: any) {
    return {
        id: (c?.commentId != null ? String(c.commentId) : c?.id) || 'c_' + Date.now(),
        text: c?.content ?? c?.text ?? '',
        author: c?.email ?? c?.user?.email ?? 'Anonymous',
        ts: c?.createdDate ? new Date(c.createdDate).getTime() : (c?.ts ?? Date.now()),
        projectId: c?.file?.project?.projectId ? String(c.file.project.projectId) : c?.projectId || '',
        fileId: c?.file?.fileId ? String(c.file.fileId) : c?.fileId || ''
    }
}

function mapServerProject(p: any) {
    return {
        id: String(p.projectId || p.id),
        name: p.title || p.name || '',
        description: p.description || '',
        files: (p.files || []).map(mapServerFile),
        collaborators: (p.collaborators || []).map((u: any) => ({
            id: String(u.userId || u.id),
            email: u.email || 'unknown@email.com',
            name: u.name || (u.email ? u.email.split('@')[0] : 'User')
        })),
        ownerId: p.creator?.userId ? String(p.creator.userId) : p.ownerId,
        createdAt: p.createdDate ? new Date(p.createdDate).getTime() : Date.now(),
        updatedAt: p.lastModified ? new Date(p.lastModified).getTime() : undefined
    }
}

function mapServerFile(f: any) {
    return {
        id: String(f.fileId || f.id),
        name: f.fileName || f.name || '',
        type: f.fileType || f.type || 'text/plain',
        dataUrl: f.dataUrl || f.filePath || '',
        projectId: f.project?.projectId ? String(f.project.projectId) : f.projectId,
        uploadedAt: f.uploadDate ? new Date(f.uploadDate).getTime() : Date.now()
    }
}

function mapServerVersion(v: any) {
    return {
        id: String(v.versionId || v.id),
        projectId: v.file?.project?.projectId ? String(v.file.project.projectId) : v.projectId || '',
        fileId: v.file?.fileId ? String(v.file.fileId) : v.fileId || '',
        content: v.content || '',
        message: v.versionMessage || v.message || '',
        author: v.user?.email || v.author || 'Anonymous',
        ts: v.timestamp ? new Date(v.timestamp).getTime() : Date.now(),
        versionNumber: v.versionNumber || ''
    }
}

function mapServerUser(u: any) {
    return {
        id: String(u.userId || u.id),
        userId: String(u.userId || u.id),
        email: u.email || '',
        name: u.name || '',
        role: u.role || 'USER'
    }
}

const api = {
    // Auth
    async register(email: string, password: string, name?: string): Promise<User> {
        const data = await restFetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        })
        return mapServerUser(data)
    },

    async login(email: string, password: string): Promise<User> {
        const data: any = await restFetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        if (data.accessToken) {
            localStorage.setItem('collab_token', data.accessToken)
        }
        return mapServerUser(data.user || data)
    },

    async resetPassword(email: string): Promise<{ ok: boolean }> {
        return restFetch('/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        })
    },

    // Projects & files
    async createProject(name: string, files: ProjectFile[]): Promise<Project> {
        const userStr = localStorage.getItem('collab_user')
        const user = userStr ? JSON.parse(userStr) : null
        const userId = user?.userId || user?.id

        // Backend expects ProjectEntity with title and creator
        const projectData = {
            title: name,
            description: '',
            creator: userId ? { userId: parseInt(userId) } : null
        }
        const data = await restFetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        })
        return mapServerProject(data)
    },

    async getProjects(): Promise<Project[]> {
        const userStr = localStorage.getItem('collab_user')
        const user = userStr ? JSON.parse(userStr) : null
        const userId = user?.userId || user?.id
        if (userId) {
            const created = await restFetch(`/api/projects/creator/${userId}`)
            const collaborated = await restFetch(`/api/projects/collaborator/${userId}`)
            return [...(created || []), ...(collaborated || [])].map(mapServerProject)
        }
        return []
    },

    async getProject(id: string): Promise<Project | undefined> {
        console.log('[API] getProject called with id:', id)
        const data = await restFetch(`/api/projects/${id}`)
        if (!data) {
            console.log('[API] Project not found')
            return undefined
        }

        // Fetch files separately since the project endpoint doesn't include them
        console.log('[API] Fetching files for project:', id)
        const files = await restFetch(`/api/files/project/${id}`)
        console.log('[API] Files fetched:', files)

        // Merge files into the project data
        const projectWithFiles = {
            ...data,
            files: files || []
        }

        const mapped = mapServerProject(projectWithFiles)
        console.log('[API] Mapped project with files:', mapped)
        return mapped
    },

    async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
        console.log('[API] updateProject called with id:', id, 'updates:', updates)
        // Map frontend fields to backend fields
        const backendUpdates: any = {}
        if (updates.name) backendUpdates.title = updates.name
        if (updates.description) backendUpdates.description = updates.description

        console.log('[API] Updating project metadata...')
        const data = await restFetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendUpdates)
        })

        // If files were updated, upload new files to backend
        if (updates.files && Array.isArray(updates.files)) {
            console.log('[API] Project has', updates.files.length, 'files in update')
            // Get current files from backend to determine which are new
            const currentProject = await this.getProject(id)
            const currentFileIds = new Set(currentProject?.files?.map(f => f.id) || [])
            const newFiles = updates.files.filter(f => !currentFileIds.has(f.id))

            if (newFiles.length > 0) {
                console.log('[API] Found', newFiles.length, 'new files to upload')
                await this.uploadFiles(id, newFiles)
            } else {
                console.log('[API] No new files to upload')
            }
        }

        return mapServerProject(data)
    },

    async deleteProject(id: string): Promise<{ ok: boolean }> {
        await restFetch(`/api/projects/${id}`, { method: 'DELETE' })
        return { ok: true }
    },

    async uploadFiles(projectId: string, fileMetas: ProjectFile[]): Promise<Project | undefined> {
        console.log('[API] uploadFiles called with projectId:', projectId, 'files:', fileMetas.length)
        // Backend uses FileEntity, need to create files individually
        for (let i = 0; i < fileMetas.length; i++) {
            const f = fileMetas[i]
            console.log(`[API] Uploading file ${i + 1}/${fileMetas.length}:`, f.name, 'size:', f.dataUrl?.length)
            const fileData = {
                fileName: f.name,
                fileType: f.type,
                filePath: f.dataUrl || '',
                project: { projectId: parseInt(projectId) }
            }
            console.log('[API] Sending file data:', { ...fileData, filePath: `<data url length: ${fileData.filePath.length}>` })
            try {
                const response = await restFetch('/api/files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fileData)
                })
                console.log('[API] File upload response:', response)
            } catch (err) {
                console.error('[API] Error uploading file:', f.name, err)
                throw err
            }
        }
        console.log('[API] All files uploaded, fetching updated project...')
        return this.getProject(projectId)
    },

    async deleteFile(projectId: string, fileId: string): Promise<Project | undefined> {
        console.log('[API] deleteFile called with projectId:', projectId, 'fileId:', fileId)
        await restFetch(`/api/files/${fileId}`, { method: 'DELETE' })
        console.log('[API] File deleted from backend, fetching updated project...')
        const updatedProject = await this.getProject(projectId)
        console.log('[API] Updated project after deletion:', updatedProject)
        return updatedProject
    },

    // Files
    async getFiles(): Promise<ProjectFile[]> {
        // Scope files to projects the current user owns or collaborates on
        const userStr = localStorage.getItem('collab_user')
        const user = userStr ? JSON.parse(userStr) : null
        const userId = user?.userId || user?.id
        if (userId) {
            const createdProjects = await restFetch(`/api/projects/creator/${userId}`)
            const collaboratedProjects = await restFetch(`/api/projects/collaborator/${userId}`)
            const allProjects = [...(createdProjects || []), ...(collaboratedProjects || [])]
            const projectIds = allProjects.map((p: any) => String(p.projectId || p.id))
            // Fetch files per project and flatten
            const filesArrays = await Promise.all(projectIds.map(pid => restFetch(`/api/files/project/${pid}`)))
            return filesArrays.flat().map(mapServerFile)
        }
        return []
    },

    async getFilesByProject(projectId: string): Promise<ProjectFile[]> {
        const data = await restFetch(`/api/files/project/${projectId}`)
        return (data || []).map(mapServerFile)
    },

    // Versions
    async saveVersion(projectId: string, fileId: string, content: string, message: string): Promise<Version> {
        const userStr = localStorage.getItem('collab_user')
        const user = userStr ? JSON.parse(userStr) : null
        const userId = user?.userId || user?.id

        // Generate version number based on timestamp
        const versionNumber = `v${Date.now()}`

        const versionData = {
            content,
            versionMessage: message,
            versionNumber,
            file: { fileId: parseInt(fileId) },
            user: userId ? { userId: parseInt(userId) } : null
        }
        const data = await restFetch('/api/versions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(versionData)
        })
        return mapServerVersion(data)
    },

    async listVersions(): Promise<Version[]> {
        const data = await restFetch('/api/versions')
        return (data || []).map(mapServerVersion)
    },

    async restoreVersion(projectId: string, fileId: string, versionId: string): Promise<{ ok: boolean }> {
        // Fetch the version and update the file with its content
        const version = await restFetch(`/api/versions/${versionId}`)
        if (version) {
            const mappedVersion = mapServerVersion(version)
            // Update the file with the version content
            await restFetch(`/api/files/${fileId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: mappedVersion.content })
            })
        }
        return { ok: true }
    },

    // Comments
    async getComments(): Promise<Comment[]> {
        const data = await restFetch('/api/comments')
        return (data || []).map(mapServerComment)
    },

    async postComment(text: string, projectId: string = '', fileId: string = ''): Promise<Comment> {
        const userStr = localStorage.getItem('collab_user')
        const user = userStr ? JSON.parse(userStr) : null
        const userId = user?.userId || user?.id
        const email = user?.email || 'unknown@email.com'

        const commentData = {
            content: text,
            file: fileId ? { fileId: parseInt(fileId) } : null,
            user: userId ? { userId: parseInt(userId) } : null,
            email
        }
        const data = await restFetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commentData)
        })
        return mapServerComment(data)
    },

    async deleteComment(id: string): Promise<{ ok: boolean }> {
        await restFetch(`/api/comments/${id}`, { method: 'DELETE' })
        return { ok: true }
    },

    // Profile
    async getProfile(): Promise<Profile> {
        const userStr = localStorage.getItem('collab_user')
        const user = userStr ? JSON.parse(userStr) : null
        const userId = user?.userId || user?.id
        if (userId) {
            const data = await restFetch(`/api/users/${userId}`)
            return {
                name: data.name,
                bio: '',
                interests: '',
                website: ''
            }
        }
        return { name: '', bio: '', interests: '', website: '' }
    },

    async saveProfile(profile: Profile): Promise<Profile> {
        const userStr = localStorage.getItem('collab_user')
        const user = userStr ? JSON.parse(userStr) : null
        const userId = user?.userId || user?.id
        if (userId) {
            await restFetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: profile.name })
            })
        }
        return profile
    },

    // Collaborators
    async addCollaborator(projectId: string, userId: string): Promise<Project | undefined> {
        const data = await restFetch(`/api/projects/${projectId}/collaborators/${userId}`, {
            method: 'POST'
        })
        return mapServerProject(data)
    },

    async findUserByEmail(email: string): Promise<User | undefined> {
        try {
            const data = await restFetch(`/api/users/email/${encodeURIComponent(email)}`)
            return mapServerUser(data)
        } catch {
            return undefined
        }
    },

    async removeCollaborator(projectId: string, userId: string): Promise<Project | undefined> {
        const data = await restFetch(`/api/projects/${projectId}/collaborators/${userId}`, {
            method: 'DELETE'
        })
        return mapServerProject(data)
    },

    async getProjectsByUser(userId: string): Promise<Project[]> {
        const created = await restFetch(`/api/projects/creator/${userId}`)
        const collaborated = await restFetch(`/api/projects/collaborator/${userId}`)
        return [...(created || []), ...(collaborated || [])].map(mapServerProject)
    }
}

export default api
