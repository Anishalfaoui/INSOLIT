import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.successMessage || ''

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
          Connexion
        </h1>
        <p className="text-theme-muted text-center mb-8">Accède à tes bons plans insolites</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg p-3 mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-theme-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-theme"
              placeholder="ton@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-theme-muted mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-theme"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-theme-muted text-sm mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-neon-purple hover:underline">
            S'inscrire
          </Link>
        </p>

        <p className="text-center text-gray-400 text-sm mt-2">
          Tu es partner ?{' '}
          <Link to="/partner/login" className="text-neon-cyan hover:underline">
            Connexion partenaire
          </Link>
        </p>
      </div>
    </div>
  )
}
