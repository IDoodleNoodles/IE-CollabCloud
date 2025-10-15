import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Editor from './pages/Editor'
import Versions from './pages/Versions'
import Comments from './pages/Comments'
import Profile from './pages/Profile'
import Forums from './pages/Forums'
import { useAuth } from './services/auth'

export default function App() {
    const { user, logout } = useAuth()

    return (
        <div className="app">
            <div className="nav">
                <Link to="/">Home</Link>
                <Link to="/projects">Projects</Link>
                <Link to="/forums">Forums</Link>
                <Link to="/versions">Versions</Link>
                <Link to="/comments">Comments</Link>
                <div style={{ marginLeft: 'auto' }}>
                    {user ? (
                        <>
                            <Link to="/profile">{user.email}</Link>
                            <button style={{ marginLeft: 8 }} onClick={logout}>Log out</button>
                        </>
                    ) : (
                        <Link to="/auth">Sign in</Link>
                    )}
                </div>
            </div>

            <div className="card">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/editor/:projectId/:fileId" element={<Editor />} />
                    <Route path="/versions" element={<Versions />} />
                    <Route path="/comments" element={<Comments />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
                    <Route path="/forums" element={<Forums />} />
                </Routes>
            </div>
        </div>
    )
}
