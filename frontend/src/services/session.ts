// Session service: centralize token/user handling using sessionStorage with tamper detection
// sessionStorage clears when browser is closed, localStorage persists
type User = any

let memoryToken: string | null = null
let memoryUser: User | null = null

// Simple hash function to detect tampering
function hashData(data: string): string {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
}

// Verify data integrity
function verifyData(data: string, hash: string): boolean {
    return hashData(data) === hash
}

export default {
    getToken(): string | null {
        if (memoryToken) return memoryToken
        const stored = sessionStorage.getItem('collab_token')
        const hash = sessionStorage.getItem('collab_token_hash')
        
        // Verify token hasn't been tampered with
        if (stored && hash && !verifyData(stored, hash)) {
            console.warn('[Session] Token tampering detected! Clearing session.')
            sessionStorage.removeItem('collab_token')
            sessionStorage.removeItem('collab_token_hash')
            return null
        }
        
        if (stored) memoryToken = stored
        return memoryToken
    },
    setToken(t: string | null) {
        memoryToken = t
        if (t) {
            sessionStorage.setItem('collab_token', t)
            sessionStorage.setItem('collab_token_hash', hashData(t))
        } else {
            sessionStorage.removeItem('collab_token')
            sessionStorage.removeItem('collab_token_hash')
        }
    },
    removeToken() {
        memoryToken = null
        sessionStorage.removeItem('collab_token')
        sessionStorage.removeItem('collab_token_hash')
    },
    getUser(): User | null {
        if (memoryUser) return memoryUser
        const raw = sessionStorage.getItem('collab_user')
        const hash = sessionStorage.getItem('collab_user_hash')
        
        if (!raw) return null
        
        // Verify user data hasn't been tampered with
        if (hash && !verifyData(raw, hash)) {
            console.warn('[Session] User data tampering detected! Clearing session.')
            sessionStorage.removeItem('collab_user')
            sessionStorage.removeItem('collab_user_hash')
            return null
        }
        
        try {
            memoryUser = JSON.parse(raw)
            return memoryUser
        } catch {
            return null
        }
    },
    setUser(u: User | null) {
        memoryUser = u
        if (u) {
            const serialized = JSON.stringify(u)
            sessionStorage.setItem('collab_user', serialized)
            sessionStorage.setItem('collab_user_hash', hashData(serialized))
        } else {
            sessionStorage.removeItem('collab_user')
            sessionStorage.removeItem('collab_user_hash')
        }
    },
    removeUser() {
        memoryUser = null
        sessionStorage.removeItem('collab_user')
        sessionStorage.removeItem('collab_user_hash')
    }
}
