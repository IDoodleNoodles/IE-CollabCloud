import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../../types'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'

interface ProjectCardProps {
    project: Project
}

export const ProjectCard = React.memo<ProjectCardProps>(({ project }) => {
    const navigate = useNavigate()

    const totalFiles = project.files?.length || 0
    const collaboratorsCount = project.collaborators?.length || 0

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <Card
            hoverable
            onClick={() => navigate(`/projects/${project.id}`)}
        >
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                }}>
                    <h3 style={{ 
                        margin: 0,
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1e293b'
                    }}>
                        {project.name}
                    </h3>
                    <Badge variant="primary">{project.visibility}</Badge>
                </div>
                <p style={{ 
                    margin: '0.5rem 0 0 0',
                    color: '#64748b',
                    fontSize: '0.95rem',
                    lineHeight: '1.5'
                }}>
                    {project.description || 'No description provided'}
                </p>
            </div>

            <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
                fontSize: '0.875rem',
                color: '#64748b'
            }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <span>📄 {totalFiles} file{totalFiles !== 1 ? 's' : ''}</span>
                    <span>👥 {collaboratorsCount} collaborator{collaboratorsCount !== 1 ? 's' : ''}</span>
                </div>
                <span>{formatDate(project.createdAt)}</span>
            </div>
        </Card>
    )
})

ProjectCard.displayName = 'ProjectCard'
