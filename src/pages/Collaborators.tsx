import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'

export default function Collaborators() {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = React.useState<any>(null)
    const [collaborators, setCollaborators] = React.useState<any[]>([])
    const [email, setEmail] = React.useState('')
    const [permission, setPermission] = React.useState<'view' | 'edit' | 'admin'>('view')

    React.useEffect(() => {
        const projects = JSON.parse(localStorage.getItem('collab_projects') || '[]')
        const proj = projects.find((p: any) => p.id === projectId)
        if (proj) {
            setProject(proj)
            const collabs = JSON.parse(localStorage.getItem(`collab_project_${projectId}_collaborators`) || '[]')
            setCollaborators(collabs)
        }
    }, [projectId])

    function addCollaborator() {
        if (!email.trim()) {
            alert('Please enter an email address')
            return
        }

        const users = JSON.parse(localStorage.getItem('collab_users') || '[]')
        const userExists = users.find((u: any) => u.email === email)

        if (!userExists) {
            alert('User with this email does not exist')
            return
        }

        const alreadyAdded = collaborators.find(c => c.email === email)
        if (alreadyAdded) {
            alert('This user is already a collaborator')
            return
        }

        const newCollab = {
            id: 'collab_' + Date.now(),
            email,
            permission,
            addedAt: Date.now()
        }

        const updated = [...collaborators, newCollab]
        setCollaborators(updated)
        localStorage.setItem(`collab_project_${projectId}_collaborators`, JSON.stringify(updated))
        ActivityLogger.log(ActivityTypes.MANAGE_COLLABORATORS, `Added collaborator ${email} to project ${project.name}`)
        setEmail('')
        alert(`Successfully added ${email} as a collaborator`)
    }

    function removeCollaborator(collabId: string, collabEmail: string) {
        if (!confirm(`Remove ${collabEmail} from this project?`)) return

        const updated = collaborators.filter(c => c.id !== collabId)
        setCollaborators(updated)
        localStorage.setItem(`collab_project_${projectId}_collaborators`, JSON.stringify(updated))
        ActivityLogger.log(ActivityTypes.MANAGE_COLLABORATORS, `Removed collaborator ${collabEmail} from project ${project.name}`)
    }

    function updatePermission(collabId: string, newPermission: string) {
        const updated = collaborators.map(c => 
            c.id === collabId ? { ...c, permission: newPermission } : c
        )
        setCollaborators(updated)
        localStorage.setItem(`collab_project_${projectId}_collaborators`, JSON.stringify(updated))
        ActivityLogger.log(ActivityTypes.MANAGE_COLLABORATORS, `Updated permissions for collaborator in project ${project.name}`)
    }

    if (!project) {
        return (
            <div className="empty-state">
                <h3>Project not found</h3>
                <button className="secondary" onClick={() => navigate('/projects')}>Back to Projects</button>
            </div>
        )
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <button className="secondary" onClick={() => navigate(`/projects/${projectId}`)} style={{ marginBottom: '1rem' }}>
                    Back to Project
                </button>
                <h2>Manage Collaborators</h2>
                <p className="text-muted">Project: {project.name}</p>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Add Collaborator</h3>
                <div className="divider"></div>
                <div className="form-group">
                    <label htmlFor="collab-email">User Email</label>
                    <input
                        id="collab-email"
                        type="email"
                        placeholder="Enter user email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="collab-permission">Permission Level</label>
                    <select
                        id="collab-permission" value={permission} onChange={e => setPermission(e.target.value as any)}>
                        <option value="view">View Only</option>
                        <option value="edit">Can Edit</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button className="success" onClick={addCollaborator}>Add Collaborator</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <h3>Current Collaborators ({collaborators.length})</h3>
            </div>

            {collaborators.length === 0 ? (
                <div className="empty-state">
                    <h3>No collaborators yet</h3>
                    <p className="text-muted">Add team members to collaborate on this project</p>
                </div>
            ) : (
                <div className="list">
                    {collaborators.map((collab: any) => (
                        <div key={collab.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <h4>{collab.email}</h4>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <span className="badge primary">{collab.permission}</span>
                                        <span className="text-muted text-sm" style={{ marginLeft: '1rem' }}>
                                            Added: {new Date(collab.addedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <select 
                                        value={collab.permission} 
                                        onChange={e => updatePermission(collab.id, e.target.value)}
                                        className="secondary"
                                    >
                                        <option value="view">View</option>
                                        <option value="edit">Edit</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button className="danger" onClick={() => removeCollaborator(collab.id, collab.email)}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
