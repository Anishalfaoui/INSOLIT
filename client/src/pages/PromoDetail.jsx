import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { ArrowLeft, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import CategoryGlyph from '../components/CategoryGlyph'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-insolit-pink border-t-transparent" />
      </div>
    )
  }

  if (!promo) {
    return (
      <div className="page-shell flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-xl text-theme-muted">Promo introuvable</p>
        <Link to="/" className="font-medium text-insolit-pink hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  const hasCoords = Number.isFinite(promo.latitude) && Number.isFinite(promo.longitude)
  const favorited = isFavorite(promo.id)

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-insolit-pink hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          Retour aux bons plans
        </Link>

        <div className="overflow-hidden rounded-2xl border border-dark-border bg-dark-card shadow-lg shadow-pink-500/5">
          {promo.image_url && (
            <div className="h-64 overflow-hidden">
              <img src={promo.image_url} alt={promo.title} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-insolit-pink/10 px-3 py-1 text-sm font-medium text-insolit-pink">
                <CategoryGlyph categoryLabel={promo.category} className="h-4 w-4" strokeWidth={2} />
                {promo.category || 'Sans catégorie'}
              </span>
              {promo.is_exclusive && (
                <span className="rounded-full bg-insolit-pink px-3 py-1 text-sm font-bold text-white">
                  Exclusif
                </span>
              )}
            </div>

            <div className="mb-2 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-theme">{promo.title}</h1>
              <button
                type="button"
                onClick={() => toggleFavorite(promo.id)}
                aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-dark-border bg-dark-surface transition-colors hover:border-insolit-pink/50"
              >
                <Heart
                  className="h-5 w-5 text-insolit-pink"
                  strokeWidth={2}
                  fill={favorited ? 'currentColor' : 'none'}
                  aria-hidden
                />
              </button>
            </div>
            <p className="mb-6 text-theme-muted">{promo.merchants?.name || 'Marchand'}</p>

            <p className="mb-8 leading-relaxed text-slate-700 dark:text-gray-300">{promo.description}</p>

            {promo.promo_code && (
              <div className="mb-8">
                {codeRevealed ? (
                  <div className="rounded-xl border-2 border-insolit-pink/50 bg-insolit-pink/5 p-6 text-center dark:bg-insolit-pink/10">
                    <p className="mb-2 text-sm text-theme-muted">Ton code promo</p>
                    <p className="font-mono text-3xl font-bold tracking-widest text-insolit-pink">
                      {promo.promo_code}
                    </p>
                    {claimed && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">Offre enregistrée !</p>}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleClaim}
                    className="w-full cursor-pointer rounded-xl bg-insolit-pink py-4 text-lg font-bold text-white transition-opacity hover:bg-insolit-pink-hover hover:opacity-95"
                  >
                    Révéler le code promo
                  </button>
                )}
              </div>
            )}

            {promo.end_date && (
              <p className="mb-6 text-sm text-theme-subtle">
                Valable jusqu'au {new Date(promo.end_date).toLocaleDateString('fr-FR')}
              </p>
            )}

            {hasCoords && (
              <div className="h-64 overflow-hidden rounded-xl border border-dark-border">
                <MapContainer
                  center={[promo.latitude, promo.longitude]}
                  zoom={15}
                  scrollWheelZoom={false}
                  className="z-0 h-full w-full"
                  style={{ height: '100%', width: '100%' }}
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
    </div>
  )
}
