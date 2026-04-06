import { Navigate } from 'react-router-dom'
import { usePartner } from '../context/usePartner'

export default function ProtectedPartnerRoute({ children }) {
  const { partner, loading } = usePartner()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-insolit-pink border-t-transparent" />
      </div>
    )
  }

  if (!partner) return <Navigate to="/partner/login" replace />
  return children
}
