import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ActivityLogger, ActivityTypes } from '../services/activityLogger'
import api from '../services/api'
import { isTextFile } from '../utils/helpers'

export default function Search() {
    const [searchParams] = useSearchParams()
    const [query, setQuery] = React.useState(searchParams.get('q') || '')
    const [results, setResults] = React.useState<any[]>([])
    const [searching, setSearching] = React.useState(false)

    React.useEffect(() => {
        const urlQuery = searchParams.get('q')
        if (urlQuery) {
            setQuery(urlQuery)
            performSearch(urlQuery)
        }
    }, [searchParams])

    React.useEffect(() => {
        if (query.trim()) {
            const debounce = setTimeout(() => {
                performSearch(query)
            }, 300)
            return () => clearTimeout(debounce)
        } else {
            setResults([])
        }
    }, [query])

    function performSearch(searchQuery: string) {
        if (!searchQuery.trim()) {
            setResults([])
            return
        }

        setSearching(true)
        ActivityLogger.log(ActivityTypes.SEARCH_FILES, `Searched for: ${searchQuery}`)

        setTimeout(() => {
            ;(async () => {
                try {
                    const allResults: any[] = []
                    const lowerQuery = searchQuery.toLowerCase()

                    // Fetch projects and search files
                    const projects = await api.getProjects()
                    for (const project of (projects || [])) {
                        const files = project.files && project.files.length ? project.files : await api.getFilesByProject(String(project.id))
                        for (const file of (files || [])) {
                            if ((file.name || '').toLowerCase().includes(lowerQuery)) {
                                allResults.push({
                                    type: 'file',
                                    id: file.id,
                                    name: file.name,
                                    projectId: project.id,
                                    projectName: project.name,
                                    fileType: file.type || 'unknown'
                                })
                            }
                        }
                    }

                    // Search projects by name
                    (projects || [])
                        .filter((p: any) => (p.name || '').toLowerCase().includes(lowerQuery))
                        .forEach((p: any) => {
                            allResults.push({
                                type: 'project',
                                id: p.id,
                                name: p.name,
                                filesCount: p.files ? p.files.length : 0
                            })
                        })

                    // Search users via backend
                    const users = await api.getUsers()
                    ;(users || [])
                        .filter((u: any) => (u.email || '').toLowerCase().includes(lowerQuery))
                        .forEach((u: any) => {
                            allResults.push({
                                type: 'user',
                                id: u.id,
                                email: u.email
                            })
                        })

                    // Only keep files
                    const fileResults = allResults.filter(r => r.type === 'file')
                    setResults(fileResults)
                } catch (err) {
                    console.warn('[Search] performSearch failed', err)
                    setResults([])
                } finally {
                    setSearching(false)
                }
            })()
        }, 200)
    }

    function highlightMatch(text: string, query: string) {
        if (!query.trim()) return text
        const parts = text.split(new RegExp(`(${query})`, 'gi'))
        return parts.map((part, i) => 
            part.toLowerCase() === query.toLowerCase() 
                ? <mark key={`mark-${i}`} style={{ background: '#ffeb3b', padding: '2px 0' }}>{part}</mark>
                : part
        )
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {searching && (
                <div style={{ 
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#2196f3',
                    fontSize: '1.1rem'
                }}>
                    Searching...
                </div>
            )}

            {!searching && results.length > 0 && (
                <div style={{ 
                    marginBottom: '2rem',
                    padding: '1rem 1.5rem',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #e5e7eb'
                }}>
                    <h3 style={{ 
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '0.5rem'
                    }}>
                        Search Results for "{query}"
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                        Found {results.length} {results.length === 1 ? 'file' : 'files'}
                    </p>
                </div>
            )}

            {!searching && query.trim() === '' ? (
                <div className="empty-state">
                    <h3>Search for files</h3>
                    <p className="text-muted">Type in the search bar above to find files across all projects</p>
                </div>
            ) : results.length === 0 ? (
                <div className="empty-state">
                    <h3>No files found</h3>
                    <p className="text-muted">Try different keywords</p>
                </div>
            ) : (
                <div className="list">
                    {results.map((result: any) => (
                        <div key={`${result.id}`} className="card" style={{ 
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = ''
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ marginBottom: '0.5rem' }}>
                                        {highlightMatch(result.name, query)}
                                    </h4>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span className="text-muted text-sm">in {result.projectName}</span>
                                        <span className="badge primary text-xs">{result.fileType}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {isTextFile(result.name) && (
                                        <Link to={`/editor/${result.projectId}/${result.id}`}>
                                            <button className="success">Edit</button>
                                        </Link>
                                    )}
                                    <Link to={`/projects/${result.projectId}`}>
                                        <button className="secondary">View Project</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
