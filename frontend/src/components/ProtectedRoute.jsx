import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './ui/LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated === undefined) {
    return <LoadingSpinner label="Checking session…" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
