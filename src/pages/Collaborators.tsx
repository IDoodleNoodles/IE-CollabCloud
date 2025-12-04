import React from 'react'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'
import api from '../services/api'

type CollaboratorsModalProps = {
    projectId: string
    projectName: string
    isOpen: boolean
    onClose: () => void
}

export default function Collaborators({ projectId, projectName, isOpen, onClose }: CollaboratorsModalProps) {
    const [collaborators, setCollaborators] = React.useState<any[]>([])
    const [showAddForm, setShowAddForm] = React.useState(false)
    const [newCollabEmail, setNewCollabEmail] = React.useState('')

    React.useEffect(() => {
        if (isOpen) {
            loadCollaborators()
        }
    }, [projectId, isOpen])

    async function loadCollaborators() {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE
        const useApi = API_BASE !== undefined
        if (useApi) {
            try {
                const project = await api.getProject(String(projectId))
                const collabs = (project?.collaborators || []).map((u: any) => ({
                    id: String(u.id || u.userId),
                    email: u.email,
                    name: u.name || u.email.split('@')[0],
                    permission: 'edit',
                    addedAt: Date.now()
                }))
                setCollaborators(collabs)
                return
            } catch (e) {
                // fall back to local
            }
        }
        const collabs = JSON.parse(localStorage.getItem(`collab_project_${projectId}_collaborators`) || '[]')
        setCollaborators(collabs)
    }

    function getInitials(email: string): string {
        const name = email.split('@')[0]
        return name.charAt(0).toUpperCase()
    }

    function getAvatarColor(email: string): string {
        const colors = ['#7C3AED', '#8B5CF6', '#6366F1']
        const index = email.charCodeAt(0) % colors.length
        return colors[index]
    }

    async function addCollaborator() {
        if (!newCollabEmail.trim()) {
            alert('Please enter an email address')
            return
        }
        const API_BASE = (import.meta as any).env?.VITE_API_BASE
        const useApi = API_BASE !== undefined
        let userExists: any = null
        if (useApi) {
            try {
                const u = await api.findUserByEmail(newCollabEmail)
                if (u) {
                    userExists = { userId: u.id || u.userId, email: u.email, name: u.name }
                }
            } catch { }
        } else {
            const users = JSON.parse(localStorage.getItem('collab_users') || '[]')
            userExists = users.find((u: any) => u.email === newCollabEmail)
        }
        if (!userExists) {
            alert('User with this email does not exist')
            return
        }

        const alreadyAdded = collaborators.find(c => c.email === newCollabEmail)
        if (alreadyAdded) {
            alert('This user is already a collaborator')
            return
        }

        const newCollab = {
            id: 'collab_' + Date.now(),
            email: newCollabEmail,
            name: userExists.name || newCollabEmail.split('@')[0],
            permission: 'edit',
            addedAt: Date.now()
        }

        const useApi2 = (import.meta as any).env?.VITE_API_BASE !== undefined
        if (useApi2) {
            try {
                const updatedProject = await api.addCollaborator(String(projectId), String(userExists.userId || userExists.id))
                const collabs = (updatedProject?.collaborators || []).map((u: any) => ({
                    id: String(u.id || u.userId),
                    email: u.email,
                    name: u.name || u.email.split('@')[0],
                    permission: 'edit',
                    addedAt: Date.now()
                }))
                setCollaborators(collabs)
            } catch (e: any) {
                alert('Error adding collaborator: ' + (e?.message || 'unknown'))
                return
            }
        } else {
            const updated = [...collaborators, newCollab]
            setCollaborators(updated)
            localStorage.setItem(`collab_project_${projectId}_collaborators`, JSON.stringify(updated))
        }
        ActivityLogger.log(ActivityTypes.MANAGE_COLLABORATORS, `Added collaborator ${newCollabEmail} to project ${projectName}`)
        setNewCollabEmail('')
        setShowAddForm(false)
    }

    async function removeCollaborator(collabId: string, collabEmail: string) {
        if (!confirm(`Remove ${collabEmail} from this project?`)) return
        const useApi = (import.meta as any).env?.VITE_API_BASE !== undefined
        if (useApi) {
            try {
                await api.removeCollaborator(String(projectId), String(collabId))
                await loadCollaborators()
            } catch (e: any) {
                alert('Error removing collaborator: ' + (e?.message || 'unknown'))
                return
            }
        } else {
            const updated = collaborators.filter(c => c.id !== collabId)
            setCollaborators(updated)
            localStorage.setItem(`collab_project_${projectId}_collaborators`, JSON.stringify(updated))
        }
        ActivityLogger.log(ActivityTypes.MANAGE_COLLABORATORS, `Removed collaborator ${collabEmail} from project ${projectName}`)
    }

    function updatePermission(collabId: string, newPermission: string) {
        const updated = collaborators.map(c =>
            c.id === collabId ? { ...c, permission: newPermission } : c
        )
        setCollaborators(updated)
        localStorage.setItem(`collab_project_${projectId}_collaborators`, JSON.stringify(updated))
        ActivityLogger.log(ActivityTypes.MANAGE_COLLABORATORS, `Updated permissions for collaborator in project ${projectName}`)
    }

    function handleSaveChanges() {
        ActivityLogger.log(ActivityTypes.MANAGE_COLLABORATORS, `Saved collaborator changes for project ${projectName}`)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '700px',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#202124',
                        margin: 0
                    }}>
                        Manage Collaborators
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            color: '#9AA0A6',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '2rem'
                }}>
                    {/* Current Collaborators Section */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#202124',
                            margin: '0 0 1rem 0'
                        }}>
                            Current Collaborators
                        </h3>

                        {/* Collaborators List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {collaborators.map((collab) => (
                                <div
                                    key={collab.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem 0'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {/* Avatar */}
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: getAvatarColor(collab.email),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '16px',
                                            fontWeight: '600'
                                        }}>
                                            {getInitials(collab.email)}
                                        </div>
                                        {/* Name and Email */}
                                        <div>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#202124',
                                                marginBottom: '0.125rem'
                                            }}>
                                                {collab.name || collab.email.split('@')[0]}
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#5F6368'
                                            }}>
                                                {collab.email}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Permission and Delete */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <select
                                            value={collab.permission}
                                            onChange={(e) => updatePermission(collab.id, e.target.value)}
                                            style={{
                                                padding: '0.5rem 2rem 0.5rem 0.75rem',
                                                fontSize: '14px',
                                                border: '1px solid #DADCE0',
                                                borderRadius: '6px',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                background: 'white',
                                                color: '#202124',
                                                fontFamily: 'inherit'
                                            }}
                                        >
                                            <option value="view">View</option>
                                            <option value="edit">Edit</option>
                                            <option value="comment">Comment</option>
                                        </select>
                                        <button
                                            onClick={() => removeCollaborator(collab.id, collab.email)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0.25rem',
                                                color: '#EA4335',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add Collaborator Button */}
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            border: '2px dashed #DADCE0',
                            borderRadius: '8px',
                            background: 'transparent',
                            color: '#5F6368',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginBottom: '1.5rem'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Collaborator
                    </button>

                    {/* Add Collaborator Form */}
                    {showAddForm && (
                        <div style={{
                            padding: '1rem',
                            background: '#F9FAFB',
                            borderRadius: '8px',
                            marginBottom: '1.5rem'
                        }}>
                            <input
                                type="email"
                                placeholder="Enter email address"
                                value={newCollabEmail}
                                onChange={(e) => setNewCollabEmail(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addCollaborator()
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    fontSize: '14px',
                                    border: '1px solid #DADCE0',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    marginBottom: '0.75rem',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={addCollaborator}
                                    style={{
                                        flex: 1,
                                        padding: '0.625rem',
                                        background: '#4285F4',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false)
                                        setNewCollabEmail('')
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.625rem',
                                        background: 'white',
                                        color: '#5F6368',
                                        border: '1px solid #DADCE0',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Share via Email Section */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        background: '#E8F0FE',
                        borderRadius: '8px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: '#4285F4',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#202124',
                                marginBottom: '0.25rem'
                            }}>
                                Share via Email
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: '#5F6368'
                            }}>
                                Collaborators will receive an email invitation to join this project.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderTop: '1px solid #E5E7EB',
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'white',
                            color: '#5F6368',
                            border: '1px solid #DADCE0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#4285F4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
