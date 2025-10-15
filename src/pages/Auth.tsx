import React from 'react'
import { useAuth } from '../services/auth'

function AuthInner() {
    const auth = useAuth()
    const [mode, setMode] = React.useState<'login' | 'register'>('login')
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [err, setErr] = React.useState<string | null>(null)

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setErr(null)
        try {
            if (mode === 'login') await auth.login(email, password)
            else await auth.register(email, password)
        } catch (ex: any) { setErr(ex.message) }
    }

    return (
        <div>
            <h2>{mode === 'login' ? 'Sign in' : 'Register'}</h2>
            <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                {err && <div style={{ color: 'red' }}>{err}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
                    <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Need an account?' : 'Have an account?'}</button>
                </div>
            </form>
            <div style={{ marginTop: 12 }}>
                <button onClick={() => { auth.resetPassword(prompt('Enter your email') || '').catch(e => alert(e.message)) }}>Forgot password</button>
            </div>
        </div>
    )
}

export default function Auth() {
    return <AuthInner />
}
