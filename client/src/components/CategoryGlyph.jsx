import { PIN_ICON_COMPONENTS, categoryToPinIconKey } from '../lib/mapPinIcon'

export default function CategoryGlyph({ categoryLabel, className = 'h-4 w-4', strokeWidth = 2 }) {
  const key = categoryToPinIconKey(categoryLabel)
  const Icon = PIN_ICON_COMPONENTS[key] || PIN_ICON_COMPONENTS.tag
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />
}
