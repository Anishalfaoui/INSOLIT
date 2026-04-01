import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useFavorites } from '../context/FavoritesContext'

const PARIS_CENTER = [48.8566, 2.3522]
const NEAR_ME_RADIUS_KM = 3

const chipActive =
  'rounded-full border border-transparent bg-gradient-to-r from-neon-purple to-neon-cyan px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-neon-purple/20 transition-colors cursor-pointer'
const chipInactive =
  'rounded-full border border-dark-border bg-dark-card px-4 py-2 text-sm font-semibold text-slate-600 transition-colors cursor-pointer hover:border-neon-purple/50 hover:text-slate-900 dark:bg-dark-surface dark:text-gray-400 dark:hover:text-white'

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
function getPinIcon(emoji) {
  if (iconCache.has(emoji)) {
    return iconCache.get(emoji)
  }

  const icon = L.divIcon({
    className: 'insolit-pin-wrapper',
    html: `<div class="insolit-pin"><span>${emoji}</span></div>`,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
  })

  iconCache.set(emoji, icon)
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
        emoji: promo.category_icon || '🎉',
        name: promo.title,
        merchant: promo.merchants?.name || 'Marchand',
        category: promo.category || 'Offre',
      }))
  }, [promos])

  const filters = useMemo(() => {
    const categories = [...new Set(allMarkers.map((marker) => marker.category).filter(Boolean))]
    return [
      { key: 'all', label: '✨ Toutes' },
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
    <div className="flex h-[calc(100dvh-5rem)] w-full flex-col overflow-hidden bg-dark-bg text-theme md:h-[calc(100dvh-4rem)]">
      <header className="max-w-7xl mx-auto w-full shrink-0 px-4 pt-4 pb-3 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-1">
            <span className="bg-linear-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              Carte
            </span>{' '}
            des offres
          </h1>
          <p className="text-sm sm:text-base text-theme-muted">
            Repère les bons plans autour de toi
          </p>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex. : burger, soirée, sport…"
          className="input-theme rounded-2xl"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleNearMeClick}
            disabled={isLocating}
            className={`${isNearMeActive ? chipActive : chipInactive} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isLocating
              ? 'Localisation…'
              : isNearMeActive
                ? '📍 Près de moi (actif)'
                : '📍 Près de moi'}
          </button>

          <button
            type="button"
            onClick={() => setIsFavoritesOnly((prev) => !prev)}
            className={isFavoritesOnly ? chipActive : chipInactive}
          >
            {isFavoritesOnly ? '❤️ Favoris uniquement' : '🤍 Favoris'}
          </button>

          {isNearMeActive && (
            <span className="text-xs text-theme-muted">Rayon : {NEAR_ME_RADIUS_KM} km</span>
          )}
        </div>

        {geoError && (
          <p className="mt-2 text-xs text-red-400 dark:text-red-400">{geoError}</p>
        )}

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => {
            const active = activeFilter === filter.key
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={active ? chipActive : chipInactive}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 px-4 pb-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex h-full w-full min-h-0">
          <div className="h-full w-full min-h-0 overflow-hidden rounded-2xl border border-dark-border bg-dark-card shadow-lg shadow-neon-purple/5 dark:shadow-neon-purple/10">
            <MapContainer
              center={mapCenter}
              zoom={11}
              scrollWheelZoom
              className="map-view-leaflet z-0"
              style={{ height: '100%', width: '100%' }}
            >
              <MapAutoCenter center={mapCenter} zoom={isNearMeActive && userLocation ? 13 : 11} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {isNearMeActive && userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={getPinIcon('📍')}>
                  <Popup>
                    <p className="font-semibold text-slate-900">Tu es ici</p>
                  </Popup>
                </Marker>
              )}
              {visibleMarkers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={[marker.lat, marker.lng]}
                  icon={getPinIcon(marker.emoji)}
                >
                  <Popup>
                    <div className="min-w-[11rem] text-slate-900">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-lg">{marker.emoji}</span>
                        <p className="text-sm font-semibold text-neon-cyan">{marker.category}</p>
                      </div>
                      <p className="mb-1 font-semibold">{marker.name}</p>
                      <p className="mb-3 text-xs text-slate-600">{marker.merchant}</p>
                      {marker.promoId && (
                        <Link
                          to={`/promo/${marker.promoId}`}
                          className="inline-flex items-center rounded-lg bg-linear-to-r from-neon-purple to-neon-cyan px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
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
          <p className="absolute bottom-6 left-1/2 z-[400] max-w-md -translate-x-1/2 rounded-lg border border-dark-border bg-dark-card px-4 py-2 text-center text-xs text-theme-muted shadow-lg">
            Aucune offre dans un rayon de {NEAR_ME_RADIUS_KM} km.
          </p>
        )}
        {isFavoritesOnly && visibleMarkers.length === 0 && (
          <p className="absolute bottom-6 left-1/2 z-[400] max-w-md -translate-x-1/2 rounded-lg border border-dark-border bg-dark-card px-4 py-2 text-center text-xs text-theme-muted shadow-lg">
            Aucun favori avec une position sur la carte.
          </p>
        )}
      </main>
    </div>
  )
}
