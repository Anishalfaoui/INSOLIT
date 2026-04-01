import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PromoCard from '../components/PromoCard'

export default function Favorites() {
  const { getToken } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      const token = getToken()
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const promos = data.map((f) => ({
          ...f.promos,
          category: f.promos?.merchants?.categories?.label,
          category_icon: f.promos?.merchants?.categories?.icon,
        }))
        setFavorites(promos)
      }
      setLoading(false)
    }
    fetchFavorites()
  }, [getToken])

  return (
    <div className="page-shell min-h-[calc(100dvh-5rem)] md:min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold leading-tight sm:text-4xl">
            <span className="text-insolit-pink">Mes favoris</span>
          </h1>
          <p className="text-sm text-theme-muted sm:text-base">Tes bons plans sauvegardés</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-insolit-pink border-t-transparent" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center text-theme-muted">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-insolit-pink/10 text-insolit-pink">
              <Heart className="h-8 w-8" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="text-lg font-medium text-theme">Aucun favori pour le moment</p>
            <p className="mt-2 max-w-sm text-sm">
              Utilise l'icône cœur sur une offre pour la retrouver ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
