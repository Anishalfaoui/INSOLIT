import { Navigate } from 'react-router-dom'
import { usePartner } from '../context/usePartner'

export default function ProtectedPartnerRoute({ children }) {
  const { partner, loading } = usePartner()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!partner) {
    return <Navigate to="/partner/login" replace />
  }

  return children
}
