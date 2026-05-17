import { createContext, useContext, useState } from 'react'
import { authAPI } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // get user from localStorage if already logged in
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      const { user: u, token } = res.data.data

      // save token and user to localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)

      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try { await authAPI.logout() } catch (_) {}
    // clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// custom hook to use auth context
export const useAuth = () => useContext(AuthContext)