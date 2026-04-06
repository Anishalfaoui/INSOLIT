import { useState, useEffect } from 'react'
import { FolderOpen } from 'lucide-react'
import PromoCard from '../components/PromoCard'
import CategoryFilter from '../components/CategoryFilter'

export default function Dashboard() {
  const [promos, setPromos] = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchPromos()
  }, [category])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json().catch(() => [])
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      setCategories([])
    }
  }

  async function fetchPromos() {
    setLoading(true)
    setError('')
    const url = category
      ? `/api/promos?category=${encodeURIComponent(category)}`
      : '/api/promos'
    try {
      const res = await fetch(url)
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setPromos([])
        setError(data?.error || 'Impossible de charger les promos')
        return
      }

      setPromos(Array.isArray(data) ? data : [])
    } catch {
      setPromos([])
      setError('Impossible de charger les promos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell min-h-[calc(100dvh-5rem)] md:min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold leading-tight sm:text-4xl">
            <span className="text-insolit-pink">Bons Plans</span>{' '}
            <span className="text-theme">du moment</span>
          </h1>
          <p className="text-sm text-theme-muted sm:text-base">
            Les meilleurs deals exclusifs pour les moins de 26 ans
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <CategoryFilter selected={category} onChange={setCategory} categories={categories} />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-insolit-pink border-t-transparent" />
          </div>
        ) : promos.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center text-theme-muted">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-insolit-pink/10 text-insolit-pink">
              <FolderOpen className="h-8 w-8" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="text-lg font-medium text-theme">Aucune promo dans cette catégorie</p>
            <p className="mt-1 text-sm">Essaie une autre catégorie ou reviens plus tard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {promos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
