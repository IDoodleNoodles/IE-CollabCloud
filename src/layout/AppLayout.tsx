import { Outlet } from 'react-router-dom'
import { useAuth } from '../services/auth'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function AppLayout() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="app">
      <Navbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />

        <div className="content-wrapper" style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
