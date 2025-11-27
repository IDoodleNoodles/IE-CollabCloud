import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './services/auth'
import AppLayout from './layout/AppLayout'
import Auth from './pages/Auth'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user && location.pathname !== '/auth') {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />

      <Route element={<AppLayout />}>
        <Route path="/*" element={<AppRoutes />} />
      </Route>
    </Routes>
  )
}
