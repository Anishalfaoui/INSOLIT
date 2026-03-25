import { Link } from 'react-router-dom'

const ICONS_BY_CATEGORY = {
  food: ['🍜', '🍕', '🍔', '🥗'],
  sport: ['🏋️', '⚽', '🏀', '🧘'],
  culture: ['🎬', '🎭', '🎨', '🎵'],
  tech: ['💻', '📱', '🎧', '🕹️'],
  mode: ['👟', '🧥', '👜', '🕶️'],
  beaute: ['💄', '🧴', '💅', '✨'],
  chill: ['🧘', '🛀', '☕', '🕯️'],
  experience: ['🎟️', '🎉', '🎯', '🎪'],
  sanscategorie: ['🎁', '⭐', '🎊', '🔥'],
}

function normalizeCategoryLabel(label) {
  return (label || 'sanscategorie')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase()
}

function pickCategoryIcon(promo) {
  const normalizedCategory = normalizeCategoryLabel(promo.category)
  const iconSet = ICONS_BY_CATEGORY[normalizedCategory] || ICONS_BY_CATEGORY.sanscategorie

  const firstLetter = (promo.title || '').trim().charAt(0).toLowerCase()
  const isAlpha = firstLetter >= 'a' && firstLetter <= 'z'
  const alphaIndex = isAlpha ? firstLetter.charCodeAt(0) - 97 : (promo.title || '').length

  return iconSet[alphaIndex % iconSet.length]
}

export default function PromoCard({ promo }) {
  const cardIcon = pickCategoryIcon(promo)

  return (
    <Link
      to={`/promo/${promo.id}`}
      className="group block bg-dark-card border border-dark-border rounded-2xl p-4 hover:border-neon-purple/50 transition-all hover:shadow-lg hover:shadow-neon-purple/10"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-14 h-14 rounded-xl bg-linear-to-br from-neon-purple/20 to-neon-cyan/20 border border-neon-cyan/20 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform duration-300">
          <span aria-hidden>{cardIcon}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-neon-cyan bg-neon-cyan/10 px-2 py-1 rounded-full">
              {promo.category_icon ? `${promo.category_icon} ` : ''}{promo.category || 'Sans categorie'}
            </span>
            {promo.is_exclusive && (
              <span className="text-xs font-bold text-white bg-linear-to-r from-neon-purple to-neon-cyan px-2 py-1 rounded-full">
                Exclusif
              </span>
            )}
          </div>

          <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-neon-purple transition-colors line-clamp-2">
            {promo.title}
          </h3>

          <p className="mt-1 text-sm text-gray-400 truncate">
            {promo.merchants?.name || 'Marchand'}
          </p>

          {promo.end_date && (
            <p className="mt-2 text-sm text-gray-500">
              Jusqu'au {new Date(promo.end_date).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
