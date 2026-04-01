import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext({})

export const useFavorites = () => useContext(FavoritesContext)

export function FavoritesProvider({ children }) {
  const { user, getToken } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [loading, setLoading] = useState(false)

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set())
      return
    }
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setFavoriteIds(new Set(data.map((f) => f.promo_id)))
      }
    } finally {
      setLoading(false)
    }
  }, [user, getToken])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  async function addFavorite(promoId) {
    const token = getToken()
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ promo_id: promoId }),
    })
    if (res.ok) {
      setFavoriteIds((prev) => new Set([...prev, promoId]))
    }
  }

  async function removeFavorite(promoId) {
    const token = getToken()
    const res = await fetch(`/api/favorites/${promoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        next.delete(promoId)
        return next
      })
    }
  }

  function toggleFavorite(promoId) {
    if (favoriteIds.has(promoId)) {
      return removeFavorite(promoId)
    }
    return addFavorite(promoId)
  }

  function isFavorite(promoId) {
    return favoriteIds.has(promoId)
  }

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, loading, isFavorite, toggleFavorite, fetchFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}
