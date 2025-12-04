import React, { useState } from 'react'
import type { Version } from '../../types'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'

interface VersionHistoryProps {
    versions: Version[]
    fileId: string
    onRestore: (version: Version) => void
}

export const VersionHistory = React.memo<VersionHistoryProps>(({ 
    versions, 
    fileId,
    onRestore 
}) => {
    const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())

    const toggleVersion = (versionId: string) => {
        setExpandedVersions(prev => {
            const newSet = new Set(prev)
            if (newSet.has(versionId)) {
                newSet.delete(versionId)
            } else {
                newSet.add(versionId)
            }
            return newSet
        })
    }

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const fileVersions = versions.filter(v => v.fileId === fileId)

    if (fileVersions.length === 0) {
        return (
            <div style={{ 
                padding: '2rem',
                textAlign: 'center',
                color: '#94a3b8',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '2px dashed #e2e8f0'
            }}>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    No version history available
                </p>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fileVersions.map((version, index) => {
                const isExpanded = expandedVersions.has(version.id)
                const isLatest = index === fileVersions.length - 1

                return (
                    <div
                        key={version.id}
                        style={{
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div
                            onClick={() => toggleVersion(version.id)}
                            style={{
                                padding: '1rem 1.25rem',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: isExpanded ? '#f8fafc' : 'white'
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    toggleVersion(version.id)
                                }
                            }}
                            aria-expanded={isExpanded}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#1e293b' }}>
                                                    Version {version.versionNumber || version.id}
                                    </h4>
                                    {isLatest && <Badge variant="success" size="sm">Current</Badge>}
                                </div>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                                                {formatDate(version.createdAt ? new Date(version.createdAt) : new Date(version.ts))} by {version.createdBy || version.author}
                                            </p>
                            </div>
                            <span style={{ 
                                fontSize: '1.25rem',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }}>
                                ▼
                            </span>
                        </div>

                        {isExpanded && (
                            <div style={{
                                padding: '1.25rem',
                                borderTop: '1px solid #e5e7eb',
                                background: '#fafbfc'
                            }}>
                                {version.changes && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ 
                                            margin: '0 0 0.5rem 0',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: '#475569'
                                        }}>
                                            Changes:
                                        </p>
                                        <p style={{ 
                                            margin: 0,
                                            fontSize: '0.875rem',
                                            color: '#64748b',
                                            lineHeight: '1.6',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {version.changes}
                                        </p>
                                    </div>
                                )}

                                {!isLatest && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onRestore(version)
                                        }}
                                    >
                                        Restore this version
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
})

VersionHistory.displayName = 'VersionHistory'
