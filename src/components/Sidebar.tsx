import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()

  const linkStyle = (active: boolean) => ({
    padding: '0.875rem',
    borderRadius: '10px',
    textDecoration: 'none',
    color: active ? '#1e88e5' : '#64748b',
    background: active ? '#e3f2fd' : 'transparent',
    display: 'block'
  })

  return (
    <aside style={{ width: 260, background: 'white', borderRight: '1px solid #e5e7eb', padding: '2rem 1.25rem' }}>
      <h3 style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>Quick Actions</h3>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <Link to="/" style={linkStyle(location.pathname === '/')}>Dashboard</Link>
        <Link to="/projects?action=upload" style={linkStyle(location.search.includes('upload'))}>Upload Project</Link>
        <Link to="/projects" style={linkStyle(location.pathname === '/projects' && !location.search.includes('upload'))}>View Projects</Link>
        <Link to="/activity" style={linkStyle(location.pathname === '/activity')}>Activity Logs</Link>
        <Link to="/profile" style={linkStyle(location.pathname === '/profile')}>Manage Profile</Link>
      </nav>
    </aside>
  )
}
