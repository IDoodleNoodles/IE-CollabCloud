import React from 'react'
import { useAuth } from '../services/auth'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'

export default function Profile() {
    const { user } = useAuth()
    const [profile, setProfile] = React.useState<any>(() => JSON.parse(localStorage.getItem('collab_profile') || '{}'))
    const [email, setEmail] = React.useState(user?.email || '')
    const [currentPassword, setCurrentPassword] = React.useState('')
    const [newPassword, setNewPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [saved, setSaved] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [showPasswordChange, setShowPasswordChange] = React.useState(false)

    function save() { 
        localStorage.setItem('collab_profile', JSON.stringify(profile))
        
        // Update email in user object
        if (email !== user?.email) {
            const updatedUser = { ...user, email }
            localStorage.setItem('collab_user', JSON.stringify(updatedUser))
            
            // Update in users list
            const users = JSON.parse(localStorage.getItem('collab_users') || '[]')
            const userIndex = users.findIndex((u: any) => u.id === user?.id)
            if (userIndex !== -1) {
                users[userIndex].email = email
                localStorage.setItem('collab_users', JSON.stringify(users))
            }
        }
        
        ActivityLogger.log(ActivityTypes.UPDATE_PROFILE, `Updated profile information`)
        setSaved(true)
        setError(null)
        setTimeout(() => setSaved(false), 3000)
    }

    function changePassword() {
        setError(null)
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Please fill in all password fields')
            return
        }
        
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match')
            return
        }
        
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters')
            return
        }
        
        // Verify current password
        const users = JSON.parse(localStorage.getItem('collab_users') || '[]')
        const currentUser = users.find((u: any) => u.id === user?.id)
        
        if (!currentUser || currentUser.password !== currentPassword) {
            setError('Current password is incorrect')
            return
        }
        
        // Update password
        const userIndex = users.findIndex((u: any) => u.id === user?.id)
        if (userIndex !== -1) {
            users[userIndex].password = newPassword
            localStorage.setItem('collab_users', JSON.stringify(users))
            ActivityLogger.log(ActivityTypes.UPDATE_PROFILE, `Changed password`)
            
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setShowPasswordChange(false)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        }
    }

    return (
        <div style={{ 
            padding: '2rem',
            minHeight: '100vh',
            backgroundColor: '#F9FAFB'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ 
                    margin: 0, 
                    fontSize: '1.875rem', 
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '0.5rem'
                }}>
                    Manage Profile
                </h1>
                <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: '#6B7280'
                }}>
                    Update your personal information and settings
                </p>
            </div>

            {/* Main Content Layout */}
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: '300px 1fr',
                gap: '2rem',
                maxWidth: '1400px'
            }}>
                {/* Left Side - Avatar Section */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: 'fit-content'
                }}>
                    {/* Avatar with Camera Icon */}
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <div style={{ 
                            width: '140px', 
                            height: '140px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3.5rem',
                            fontWeight: '600',
                            color: 'white'
                        }}>
                            {profile.name ? profile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {/* Camera Icon */}
                        <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#4285F4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M12 15.2c-2.91 0-5.2-2.29-5.2-5.2s2.29-5.2 5.2-5.2 5.2 2.29 5.2 5.2-2.29 5.2-5.2 5.2zM20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                            </svg>
                        </div>
                    </div>
                    
                    {/* User Info */}
                    <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.25rem', 
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '0.5rem',
                        textAlign: 'center'
                    }}>
                        {profile.name || 'User'}
                    </h3>
                    <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        textAlign: 'center'
                    }}>
                        {user?.email || 'No email'}
                    </p>
                </div>

                {/* Right Side - Form Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Personal Information Section */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        {/* Section Header */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem',
                            marginBottom: '1.5rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid #E5E7EB'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <h2 style={{ 
                                margin: 0, 
                                fontSize: '1.125rem', 
                                fontWeight: '600',
                                color: '#111827'
                            }}>
                                Personal Information
                            </h2>
                        </div>

                        {error && (
                            <div style={{
                                padding: '0.875rem 1rem',
                                backgroundColor: '#FEE2E2',
                                border: '1px solid #EF4444',
                                borderRadius: '0.5rem',
                                color: '#DC2626',
                                marginBottom: '1.5rem',
                                fontSize: '0.875rem'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ 
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder={profile.name || user?.email?.split('@')[0] || 'Test'}
                                value={profile.name || ''}
                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#4285F4'}
                                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                            />
                        </div>

                        {/* Email Address */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ 
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <svg 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="#9CA3AF" 
                                    strokeWidth="2"
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none'
                                    }}
                                >
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                <input
                                    type="email"
                                    placeholder={user?.email || 'testadmin@gmail.com'}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        fontSize: '0.9375rem',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '0.5rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4285F4'}
                                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={save}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#4285F4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.9375rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3367D6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4285F4'}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                            </svg>
                            {saved ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>

                    {/* Change Password Section */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        {/* Section Header */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem',
                            marginBottom: '1.5rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid #E5E7EB'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <h2 style={{ 
                                margin: 0, 
                                fontSize: '1.125rem', 
                                fontWeight: '600',
                                color: '#111827'
                            }}>
                                Change Password
                            </h2>
                        </div>

                        {/* Current Password */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ 
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Current Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#4285F4'}
                                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                            />
                        </div>

                        {/* New Password */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ 
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                New Password
                            </label>
                            <input
                                type="password"
                                placeholder="At least 6 characters"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#4285F4'}
                                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                            />
                        </div>

                        {/* Confirm New Password */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ 
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#4285F4'}
                                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                            />
                        </div>

                        {/* Update Password Button */}
                        <button
                            onClick={changePassword}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#4285F4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.9375rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3367D6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4285F4'}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
