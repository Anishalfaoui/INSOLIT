import { LayoutGrid } from 'lucide-react'
import CategoryGlyph from './CategoryGlyph'

export default function CategoryFilter({ selected, onChange, categories }) {
  const allCategories = ['Tous', ...categories.map((cat) => cat.label)]

  const chipActive =
    'inline-flex items-center gap-2 rounded-full bg-insolit-pink px-4 py-2 text-sm font-medium text-white shadow-md shadow-pink-500/30 transition-all hover:bg-insolit-pink-hover cursor-pointer'
  const chipInactive =
    'inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-insolit-pink/40 cursor-pointer dark:border-dark-border dark:bg-dark-surface dark:text-gray-300 dark:shadow-none dark:hover:border-insolit-pink/50'

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => {
        const active = (cat === 'Tous' && !selected) || selected === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat === 'Tous' ? null : cat)}
            className={active ? chipActive : chipInactive}
          >
            {cat === 'Tous' ? (
              <LayoutGrid className="h-4 w-4 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
            ) : (
              <CategoryGlyph categoryLabel={cat} className="h-4 w-4 shrink-0 opacity-95" strokeWidth={2} />
            )}
            {cat}
          </button>
        )
      })}
    </div>
  )
}
