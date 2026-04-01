import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function PromoDetail() {
  const { id } = useParams()
  const { user, getToken } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [promo, setPromo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [codeRevealed, setCodeRevealed] = useState(false)
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    fetch(`/api/promos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPromo(data)
        setLoading(false)
      })
  }, [id])

  async function handleClaim() {
    setCodeRevealed(true)
    if (user && !claimed) {
      const token = getToken()
      await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promo_id: promo.id }),
      })
      setClaimed(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!promo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-theme-muted">Promo introuvable</p>
        <Link to="/" className="text-neon-purple hover:underline">Retour</Link>
      </div>
    )
  }

  const hasCoords = Number.isFinite(promo.latitude) && Number.isFinite(promo.longitude)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="text-neon-cyan hover:underline text-sm mb-6 inline-block">
        ← Retour aux bons plans
      </Link>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        {promo.image_url && (
          <div className="h-64 overflow-hidden">
            <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm font-medium text-neon-cyan bg-neon-cyan/10 px-3 py-1 rounded-full">
              {promo.category_icon ? `${promo.category_icon} ` : ''}{promo.category || 'Sans categorie'}
            </span>
            {promo.is_exclusive && (
              <span className="text-sm font-bold bg-gradient-to-r from-neon-purple to-neon-cyan text-white px-3 py-1 rounded-full">
                Exclusif
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold text-theme">{promo.title}</h1>
            <button
              onClick={() => toggleFavorite(promo.id)}
              aria-label={isFavorite(promo.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-dark-surface border border-dark-border hover:border-neon-purple/50 transition-colors cursor-pointer"
            >
              <span className="text-xl leading-none">
                {isFavorite(promo.id) ? '❤️' : '🤍'}
              </span>
            </button>
          </div>
          <p className="text-theme-muted mb-6">{promo.merchants?.name || 'Marchand'}</p>

          <p className="text-slate-700 dark:text-gray-300 leading-relaxed mb-8">{promo.description}</p>

          {promo.promo_code && (
            <div className="mb-8">
              {codeRevealed ? (
                <div className="bg-dark-surface border-2 border-neon-purple rounded-xl p-6 text-center">
                  <p className="text-sm text-theme-muted mb-2">Ton code promo</p>
                  <p className="text-3xl font-mono font-bold text-neon-cyan tracking-widest">
                    {promo.promo_code}
                  </p>
                  {claimed && (
                    <p className="text-xs text-green-400 mt-2">Offre enregistrée !</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Révéler le code promo
                </button>
              )}
            </div>
          )}

          {promo.end_date && (
            <p className="text-sm text-theme-subtle mb-6">
              Valable jusqu'au {new Date(promo.end_date).toLocaleDateString('fr-FR')}
            </p>
          )}

          {hasCoords && (
            <div className="rounded-xl overflow-hidden border border-dark-border">
              <MapContainer
                center={[promo.latitude, promo.longitude]}
                zoom={15}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[promo.latitude, promo.longitude]}>
                  <Popup>{promo.merchants?.name || promo.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
