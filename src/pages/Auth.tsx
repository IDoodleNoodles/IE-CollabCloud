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
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

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
        <div style={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#E5E7EB',
            padding: '2rem'
        }}>
            <div style={{ 
                maxWidth: '460px',
                width: '100%',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
                padding: '3rem 2.5rem',
                textAlign: 'center'
            }}>
                <h2 style={{ 
                    marginBottom: '0.5rem',
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#1F2937'
                }}>
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p style={{ 
                    marginBottom: '2rem',
                    color: '#6B7280',
                    fontSize: '0.95rem'
                }}>
                    {mode === 'login' ? 'Sign in to continue to CollabCloud' : 'Join CollabCloud and start collaborating'}
                </p>

                <form onSubmit={submit} style={{ textAlign: 'left' }}>
                    {mode === 'register' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="register-name" style={{ 
                                display: 'block',
                                marginBottom: '0.625rem',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                color: '#4B5563'
                            }}>
                                Full Name
                            </label>
                            <input
                                id="register-name"
                                type="text"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    background: 'white',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="login-email" style={{ 
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#5F6368',
                            textAlign: 'left'
                        }}>
                            Email Address
                        </label>
                        <input
                            id="login-email" 
                            type="email"
                            placeholder="you@example.com" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                border: '1px solid #DADCE0',
                                borderRadius: '10px',
                                fontSize: '0.95rem',
                                background: '#FAFBFC',
                                transition: 'all 0.2s',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <label htmlFor="login-password" style={{ 
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#5F6368',
                            textAlign: 'left'
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    paddingRight: '3rem',
                                    border: '1px solid #DADCE0',
                                    borderRadius: '10px',
                                    fontSize: '0.95rem',
                                    background: '#FAFBFC',
                                    transition: 'all 0.2s',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {showPassword ? (
                                        <>
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </>
                                    ) : (
                                        <>
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </>
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {mode === 'register' && (
                        <div style={{ marginBottom: '1.75rem' }}>
                            <label htmlFor="confirm-password" style={{ 
                                display: 'block',
                                marginBottom: '0.625rem',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                color: '#4B5563'
                            }}>
                                Confirm Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem',
                                        paddingRight: '3rem',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        background: 'white',
                                        transition: 'all 0.2s',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {showConfirmPassword ? (
                                            <>
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </>
                                        ) : (
                                            <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {err && (
                        <div style={{ 
                            padding: '0.75rem 1rem', 
                            background: '#FEF2F2', 
                            border: '1px solid #FCA5A5',
                            borderRadius: '8px',
                            color: '#DC2626',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>⚠️</span>
                            <span>{err}</span>
                        </div>
                    )}
                    
                    <div style={{ textAlign: 'center' }}>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                width: '100%',
                                padding: '0.875rem 1rem',
                                marginBottom: '1rem',
                                background: loading ? '#93C5FD' : '#4285F4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseOver={(e) => {
                                if (!loading) e.currentTarget.style.background = '#2563EB'
                            }}
                            onMouseOut={(e) => {
                                if (!loading) e.currentTarget.style.background = '#3B82F6'
                            }}
                        >
                            {loading && 'Please wait...'}
                            {!loading && mode === 'login' && 'Sign In'}
                            {!loading && mode === 'register' && 'Create Account'}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => { 
                                setMode(mode === 'login' ? 'register' : 'login')
                                setErr(null)
                                setEmail('')
                                setPassword('')
                                setFullName('')
                                setConfirmPassword('')
                            }}
                            style={{ 
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'white',
                                color: '#4285F4',
                                border: '2px solid #4285F4',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#EFF6FF'
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'white'
                            }}
                        >
                            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
                        </button>

                        {mode === 'login' && (
                            <div>
                                <span 
                                    style={{ 
                                        fontSize: '0.9rem',
                                        color: '#4285F4',
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        fontWeight: '500'
                                    }}
                                    onClick={() => setShowReset(true)}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.textDecoration = 'underline'
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.textDecoration = 'none'
                                    }}
                                >
                                    Forgot Password?
                                </span>
                            </div>
                        )}
                    </div>
                </form>
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
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{ 
                        maxWidth: '400px',
                        width: '100%',
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <h3 style={{ 
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#1F2937'
                        }}>
                            Reset Password
                        </h3>
                        <p style={{ 
                            marginBottom: '1.5rem',
                            color: '#6B7280',
                            fontSize: '0.95rem'
                        }}>
                            Enter your email address and we'll send you a reset link
                        </p>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="reset-email" style={{ 
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Email Address
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                placeholder="you@example.com"
                                value={resetEmail}
                                onChange={e => setResetEmail(e.target.value)}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    background: '#F9FAFB'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                                onClick={handlePasswordReset}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    background: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Send Reset Link
                            </button>
                            <button 
                                onClick={() => { setShowReset(false); setResetEmail('') }}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    background: '#6B7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Auth() {
    return <AuthInner />
}
