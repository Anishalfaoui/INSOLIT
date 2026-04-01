import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  Tag,
  UtensilsCrossed,
  Dumbbell,
  Clapperboard,
  Laptop,
  Shirt,
  Sparkles,
  Coffee,
  Ticket,
  Gift,
  Navigation,
} from 'lucide-react'

export const PIN_ICON_COMPONENTS = {
  tag: Tag,
  utensils: UtensilsCrossed,
  dumbbell: Dumbbell,
  clapperboard: Clapperboard,
  laptop: Laptop,
  shirt: Shirt,
  sparkles: Sparkles,
  coffee: Coffee,
  ticket: Ticket,
  gift: Gift,
  user: Navigation,
}

const PIN_ICONS = PIN_ICON_COMPONENTS

function pinIconMarkup(iconKey, variant = 'promo') {
  const Icon = PIN_ICONS[iconKey] || PIN_ICONS.tag
  const colorClass = variant === 'user' ? 'text-sky-600' : 'text-insolit-pink'
  return renderToStaticMarkup(
    createElement(Icon, {
      size: 14,
      strokeWidth: 2.5,
      className: colorClass,
      'aria-hidden': true,
    })
  )
}

export function categoryToPinIconKey(label) {
  const s = (label || '').toLowerCase()
  if (
    s.includes('restaurant') ||
    s.includes('food') ||
    s.includes('nourriture') ||
    s.includes('gastronomie') ||
    s.includes('burger')
  ) {
    return 'utensils'
  }
  if (s.includes('sport') || s.includes('fitness') || s.includes('gym')) return 'dumbbell'
  if (
    s.includes('culture') ||
    s.includes('cinéma') ||
    s.includes('cinema') ||
    s.includes('film') ||
    s.includes('musée') ||
    s.includes('musee') ||
    s.includes('théâtre') ||
    s.includes('theatre')
  ) {
    return 'clapperboard'
  }
  if (s.includes('tech') || s.includes('numérique') || s.includes('numerique')) return 'laptop'
  if (s.includes('mode') || s.includes('vêtement') || s.includes('vetement')) return 'shirt'
  if (s.includes('beauté') || s.includes('beaute') || s.includes('cosmétique') || s.includes('cosmetique')) {
    return 'sparkles'
  }
  if (s.includes('chill') || s.includes('détente') || s.includes('detente') || s.includes('café') || s.includes('cafe')) {
    return 'coffee'
  }
  if (s.includes('expérience') || s.includes('experience') || s.includes('loisir')) return 'ticket'
  if (s.includes('cadeau') || s.includes('gift')) return 'gift'
  return 'tag'
}

export function renderPinInnerHtml(iconKey, variant = 'promo') {
  return pinIconMarkup(iconKey, variant)
}
