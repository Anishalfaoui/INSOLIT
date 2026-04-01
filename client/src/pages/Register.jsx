import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  function getAge(dob) {
    const today = new Date()
    const birth = new Date(dob)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const age = getAge(birthDate)
    if (age >= 26) {
      setError('Désolé, cette application est réservée aux moins de 26 ans.')
      return
    }
    if (age < 13) {
      setError("Tu dois avoir au moins 13 ans pour t'inscrire.")
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, fullName, birthDate, phone, city)
      navigate('/')
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
          <h1 className="text-3xl font-bold text-insolit-pink">Inscription</h1>
          <p className="mt-2 text-sm text-theme-muted">Rejoins la communauté INSOLIT</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-theme-muted">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="input-theme"
              placeholder="Jean Dupont"
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
              placeholder="ton@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-theme-muted">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input-theme"
              placeholder="06 12 34 56 78"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-theme-muted">Ville</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="input-theme"
              placeholder="Paris"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-theme-muted">Date de naissance</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="input-theme"
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
            {loading ? 'Inscription…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-theme-muted">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-insolit-pink hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
