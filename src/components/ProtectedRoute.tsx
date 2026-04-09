import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  requiredRole?: UserRole
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { session, loading, isAdmin, isModerator } = useAuth()

  if (loading) return <div>Loading...</div>
  
  if (!session) return <Navigate to="/" replace />

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />
  }

  if (requiredRole === 'moderator' && !isModerator) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
