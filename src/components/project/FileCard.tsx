import React from 'react'
import type { ProjectFile } from '../../types'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'

interface FileCardProps {
    file: ProjectFile
    commentCount: number
    onPreview: (file: ProjectFile) => void
    onDelete?: (fileId: string) => void
}

export const FileCard = React.memo<FileCardProps>(({ 
    file, 
    commentCount, 
    onPreview,
    onDelete 
}) => {
    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase()
        const iconMap: Record<string, string> = {
            pdf: '📄',
            doc: '📝',
            docx: '📝',
            txt: '📃',
            jpg: '🖼️',
            jpeg: '🖼️',
            png: '🖼️',
            gif: '🖼️',
            mp4: '🎥',
            mp3: '🎵',
            zip: '📦',
            js: '💻',
            ts: '💻',
            tsx: '💻',
            jsx: '💻',
            html: '🌐',
            css: '🎨',
            json: '📋'
        }
        return iconMap[ext || ''] || '📄'
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onDelete && window.confirm(`Are you sure you want to delete ${file.name}?`)) {
            onDelete(file.id)
        }
    }

    return (
        <Card
            hoverable
            onClick={() => onPreview(file)}
        >
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem'
            }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{getFileIcon(file.name)}</span>
                        <h4 style={{ 
                            margin: 0,
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {file.name}
                        </h4>
                    </div>
                    {(file as any).description && (
                        <p style={{ 
                            margin: 0,
                            color: '#64748b',
                            fontSize: '0.875rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {(file as any).description}
                        </p>
                    )}
                </div>
                {onDelete && (
                    <button
                        onClick={handleDelete}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            fontSize: '1.25rem',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        aria-label={`Delete ${file.name}`}
                    >
                        🗑️
                    </button>
                )}
            </div>

            <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e5e7eb',
                fontSize: '0.875rem',
                color: '#64748b',
                gap: '1rem'
            }}>
                    <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                        <span>{formatDate(new Date(file.uploadedAt))}</span>
                    </div>
                {commentCount > 0 && (
                    <Badge variant="info" size="sm">
                        💬 {commentCount}
                    </Badge>
                )}
            </div>
        </Card>
    )
})

FileCard.displayName = 'FileCard'
