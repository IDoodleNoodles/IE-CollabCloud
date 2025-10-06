import React from 'react'

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
            // naive registration: store user credential in localStorage
            const users = JSON.parse(localStorage.getItem('collab_users') || '[]')
            if (users.find((u: any) => u.email === email)) throw new Error('email exists')
            const id = 'u_' + Date.now()
            users.push({ id, email, password })
            localStorage.setItem('collab_users', JSON.stringify(users))
            save({ id, email })
        },
        login: async (email: string, password: string) => {
            const users = JSON.parse(localStorage.getItem('collab_users') || '[]')
            const found = users.find((u: any) => u.email === email && u.password === password)
            if (!found) throw new Error('invalid credentials')
            save({ id: found.id, email: found.email })
        },
        logout: () => save(null),
        resetPassword: async (email: string) => {
            // stub: in real app send link
            const users = JSON.parse(localStorage.getItem('collab_users') || '[]')
            if (!users.find((u: any) => u.email === email)) throw new Error('not found')
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
        // fallback: create simple provider on the fly
        const auth = useProvideAuth()
        return auth
    }
    return ctx
}
