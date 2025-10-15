import React from 'react'

export default function Profile() {
    const [profile, setProfile] = React.useState<any>(() => JSON.parse(localStorage.getItem('collab_profile') || '{}'))

    function save() { localStorage.setItem('collab_profile', JSON.stringify(profile)); alert('Saved') }

    return (
        <div>
            <h2>Your profile</h2>
            <div style={{ display: 'grid', gap: 8 }}>
                <input placeholder="Name" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                <input placeholder="Bio" value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
                <input placeholder="Interests (comma)" value={profile.interests || ''} onChange={e => setProfile({ ...profile, interests: e.target.value })} />
                <button onClick={save}>Save profile</button>
            </div>
        </div>
    )
}
