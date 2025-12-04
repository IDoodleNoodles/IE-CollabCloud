// Type definitions for CollabCloud

// ==================== User & Authentication ====================

export interface User {
    id: string
    userId?: string
    email: string
    name?: string
    password?: string
}

export interface AuthResponse {
    user: User
    accessToken?: string
}

export interface Profile {
    name?: string
    bio?: string
    interests?: string
    website?: string
}

// ==================== Projects & Files ====================

export interface Project {
    id: string
    name: string
    description?: string
    files: ProjectFile[]
    collaborators?: Collaborator[]
    visibility?: string
    ownerId?: string
    createdAt: number
    updatedAt?: number
}

export interface ProjectFile {
    id: string
    name: string
    type: string
    dataUrl: string
    size?: number
    projectId?: string
    uploadedAt: number
}

export interface CreateProjectDTO {
    name: string
    files: File[] | ProjectFile[]
}

// ==================== Versions ====================

export interface Version {
    id: string
    projectId: string
    fileId: string
    content: string
    message: string
    author: string
    ts: number
    versionNumber?: string
    createdAt?: number
    createdBy?: string
    changes?: string
}

export interface CreateVersionDTO {
    projectId: string
    fileId: string
    content: string
    message: string
}

// ==================== Comments ====================

export interface Comment {
    id: string
    projectId: string
    fileId: string
    text: string
    author: string
    ts: number
}

export interface CreateCommentDTO {
    projectId: string
    fileId: string
    text: string
}

// ==================== Collaborators ====================

export interface Collaborator {
    id: string
    email: string
    name?: string
    permission: 'view' | 'edit' | 'admin'
    addedAt: number
}

export interface AddCollaboratorDTO {
    projectId: string
    email: string
    permission: 'view' | 'edit' | 'admin'
}

// ==================== Activity Logs ====================

export interface ActivityLog {
    id: string
    type: ActivityType
    description: string
    timestamp: number
    userId?: string
}

export type ActivityType =
    | 'LOGIN'
    | 'LOGOUT'
    | 'VIEW_DASHBOARD'
    | 'VIEW_PROJECTS'
    | 'CREATE_PROJECT'
    | 'DELETE_PROJECT'
    | 'UPLOAD_FILE'
    | 'EDIT_FILE'
    | 'DELETE_FILE'
    | 'SAVE_VERSION'
    | 'ADD_COMMENT'
    | 'DELETE_COMMENT'
    | 'SEARCH'
    | 'ADD_COLLABORATOR'
    | 'REMOVE_COLLABORATOR'

// ==================== Search ====================

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

// ==================== Dashboard Stats ====================

export interface DashboardStats {
    projects: number
    totalFiles: number
    collaborators: number
    versions?: number
}

// ==================== API Response Types ====================

export interface ApiResponse<T = any> {
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
}
