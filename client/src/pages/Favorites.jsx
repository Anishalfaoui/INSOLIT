import { useState, useEffect } from 'react'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 leading-tight">
          <span className="bg-linear-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
            Mes Favoris
          </span>
        </h1>
        <p className="text-sm sm:text-base text-theme-muted">
          Tes bons plans sauvegardés
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 text-theme-muted">
          <p className="text-5xl mb-4">🤍</p>
          <p className="text-lg">Aucun favori pour le moment</p>
          <p className="text-sm mt-2">Clique sur le cœur d'une offre pour la sauvegarder</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      )}
    </div>
  )
}
