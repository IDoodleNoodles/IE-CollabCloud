import React from 'react'
import api from './api'

type User = { id: string; email: string }

const AuthContext = React.createContext<any>(null)

function useProvideAuth() {
    const [user, setUser] = React.useState<User | null>(() => {
        const raw = localStorage.getItem('collab_user')
        return raw ? JSON.parse(raw) : null
    })

    function save(u: User | null) {
        setUser(u)
        if (u) localStorage.setItem('collab_user', JSON.stringify(u))
        else localStorage.removeItem('collab_user')
    }

    return {
        user,
        register: async (email: string, password: string) => {
            const r = await api.register(email, password)
            if (r) save(r)
            return r
        },
        login: async (email: string, password: string) => {
            const r = await api.login(email, password)
            if (r) {
                // if API returned token, api.login already stored it
                save(r.id ? r : r.user || r)
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
