// Activity Logger Service - logs all user actions

import api from './api'
import session from './session'

export class ActivityLogger {
    static async log(actionType: string, actionDetails?: string, projectId?: string | number): Promise<void> {
        try {
            await api.logActivity(actionType, actionDetails, projectId)
        } catch (err) {
            // Fallback: silently ignore logging errors
            console.warn('[ActivityLogger] Failed to send activity to server:', err)
        }
    }

    static async getLogs(): Promise<any[]> {
        // Try fetching from backend endpoint
        try {
            const res = await fetch('/api/activity-logs')
            if (res.ok) return await res.json()
            return []
        } catch (err) {
            console.warn('[ActivityLogger] Failed to fetch logs:', err)
            return []
        }
    }

    static clearLogs(): void {
        // Clearing server-side logs not implemented in frontend
        console.warn('[ActivityLogger] clearLogs called: not implemented')
    }
}

// Activity type constants based on use case diagram
export const ActivityTypes = {
    REGISTER: 'REGISTER_ACCOUNT',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    CREATE_PROJECT: 'CREATE_PROJECT',
    DELETE_PROJECT: 'DELETE_PROJECT',
    UPLOAD_FILE: 'UPLOAD_FILE',
    UPLOAD_PROJECT: 'UPLOAD_PROJECT',
    VIEW_PROJECTS: 'VIEW_PROJECTS',
    DELETE_FILE: 'DELETE_FILE',
    EDIT_FILE: 'EDIT_FILE_ONLINE',
    SAVE_VERSION: 'SAVE_VERSION',
    VIEW_ACTIVITY_LOGS: 'VIEW_ACTIVITY_LOGS',
    ADD_COMMENT: 'ADD_COMMENT',
    DELETE_COMMENT: 'DELETE_COMMENT',
    UPDATE_PROFILE: 'UPDATE_PROFILE',
    MANAGE_PROFILE: 'MANAGE_PROFILE',
    CREATE_TOPIC: 'CREATE_TOPIC',
    SHARE_PROJECT: 'SHARE_PROJECT',
    MANAGE_COLLABORATORS: 'MANAGE_COLLABORATORS',
    SEARCH_FILES: 'SEARCH_FILES',
    VIEW_DASHBOARD: 'VIEW_DASHBOARD',
    CONNECT_WITH_USERS: 'CONNECT_WITH_USERS'
}
