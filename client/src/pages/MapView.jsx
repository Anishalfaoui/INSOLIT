import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Heart, LayoutGrid, Loader2, MapPin, Navigation, Search } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import CategoryGlyph from '../components/CategoryGlyph'
import { categoryToPinIconKey, renderPinInnerHtml } from '../lib/mapPinIcon'

const PARIS_CENTER = [48.8566, 2.3522]
const NEAR_ME_RADIUS_KM = 3

const chipBase =
  'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer'
const chipActive = `${chipBase} border-transparent bg-insolit-pink text-white shadow-md shadow-pink-500/30 hover:bg-insolit-pink-hover`
const chipInactive = `${chipBase} border-slate-200/90 bg-white text-slate-700 shadow-sm hover:border-insolit-pink/40 dark:border-dark-border dark:bg-dark-surface dark:text-gray-300 dark:shadow-none dark:hover:border-insolit-pink/50`

function haversineDistanceKm(from, to) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const earthRadiusKm = 6371

  const dLat = toRad(to.lat - from.lat)
  const dLng = toRad(to.lng - from.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

function MapAutoCenter({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])

  return null
}

const iconCache = new Map()
function getPinLeafletIcon(iconKey, variant = 'promo') {
  const cacheKey = `${variant}:${iconKey}`
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)
  }

  const innerKey = variant === 'user' ? 'user' : iconKey
  const inner = renderPinInnerHtml(innerKey, variant === 'user' ? 'user' : 'promo')
  const pinClass = variant === 'user' ? 'insolit-pin insolit-pin--user' : 'insolit-pin'

  const icon = L.divIcon({
    className: 'insolit-pin-wrapper',
    html: `<div class="${pinClass}"><span class="insolit-pin-inner">${inner}</span></div>`,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
  })

  iconCache.set(cacheKey, icon)
  return icon
}

export default function MapView() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [promos, setPromos] = useState([])
  const [isNearMeActive, setIsNearMeActive] = useState(false)
  const [isFavoritesOnly, setIsFavoritesOnly] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const { isFavorite } = useFavorites()

  useEffect(() => {
    fetch('/api/promos')
      .then((res) => res.json())
      .then((data) => {
        setPromos(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setPromos([])
      })
  }, [])

  const allMarkers = useMemo(() => {
    return promos
      .filter((promo) => Number.isFinite(promo.latitude) && Number.isFinite(promo.longitude))
      .map((promo) => ({
        id: promo.id,
        promoId: promo.id,
        lat: promo.latitude,
        lng: promo.longitude,
        pinIconKey: categoryToPinIconKey(promo.category),
        name: promo.title,
        merchant: promo.merchants?.name || 'Marchand',
        category: promo.category || 'Offre',
      }))
  }, [promos])

  const filters = useMemo(() => {
    const categories = [...new Set(allMarkers.map((marker) => marker.category).filter(Boolean))]
    return [
      { key: 'all', label: 'Toutes' },
      ...categories.map((category) => ({ key: category, label: category })),
    ]
  }, [allMarkers])

  function handleNearMeClick() {
    if (isNearMeActive) {
      setIsNearMeActive(false)
      setGeoError('')
      return
    }

    if (!navigator.geolocation) {
      setGeoError('La géolocalisation est indisponible sur cet appareil.')
      return
    }

    setIsLocating(true)
    setGeoError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setIsNearMeActive(true)
        setIsLocating(false)
      },
      () => {
        setGeoError('Autorise la géolocalisation pour utiliser « Près de moi ».')
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    )
  }

  const visibleMarkers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allMarkers.filter((marker) => {
      const filterMatch = activeFilter === 'all' ? true : marker.category === activeFilter
      const queryMatch = !q || marker.name.toLowerCase().includes(q)
      const favoriteMatch = isFavoritesOnly ? isFavorite(marker.promoId) : true

      let nearMatch = true
      if (isNearMeActive && userLocation) {
        nearMatch =
          haversineDistanceKm(
            { lat: userLocation.lat, lng: userLocation.lng },
            { lat: marker.lat, lng: marker.lng }
          ) <= NEAR_ME_RADIUS_KM
      }

      return filterMatch && queryMatch && nearMatch && favoriteMatch
    })
  }, [allMarkers, activeFilter, query, isNearMeActive, userLocation, isFavoritesOnly, isFavorite])

  const mapCenter = useMemo(() => {
    if (isNearMeActive && userLocation) {
      return [userLocation.lat, userLocation.lng]
    }

    if (visibleMarkers[0]) {
      return [visibleMarkers[0].lat, visibleMarkers[0].lng]
    }

    return PARIS_CENTER
  }, [isNearMeActive, userLocation, visibleMarkers])

  return (
    <div className="page-shell flex h-[calc(100dvh-5rem)] w-full flex-col overflow-hidden text-theme md:h-[calc(100dvh-4rem)]">
      <header className="shrink-0 px-4 pt-3 pb-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-md dark:border-dark-border dark:bg-dark-card/95">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-3 dark:border-dark-border/80">
              <div>
                <h1 className="text-xl font-bold leading-tight sm:text-2xl">
                  <span className="text-insolit-pink">Carte</span>{' '}
                  <span className="text-theme">des offres</span>
                </h1>
                <p className="mt-0.5 text-xs text-theme-muted sm:text-sm">
                  Explore et filtre les promos géolocalisées
                </p>
              </div>
              <p className="text-xs font-medium tabular-nums text-theme-muted">
                {visibleMarkers.length} sur {allMarkers.length}
              </p>
            </div>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-gray-500"
                strokeWidth={2}
                aria-hidden
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une offre…"
                className="input-theme rounded-xl py-3 pl-11 pr-4 shadow-none dark:shadow-none"
                aria-label="Rechercher sur la carte"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleNearMeClick}
                disabled={isLocating}
                className={`${isNearMeActive ? chipActive : chipInactive} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isLocating ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={2} aria-hidden />
                ) : (
                  <Navigation className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                )}
                {isLocating ? 'Localisation…' : isNearMeActive ? 'Près de moi (actif)' : 'Près de moi'}
              </button>

              <button
                type="button"
                onClick={() => setIsFavoritesOnly((prev) => !prev)}
                className={isFavoritesOnly ? chipActive : chipInactive}
                aria-pressed={isFavoritesOnly}
              >
                <Heart
                  className="h-4 w-4 shrink-0"
                  strokeWidth={2}
                  aria-hidden
                  fill={isFavoritesOnly ? 'currentColor' : 'none'}
                />
                {isFavoritesOnly ? 'Favoris uniquement' : 'Favoris'}
              </button>

              {isNearMeActive && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-theme-muted dark:bg-dark-surface">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Rayon {NEAR_ME_RADIUS_KM} km
                </span>
              )}
            </div>

            {geoError && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                {geoError}
              </p>
            )}

            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filters.map((filter) => {
                const active = activeFilter === filter.key
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={active ? chipActive : chipInactive}
                  >
                    {filter.key === 'all' ? (
                      <LayoutGrid className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                    ) : (
                      <CategoryGlyph categoryLabel={filter.label} className="h-4 w-4 shrink-0 opacity-90" />
                    )}
                    {filter.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 px-4 pb-4 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full w-full min-h-0 max-w-7xl">
          <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100/80 ring-1 ring-black/[0.04] dark:border-dark-border dark:bg-dark-surface/50 dark:ring-white/5">
            <MapContainer
              center={mapCenter}
              zoom={11}
              scrollWheelZoom
              className="map-view-leaflet z-0 !h-full !min-h-[12rem]"
              style={{ height: '100%', width: '100%' }}
            >
              <MapAutoCenter center={mapCenter} zoom={isNearMeActive && userLocation ? 13 : 11} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {isNearMeActive && userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={getPinLeafletIcon('user', 'user')}
                >
                  <Popup>
                    <p className="m-0 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Ta position
                    </p>
                  </Popup>
                </Marker>
              )}
              {visibleMarkers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={[marker.lat, marker.lng]}
                  icon={getPinLeafletIcon(marker.pinIconKey, 'promo')}
                >
                  <Popup>
                    <div className="min-w-[12rem] max-w-[16rem] py-1 text-slate-900 dark:text-slate-100">
                      <div className="mb-2 flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-insolit-pink/10 text-insolit-pink">
                          <CategoryGlyph categoryLabel={marker.category} className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-insolit-pink">
                            {marker.category}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold leading-snug">{marker.name}</p>
                        </div>
                      </div>
                      <p className="mb-3 text-xs text-slate-600 dark:text-gray-400">{marker.merchant}</p>
                      {marker.promoId && (
                        <Link
                          to={`/promo/${marker.promoId}`}
                          className="inline-flex w-full items-center justify-center rounded-full bg-insolit-pink py-2 text-xs font-semibold text-white transition-opacity hover:bg-insolit-pink-hover"
                        >
                          Voir la promo
                        </Link>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {isNearMeActive && visibleMarkers.length === 0 && (
          <div className="absolute bottom-5 left-1/2 z-[400] flex max-w-sm -translate-x-1/2 items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-xs text-theme-muted shadow-lg dark:border-dark-border dark:bg-dark-card">
            <MapPin className="h-4 w-4 shrink-0 text-insolit-pink" strokeWidth={2} aria-hidden />
            Aucune offre dans un rayon de {NEAR_ME_RADIUS_KM} km.
          </div>
        )}
        {isFavoritesOnly && visibleMarkers.length === 0 && (
          <div className="absolute bottom-5 left-1/2 z-[400] flex max-w-sm -translate-x-1/2 items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-xs text-theme-muted shadow-lg dark:border-dark-border dark:bg-dark-card">
            <Heart className="h-4 w-4 shrink-0 text-insolit-pink" strokeWidth={2} aria-hidden />
            Aucun favori avec une position sur la carte.
          </div>
        )}
      </main>
    </div>
  )
}
