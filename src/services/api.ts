// API adapter: if VITE_API_BASE is set the adapter calls REST endpoints, otherwise it falls back to localStorage.
const API_BASE: string = (import.meta as any).env?.VITE_API_BASE || ''

async function restFetch(path:string, opts:RequestInit={}){
    const headers = opts.headers ? opts.headers as any : {}
    if(localStorage.getItem('collab_token')) headers['Authorization'] = 'Bearer ' + localStorage.getItem('collab_token')
    const res = await fetch((API_BASE || '') + path, { ...opts, headers })
    if(!res.ok) {
        const text = await res.text()
        throw new Error(text || res.statusText)
    }
    const ct = res.headers.get('content-type') || ''
    if(ct.includes('application/json')) return res.json()
    return res.blob()
}

const api = {
    // Auth
    async register(email:string, password:string){
        if(API_BASE){
            return restFetch('/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) })
        }
        const users = JSON.parse(localStorage.getItem('collab_users')||'[]')
        if(users.find((u:any)=>u.email===email)) throw new Error('email exists')
        const id = 'u_'+Date.now()
        users.push({ id, email, password })
        localStorage.setItem('collab_users', JSON.stringify(users))
        return { id, email }
    },
    async login(email:string, password:string){
        if(API_BASE){
            const data:any = await restFetch('/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) })
            if(data.accessToken) localStorage.setItem('collab_token', data.accessToken)
            return data.user || data
        }
        const users = JSON.parse(localStorage.getItem('collab_users')||'[]')
        const found = users.find((u:any)=>u.email===email && u.password===password)
        if(!found) throw new Error('invalid credentials')
        return { id: found.id, email: found.email }
    },
    async resetPassword(email:string){
        if(API_BASE){
            return restFetch('/auth/reset-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email}) })
        }
        const users = JSON.parse(localStorage.getItem('collab_users')||'[]')
        if(!users.find((u:any)=>u.email===email)) throw new Error('not found')
        return { ok:true }
    },

    // Projects & files
    async createProject(name:string, files:any[]){
        if(API_BASE){
            const fd = new FormData()
            fd.append('name', name)
            files.forEach((f:any)=> fd.append('files', f.blob || f, f.name))
            return restFetch('/projects', { method:'POST', body: fd })
        }
        const projects = JSON.parse(localStorage.getItem('collab_projects')||'[]')
        const proj = { id: 'p_'+Date.now(), name, files }
        projects.unshift(proj)
        localStorage.setItem('collab_projects', JSON.stringify(projects))
        return proj
    },
    async getProjects(){
        if(API_BASE) return restFetch('/projects')
        return JSON.parse(localStorage.getItem('collab_projects')||'[]')
    },
    async getProject(id:string){
        if(API_BASE) return restFetch(`/projects/${id}`)
        const all = JSON.parse(localStorage.getItem('collab_projects')||'[]')
        return all.find((p:any)=>p.id===id)
    },
    async deleteProject(id:string){
        if(API_BASE) return restFetch(`/projects/${id}`, { method:'DELETE' })
        const all = JSON.parse(localStorage.getItem('collab_projects')||'[]')
        const next = all.filter((p:any)=>p.id!==id)
        localStorage.setItem('collab_projects', JSON.stringify(next))
        return { ok:true }
    },
    async uploadFiles(projectId:string, fileMetas:any[]){
        if(API_BASE){
            const fd = new FormData()
            fileMetas.forEach((f:any)=> fd.append('files', f.blob || f, f.name))
            return restFetch(`/projects/${projectId}/files`, { method:'POST', body:fd })
        }
        const all = JSON.parse(localStorage.getItem('collab_projects')||'[]')
        const p = all.find((x:any)=>x.id===projectId)
        p.files = p.files.concat(fileMetas)
        localStorage.setItem('collab_projects', JSON.stringify(all))
        return p
    },
    async deleteFile(projectId:string, fileId:string){
        if(API_BASE) return restFetch(`/projects/${projectId}/files/${fileId}`, { method:'DELETE' })
        const all = JSON.parse(localStorage.getItem('collab_projects')||'[]')
        const p = all.find((x:any)=>x.id===projectId)
        p.files = p.files.filter((f:any)=>f.id!==fileId)
        localStorage.setItem('collab_projects', JSON.stringify(all))
        return p
    },

    // Versions
    async saveVersion(projectId:string, fileId:string, content:string, message:string){
        if(API_BASE) return restFetch(`/projects/${projectId}/files/${fileId}/versions`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({content,message}) })
        const versions = JSON.parse(localStorage.getItem('collab_versions')||'[]')
        const v = { id: 'v_'+Date.now(), projectId, fileId, content, message, author: localStorage.getItem('collab_user') ? JSON.parse(localStorage.getItem('collab_user')!).email : 'anonymous', ts: Date.now() }
        versions.unshift(v)
        localStorage.setItem('collab_versions', JSON.stringify(versions))
        // also update file dataUrl
        const all = JSON.parse(localStorage.getItem('collab_projects')||'[]')
        const p = all.find((x:any)=>x.id===projectId)
        const f = p?.files.find((x:any)=>x.id===fileId)
        if(f){ f.dataUrl = 'data:text/plain;base64,' + btoa(unescape(encodeURIComponent(content))) ; localStorage.setItem('collab_projects', JSON.stringify(all)) }
        return v
    },
    async listVersions(){
        if(API_BASE) return restFetch('/versions')
        return JSON.parse(localStorage.getItem('collab_versions')||'[]')
    },
    async restoreVersion(projectId:string, fileId:string, versionId:string){
        if(API_BASE) return restFetch(`/projects/${projectId}/files/${fileId}/versions/${versionId}/restore`, { method:'POST' })
        const versions = JSON.parse(localStorage.getItem('collab_versions')||'[]')
        const v = versions.find((x:any)=>x.id===versionId)
        if(!v) throw new Error('version not found')
        const all = JSON.parse(localStorage.getItem('collab_projects')||'[]')
        const p = all.find((x:any)=>x.id===projectId)
        const f = p.files.find((x:any)=>x.id===fileId)
        f.dataUrl = 'data:text/plain;base64,' + btoa(unescape(encodeURIComponent(v.content)))
        localStorage.setItem('collab_projects', JSON.stringify(all))
        return { ok:true }
    },

    // Comments
    async getComments(){
        if(API_BASE) return restFetch('/comments')
        return JSON.parse(localStorage.getItem('collab_comments')||'[]')
    },
    async postComment(text:string){
        if(API_BASE) return restFetch('/projects/comments', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({text}) })
        const comments = JSON.parse(localStorage.getItem('collab_comments')||'[]')
        const author = localStorage.getItem('collab_user') ? JSON.parse(localStorage.getItem('collab_user')!).email : 'anon'
        const c = { id: 'c_'+Date.now(), text, author, ts: Date.now() }
        const next = [c, ...comments]
        localStorage.setItem('collab_comments', JSON.stringify(next))
        return c
    },
    async deleteComment(id:string){
        if(API_BASE) return restFetch(`/comments/${id}`, { method:'DELETE' })
        const comments = JSON.parse(localStorage.getItem('collab_comments')||'[]')
        const next = comments.filter((c:any)=>c.id!==id)
        localStorage.setItem('collab_comments', JSON.stringify(next))
        return { ok:true }
    },

    // Profile
    async getProfile(){
        if(API_BASE) return restFetch('/users/me')
        return JSON.parse(localStorage.getItem('collab_profile')||'{}')
    },
    async saveProfile(profile:any){
        if(API_BASE) return restFetch('/users/me', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(profile) })
        localStorage.setItem('collab_profile', JSON.stringify(profile))
        return profile
    },

    // Forums
    async getTopics(){
        if(API_BASE) return restFetch('/forums/topics')
        return JSON.parse(localStorage.getItem('collab_forums')||'[]')
    },
    async createTopic(title:string, body:string){
        if(API_BASE) return restFetch('/forums/topics', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title,body}) })
        const topics = JSON.parse(localStorage.getItem('collab_forums')||'[]')
        const t = { id: 't_'+Date.now(), title, body, ts: Date.now(), replies: [] }
        const next = [t, ...topics]
        localStorage.setItem('collab_forums', JSON.stringify(next))
        return t
    }
}

export default api
