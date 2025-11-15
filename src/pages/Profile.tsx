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
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2>Your Profile</h2>
                <p className="text-muted">Manage your personal information and preferences</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        color: 'white'
                    }}>
                        {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '0.25rem' }}>{profile.name || 'Anonymous User'}</h3>
                        <p className="text-muted">{user?.email || 'No email'}</p>
                    </div>
                </div>

                {error && (
                    <div style={{
                        padding: '0.875rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        borderRadius: '10px',
                        color: '#dc2626',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="profile-name">Full Name</label>
                    <input
                        id="profile-name" 
                        placeholder="Enter your full name" 
                        value={profile.name || ''} 
                        onChange={e => setProfile({ ...profile, name: e.target.value })} 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="profile-email">Email Address</label>
                    <input
                        id="profile-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="profile-bio">Bio</label>
                    <textarea
                        id="profile-bio" 
                        placeholder="Tell us about yourself..." 
                        value={profile.bio || ''} 
                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="profile-interests">Interests</label>
                    <input
                        id="profile-interests" 
                        placeholder="e.g., Web Development, Design, Photography" 
                        value={profile.interests || ''} 
                        onChange={e => setProfile({ ...profile, interests: e.target.value })} 
                    />
                    <small className="text-muted">Separate multiple interests with commas</small>
                </div>

                <div className="form-group">
                    <label htmlFor="profile-website">Website</label>
                    <input
                        id="profile-website" 
                        type="url"
                        placeholder="https://yourwebsite.com" 
                        value={profile.website || ''} 
                        onChange={e => setProfile({ ...profile, website: e.target.value })} 
                    />
                </div>

                <div className="btn-group">
                    <button className="success" onClick={save}>
                        {saved ? 'Saved!' : 'Save Profile'}
                    </button>
                </div>
            </div>

            {/* Password Change Section */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Change Password</h4>
                
                {!showPasswordChange ? (
                    <button className="secondary" onClick={() => setShowPasswordChange(true)}>
                        Change Password
                    </button>
                ) : (
                    <>
                        <div className="form-group">
                            <label htmlFor="current-password">Current Password</label>
                            <input
                                id="current-password"
                                type="password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new-password">New Password</label>
                            <input
                                id="new-password"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                minLength={6}
                            />
                            <small className="text-muted">At least 6 characters</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm New Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                minLength={6}
                            />
                        </div>

                        <div className="btn-group">
                            <button className="success" onClick={changePassword}>
                                Update Password
                            </button>
                            <button className="secondary" onClick={() => {
                                setShowPasswordChange(false)
                                setCurrentPassword('')
                                setNewPassword('')
                                setConfirmPassword('')
                                setError(null)
                            }}>
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="card" style={{ background: 'var(--gray-50)' }}>
                <h4>Your Stats</h4>
                <div className="divider"></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div>
                        <div className="text-muted text-sm">Projects</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {JSON.parse(localStorage.getItem('collab_projects') || '[]').length}
                        </div>
                    </div>
                    <div>
                        <div className="text-muted text-sm">Versions</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                            {JSON.parse(localStorage.getItem('collab_versions') || '[]').length}
                        </div>
                    </div>
                    <div>
                        <div className="text-muted text-sm">Comments</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
                            {JSON.parse(localStorage.getItem('collab_comments') || '[]').length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
