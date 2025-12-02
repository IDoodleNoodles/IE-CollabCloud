import React from 'react'
import api from './api'
import { ActivityLogger, ActivityTypes } from './activityLogger'

type User = { id: string; email: string; name?: string; role?: string }

const AuthContext = React.createContext<any>(null)

function useProvideAuth() {
    const [user, setUser] = React.useState<User | null>(() => {
        const raw = localStorage.getItem('collab_user')
        if (!raw) return null

        const userData = JSON.parse(raw)
        // Migration: ensure both id and userId fields are present and consistent
        if (userData && !userData.userId && userData.id) {
            console.warn('[Auth] Migrating user data: copying id to userId')
            userData.userId = userData.id
            localStorage.setItem('collab_user', JSON.stringify(userData))
        }
        return userData
    })

    function save(u: User | null) {
        setUser(u)
        if (u) localStorage.setItem('collab_user', JSON.stringify(u))
        else localStorage.removeItem('collab_user')
    }

    return {
        user,
        register: async (email: string, password: string, name?: string) => {
            const r = await api.register(email, password, name)
            if (r) {
                save(r)
                ActivityLogger.log(ActivityTypes.REGISTER, `New user registered: ${email}`)
            }
            return r
        },
        login: async (email: string, password: string) => {
            const r = await api.login(email, password)
            if (r) {
                // if API returned token, api.login already stored it
                const userData = r.id ? r : r.user || r
                save(userData)
                ActivityLogger.log(ActivityTypes.LOGIN, `User logged in: ${email}`)
            }
            return r
        },
        logout: () => {
            localStorage.removeItem('collab_token')
            save(null)
        },
        resetPassword: async (email: string) => {
            await api.resetPassword(email)
            alert('Password reset link (simulated) sent to ' + email)
        }
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useProvideAuth()
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = React.useContext(AuthContext)
    if (!ctx) {
        const auth = useProvideAuth()
        return auth
    }
    return ctx
}
