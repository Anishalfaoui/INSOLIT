import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { usePartner } from '../../context/usePartner'

export default function PartnerRegister() {
  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { partnerSignUp } = usePartner()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await partnerSignUp(email, password, businessName, address)
      navigate('/partner/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-dark-border bg-dark-card p-8 shadow-lg shadow-pink-500/5">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-insolit-pink/10 text-insolit-pink">
            <UserPlus className="h-6 w-6" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="text-3xl font-bold text-insolit-pink">Inscription partenaire</h1>
          <p className="mt-2 text-sm text-theme-muted">Cree ton espace pour publier tes offres</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-theme-muted">Nom de l enseigne</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="input-theme"
              placeholder="Nom de ton etablissement"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-theme-muted">Adresse</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="input-theme"
              placeholder="Adresse de l etablissement"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-theme-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-theme"
              placeholder="contact@enseigne.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-theme-muted">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input-theme"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-full bg-insolit-pink py-3 text-sm font-semibold text-white transition-opacity hover:bg-insolit-pink-hover disabled:opacity-50"
          >
            {loading ? 'Inscription…' : 'Creer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-theme-muted">
          Deja un compte ?{' '}
          <Link to="/partner/login" className="font-medium text-insolit-pink hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
