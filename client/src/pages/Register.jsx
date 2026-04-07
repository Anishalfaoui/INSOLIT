import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
      setError('Tu dois avoir au moins 13 ans pour t\'inscrire.')
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
          Inscription
        </h1>
        <p className="text-gray-400 text-center mb-8">Rejoins la communauté INSOLIT</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors"
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors"
              placeholder="ton@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors"
              placeholder="06 12 34 56 78"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Ville</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors"
              placeholder="Paris"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date de naissance</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-neon-purple hover:underline">
            Se connecter
          </Link>
        </p>

        <p className="text-center text-gray-400 text-sm mt-2">
          Tu es partner ?{' '}
          <Link to="/partner/register" className="text-neon-cyan hover:underline">
            Inscription partenaire
          </Link>
        </p>
      </div>
    </div>
  )
}
