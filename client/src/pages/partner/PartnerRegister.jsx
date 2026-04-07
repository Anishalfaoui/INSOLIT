import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePartner } from '../../context/usePartner'

export default function PartnerRegister() {
  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locationMessage, setLocationMessage] = useState('')
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { partnerSignUp } = usePartner()
  const navigate = useNavigate()

  useEffect(() => {
    let ignore = false

    async function loadCategories() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (!ignore) {
          setCategories(Array.isArray(data) ? data : [])
        }
      } catch {
        if (!ignore) {
          setCategories([])
        }
      }
    }

    loadCategories()
    return () => {
      ignore = true
    }
  }, [])

  function useCurrentLocation() {
    setError('')
    setLocationMessage('')

    if (!navigator.geolocation) {
      setError('La geolocalisation est indisponible')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude))
        setLongitude(String(position.coords.longitude))
        setLocationMessage('Position recuperee')
        setLocating(false)
      },
      () => {
        setError('Impossible de recuperer la position')
        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLocationMessage('')

    const hasLatitude = latitude.trim() !== ''
    const hasLongitude = longitude.trim() !== ''

    if ((hasLatitude && !hasLongitude) || (!hasLatitude && hasLongitude)) {
      setError('Latitude et longitude doivent etre remplies ensemble')
      return
    }

    let parsedLatitude = null
    let parsedLongitude = null

    if (hasLatitude && hasLongitude) {
      parsedLatitude = Number.parseFloat(latitude)
      parsedLongitude = Number.parseFloat(longitude)

      if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
        setError('Coordonnees invalides')
        return
      }
    }

    setLoading(true)
    try {
      await partnerSignUp(email, password, businessName, address, categoryId, parsedLatitude, parsedLongitude)
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
          Inscription partenaire
        </h1>
        <p className="text-gray-400 text-center mb-8">Cree ton espace pour publier tes offres</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom de l enseigne</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
              placeholder="Nom de ton etablissement"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Adresse</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
              placeholder="Adresse de l etablissement"
            />
          </div>

          <div className="rounded-lg border border-dark-border bg-dark-surface/60 p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-300">Coordonnees du commerce</p>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                className="text-xs px-3 py-1.5 rounded-md border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 disabled:opacity-50 cursor-pointer"
              >
                {locating ? 'Localisation...' : 'Utiliser ma position'}
              </button>
            </div>

            {locationMessage && <p className="text-xs text-emerald-400">{locationMessage}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
                  placeholder="48.8566"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
                  placeholder="2.3522"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Categorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors"
            >
              <option value="">Choisir une categorie (optionnel)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon ? `${category.icon} ` : ''}
                  {category.label}
                </option>
              ))}
            </select>
          </div>

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
              minLength={6}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Inscription...' : 'Creer mon compte'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Deja un compte ?{' '}
          <Link to="/partner/login" className="text-neon-cyan hover:underline">
            Se connecter
          </Link>
        </p>

        <p className="text-center text-gray-400 text-sm mt-2">
          Tu es utilisateur ?{' '}
          <Link to="/register" className="text-neon-purple hover:underline">
            Inscription user
          </Link>
        </p>
      </div>
    </div>
  )
}
