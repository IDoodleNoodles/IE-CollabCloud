// Activity Logger Service - logs all user actions

export class ActivityLogger {
    private static getStoredLogs(): any[] {
        const stored = localStorage.getItem('collab_activity_logs')
        return stored ? JSON.parse(stored) : []
    }

    private static saveLogs(logs: any[]): void {
        // Keep only last 100 logs to prevent storage overflow
        const recentLogs = logs.slice(0, 100)
        localStorage.setItem('collab_activity_logs', JSON.stringify(recentLogs))
    }

    static log(actionType: string, actionDetails?: string): void {
        const user = localStorage.getItem('collab_user')
        const userID = user ? JSON.parse(user).id : 'anonymous'
        
        const activityID = 'log_' + Date.now()
        const activity = {
            activityID,
            userID,
            actionType,
            actionDetails,
            timestamp: Date.now()
        }

        const logs = this.getStoredLogs()
        logs.unshift(activity)
        this.saveLogs(logs)
    }

    static getLogs(): any[] {
        return this.getStoredLogs()
    }

    static clearLogs(): void {
        localStorage.setItem('collab_activity_logs', '[]')
    }
}

// Activity type constants based on use case diagram
export const ActivityTypes = {
    REGISTER: 'REGISTER_ACCOUNT',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    CREATE_PROJECT: 'CREATE_PROJECT',
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
