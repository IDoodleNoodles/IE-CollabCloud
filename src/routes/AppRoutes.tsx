import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'

import Dashboard from '../pages/dashboard/Dashboard'
import Projects from '../pages/projects/Projects'
import ProjectDetail from '../pages/projects/Projects'
import Collaborators from '../pages/Collaborators'
import Editor from '../pages/Editor'
import Search from '../pages/Search'
import Profile from '../pages/profile/Profile'
import ActivityLogs from '../pages/ActivityLogs'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
      <Route path="/projects/:projectId/collaborators" element={<ProtectedRoute><Collaborators /></ProtectedRoute>} />
      <Route path="/editor/:projectId/:fileId" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
