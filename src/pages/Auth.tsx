import React from 'react'
import { useAuth } from '../services/auth'
import { useNavigate } from 'react-router-dom'

function AuthInner() {
    const auth = useAuth()
    const navigate = useNavigate()
    const [mode, setMode] = React.useState<'login' | 'register'>('login')
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [fullName, setFullName] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [err, setErr] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [showReset, setShowReset] = React.useState(false)
    const [resetEmail, setResetEmail] = React.useState('')

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setErr(null)
        
        if (mode === 'register') {
            if (!fullName.trim()) {
                setErr('Please enter your full name')
                return
            }
            if (password !== confirmPassword) {
                setErr('Passwords do not match')
                return
            }
            if (password.length < 6) {
                setErr('Password must be at least 6 characters')
                return
            }
        }
        
        setLoading(true)
        try {
            if (mode === 'login') {
                await auth.login(email, password)
                alert('Login successful! Welcome to CollabCloud.')
                navigate('/')
            } else {
                await auth.register(email, password, fullName)
                // Initialize profile with the full name
                const profile = { name: fullName }
                localStorage.setItem('collab_profile', JSON.stringify(profile))
                alert('Registration successful! Please log in with your credentials.')
                setMode('login')
                setEmail('')
                setPassword('')
                setFullName('')
                setConfirmPassword('')
            }
        } catch (ex: any) { 
            setErr(ex.message || 'An error occurred') 
        } finally {
            setLoading(false)
        }
    }

    async function handlePasswordReset() {
        if (!resetEmail) {
            alert('Please enter your email')
            return
        }
        try {
            await auth.resetPassword(resetEmail)
            alert('Password reset link sent! (Demo mode: Check console)')
            setShowReset(false)
            setResetEmail('')
        } catch (e: any) {
            alert(e.message)
        }
    }

    return (
        <div style={{ maxWidth: '450px', margin: '3rem auto' }}>
            <div className="card" style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    {mode === 'login' ? 'Sign in to continue to CollabCloud' : 'Join CollabCloud and start collaborating'}
                </p>

                <form onSubmit={submit} style={{ textAlign: 'left' }}>
                    {mode === 'register' && (
                        <div className="form-group">
                            <label htmlFor="register-name">Full Name</label>
                            <input
                                id="register-name"
                                type="text"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="login-email">Email Address</label>
                        <input
                            id="login-email" 
                            type="email"
                            placeholder="you@example.com" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    
                    {mode === 'register' && (
                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    )}
                    
                    {err && (
                        <div style={{ 
                            padding: '0.75rem', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid var(--danger)',
                            borderRadius: '8px',
                            color: 'var(--danger)',
                            marginBottom: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            ⚠️ {err}
                        </div>
                    )}
                    
                    
                    {err && (
                        <div style={{ 
                            padding: '0.75rem', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid var(--danger)',
                            borderRadius: '8px',
                            color: 'var(--danger)',
                            marginBottom: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            {err}
                        </div>
                    )}
                    
                    <button type="submit" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
                        {loading && 'Please wait...'}
                        {!loading && mode === 'login' && 'Sign In'}
                        {!loading && mode === 'register' && 'Create Account'}
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <button 
                            type="button" 
                            className="outline" 
                            style={{ width: '100%' }}
                            onClick={() => { 
                                setMode(mode === 'login' ? 'register' : 'login')
                                setErr(null)
                                setEmail('')
                                setPassword('')
                                setFullName('')
                                setConfirmPassword('')
                            }}
                        >
                            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </form>

                {mode === 'login' && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <button 
                            className="secondary" 
                            style={{ fontSize: '0.875rem' }}
                            onClick={() => setShowReset(true)}
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}
            </div>

            {showReset && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
                        <h3>Reset Password</h3>
                        <p className="text-muted" style={{ marginBottom: '1rem' }}>
                            Enter your email address and we'll send you a reset link
                        </p>
                        <div className="form-group">
                            <label htmlFor="reset-email">Email Address</label>
                            <input
                                id="reset-email"
                                type="email"
                                placeholder="you@example.com"
                                value={resetEmail}
                                onChange={e => setResetEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="btn-group">
                            <button className="success" onClick={handlePasswordReset}>
                                Send Reset Link
                            </button>
                            <button className="secondary" onClick={() => { setShowReset(false); setResetEmail('') }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mode === 'login' && (
                <div className="card" style={{ marginTop: '1.5rem', background: 'var(--gray-50)', textAlign: 'center' }}>
                    <p className="text-muted text-sm">
                        💡 <strong>Demo Mode:</strong> Your data is stored locally in your browser
                    </p>
                </div>
            )}
        </div>
    )
}

export default function Auth() {
    return <AuthInner />
}
