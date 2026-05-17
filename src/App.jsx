import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Loans from './pages/Loans'
import LoanForm from './pages/LoanForm'
import Collections from './pages/Collections'
import CollectionForm from './pages/CollectionForm'

// protect routes that need login
function PrivateRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

// redirect to dashboard if already logged in
function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/"                element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/loans"           element={<PrivateRoute><Loans /></PrivateRoute>} />
          <Route path="/loans/new"       element={<PrivateRoute><LoanForm /></PrivateRoute>} />
          <Route path="/collections"     element={<PrivateRoute><Collections /></PrivateRoute>} />
          <Route path="/collections/new" element={<PrivateRoute><CollectionForm /></PrivateRoute>} />
          <Route path="*"                element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}