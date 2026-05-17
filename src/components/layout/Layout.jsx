import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/',            label: 'Dashboard',   icon: '📊' },
  { to: '/loans',       label: 'Loans',       icon: '📋' },
  { to: '/collections', label: 'Collections', icon: '💰' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#1a2744', color: '#fff',
        display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid #2d3d5c' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#4f9cf9' }}>💼 LoanApp</div>
          <div style={{ fontSize: 11, color: '#8899bb', marginTop: 4 }}>Collection System</div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px',
                color: isActive ? '#4f9cf9' : '#aab8cc',
                background: isActive ? '#243059' : 'transparent',
                textDecoration: 'none', fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '3px solid #4f9cf9' : '3px solid transparent',
              })}
            >
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>

        {/* User info and logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #2d3d5c' }}>
          <div style={{ fontSize: 13, color: '#ccd3e0', marginBottom: 4 }}>{user?.name}</div>
          <div style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: 10,
            background: user?.role === 'admin' ? '#2563eb22' : '#16a34a22',
            color: user?.role === 'admin' ? '#60a5fa' : '#4ade80',
            fontSize: 11, marginBottom: 12, textTransform: 'capitalize',
          }}>
            {user?.role?.replace('_', ' ')}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'block', width: '100%', padding: '7px 0',
              background: '#2d3d5c', color: '#aab8cc',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13,
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: '#f4f6fb', overflow: 'auto' }}>
        {children}
      </main>

    </div>
  )
}