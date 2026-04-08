import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  requiredRole?: UserRole
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  
  if (!session) return <Navigate to="/" replace />

  if (requiredRole) {
    if (requiredRole === 'admin' && profile?.role !== 'admin') {
      return <Navigate to="/" replace />
    }
    if (requiredRole === 'moderator' && profile?.role === 'explorer') {
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}
