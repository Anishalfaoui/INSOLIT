import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePartner } from '../../context/usePartner'

export default function PartnerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { partnerSignIn } = usePartner()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await partnerSignIn(email, password)
      navigate('/partner/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
          Connexion partenaire
        </h1>
        <p className="text-gray-400 text-center mb-8">Gere tes offres depuis ton espace pro</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
              placeholder="contact@enseigne.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Pas encore inscrit ?{' '}
          <Link to="/partner/register" className="text-neon-cyan hover:underline">
            Creer un compte partenaire
          </Link>
        </p>

        <p className="text-center text-gray-400 text-sm mt-2">
          Tu es utilisateur ?{' '}
          <Link to="/login" className="text-neon-purple hover:underline">
            Connexion user
          </Link>
        </p>
      </div>
    </div>
  )
}
