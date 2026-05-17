import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(email, password)
    if (res.ok) navigate('/')
    else setError(res.message)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f4f6fb' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 10, width: 360, boxShadow: '0 2px 10px rgba(0,0,0,.1)' }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center' }}>💼 LoanApp Login</h2>

        {error && <div style={{ color: 'red', marginBottom: 12, fontSize: 13 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}