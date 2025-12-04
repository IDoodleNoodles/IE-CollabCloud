// Session service: centralize token/user handling without using localStorage
type User = any

let memoryToken: string | null = null
let memoryUser: User | null = null

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days = 7) {
    if (typeof document === 'undefined') return
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

function deleteCookie(name: string) {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export default {
    getToken(): string | null {
        if (memoryToken) return memoryToken
        const c = readCookie('collab_token')
        if (c) memoryToken = c
        return memoryToken
    },
    setToken(t: string | null) {
        memoryToken = t
        if (t) setCookie('collab_token', t)
        else deleteCookie('collab_token')
    },
    removeToken() {
        memoryToken = null
        deleteCookie('collab_token')
    },
    getUser(): User | null {
        if (memoryUser) return memoryUser
        const raw = readCookie('collab_user')
        if (!raw) return null
        try {
            memoryUser = JSON.parse(raw)
            return memoryUser
        } catch {
            return null
        }
    },
    setUser(u: User | null) {
        memoryUser = u
        if (u) setCookie('collab_user', JSON.stringify(u))
        else deleteCookie('collab_user')
    },
    removeUser() {
        memoryUser = null
        deleteCookie('collab_user')
    }
}
