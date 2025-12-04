import React from 'react'
import api from './api'
import { ActivityLogger, ActivityTypes } from './activityLogger'
import session from './session'

type User = { id: string; email: string; name?: string; role?: string }

const AuthContext = React.createContext<any>(null)

function useProvideAuth() {
    const [user, setUser] = React.useState<User | null>(() => {
        const userData = session.getUser()
        if (!userData) return null
        if (userData && !userData.userId && userData.id) {
            console.warn('[Auth] Migrating user data: copying id to userId')
            userData.userId = userData.id
            session.setUser(userData)
        }
        return userData
    })

    function save(u: User | null) {
        setUser(u)
        if (u) session.setUser(u)
        else session.removeUser()
    }

    return {
        user,
        setUser: save,
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
                // api.login returns the mapped user object
                const userData = r
                save(userData)
                ActivityLogger.log(ActivityTypes.LOGIN, `User logged in: ${email}`)
            }
            return r
        },
        logout: () => {
            session.removeToken()
            session.removeUser()
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
