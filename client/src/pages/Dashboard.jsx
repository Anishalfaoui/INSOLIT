import { useState, useEffect } from 'react'
import PromoCard from '../components/PromoCard'
import CategoryFilter from '../components/CategoryFilter'

export default function Dashboard() {
  const [promos, setPromos] = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchPromos()
  }, [category])

  async function fetchCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(Array.isArray(data) ? data : [])
  }

  async function fetchPromos() {
    setLoading(true)
    const url = category
      ? `/api/promos?category=${encodeURIComponent(category)}`
      : '/api/promos'
    const res = await fetch(url)
    const data = await res.json()
    setPromos(data)
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 leading-tight">
          <span className="bg-linear-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
            Bons Plans
          </span>{' '}
          du moment
        </h1>
        <p className="text-sm sm:text-base text-theme-muted">Les meilleurs deals exclusifs pour les moins de 26 ans</p>
      </div>

      <div className="mb-6 sm:mb-8">
        <CategoryFilter selected={category} onChange={setCategory} categories={categories} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : promos.length === 0 ? (
        <div className="text-center py-20 text-theme-muted">
          <p className="text-5xl mb-4">😢</p>
          <p className="text-lg">Aucune promo trouvée dans cette catégorie</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      )}
    </div>
  )
}
