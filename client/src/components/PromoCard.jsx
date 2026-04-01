import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import CategoryGlyph from './CategoryGlyph'

export default function PromoCard({ promo }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(promo.id)

  function handleFavoriteClick(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(promo.id)
  }

  return (
    <Link
      to={`/promo/${promo.id}`}
      className="group relative block rounded-2xl border border-dark-border bg-dark-card p-4 shadow-sm transition-all hover:border-insolit-pink/40 hover:shadow-lg hover:shadow-pink-500/10 dark:shadow-none"
    >
      <button
        type="button"
        onClick={handleFavoriteClick}
        aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-dark-surface/80 transition-colors hover:bg-dark-surface"
      >
        <Heart
          className="h-4 w-4 text-insolit-pink"
          strokeWidth={2}
          fill={favorited ? 'currentColor' : 'none'}
          aria-hidden
        />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-insolit-pink/25 bg-gradient-to-br from-insolit-pink/15 to-pink-100/40 transition-transform duration-300 group-hover:scale-105 dark:from-insolit-pink/20 dark:to-insolit-pink/5">
          <CategoryGlyph
            categoryLabel={promo.category}
            className="h-7 w-7 text-insolit-pink"
            strokeWidth={2}
          />
        </div>

        <div className="min-w-0 flex-1 pr-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-insolit-pink/10 px-2 py-1 text-xs font-medium text-insolit-pink">
              <CategoryGlyph categoryLabel={promo.category} className="h-3.5 w-3.5" strokeWidth={2} />
              {promo.category || 'Sans catégorie'}
            </span>
            {promo.is_exclusive && (
              <span className="rounded-full bg-insolit-pink px-2 py-1 text-xs font-bold text-white">
                Exclusif
              </span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-theme transition-colors group-hover:text-insolit-pink">
            {promo.title}
          </h3>

          <p className="mt-1 truncate text-sm text-theme-muted">
            {promo.merchants?.name || 'Marchand'}
          </p>

          {promo.end_date && (
            <p className="mt-2 text-sm text-theme-subtle">
              Jusqu'au {new Date(promo.end_date).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
