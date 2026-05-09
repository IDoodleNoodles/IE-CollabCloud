import { useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import type { Project } from '../types'

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchProjects = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await api.getProjects()
            setProjects(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch projects')
        } finally {
            setLoading(false)
        }
    }, [])

    const createProject = useCallback(async (name: string, files: any[], description: string = '') => {
        try {
            const newProject = await api.createProject(name, files, description)
            setProjects(prev => [newProject, ...prev])
            return newProject
        } catch (err) {
            throw err
        }
    }, [])

    const deleteProject = useCallback(async (id: string) => {
        try {
            await api.deleteProject(id)
            setProjects(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            throw err
        }
    }, [])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    return {
        projects,
        loading,
        error,
        fetchProjects,
        createProject,
        deleteProject
    }
}
