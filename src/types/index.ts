// Type definitions for CollabCloud

export interface User {
    id: string
    email: string
    password?: string
}

export interface Project {
    id: string
    name: string
    files: ProjectFile[]
    createdAt?: number
}

export interface ProjectFile {
    id: string
    name: string
    type: string
    dataUrl: string
    size?: number
}

export interface Version {
    id: string
    projectId: string
    fileId: string
    content: string
    message: string
    author: string
    ts: number
}

export interface Comment {
    id: string
    text: string
    author: string
    ts: number
}

export interface Profile {
    name?: string
    bio?: string
    interests?: string
    website?: string
}

export interface ActivityLog {
    id: string
    action: string
    description: string
    timestamp: number
    userId?: string
}

export interface SearchResult {
    type: 'file' | 'project' | 'user'
    id: string
    name?: string
    email?: string
    projectId?: string
    projectName?: string
    fileType?: string
    filesCount?: number
}
