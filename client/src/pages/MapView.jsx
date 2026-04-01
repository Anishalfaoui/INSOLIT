import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useFavorites } from '../context/FavoritesContext'

const PARIS_CENTER = [48.8566, 2.3522]
const NEAR_ME_RADIUS_KM = 3

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
      setGeoError('La geolocalisation est indisponible sur cet appareil.')
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
        setGeoError('Autorise la geolocalisation pour utiliser Near me now.')
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
    <div className="h-[calc(100dvh-5rem)] md:h-[calc(100dvh-4rem)] w-full bg-slate-100 text-slate-900 flex flex-col overflow-hidden dark:bg-[#0d0e14] dark:text-white">
      <header className="px-4 pt-4 pb-3 shrink-0 md:max-w-7xl md:mx-auto md:w-full md:px-6 lg:px-8">

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex : Burger, soirée..."
          className="w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:border-[#ff2e9c] bg-white border-slate-200 text-slate-900 placeholder-slate-400 dark:bg-[#191b26] dark:border-[#2a2d3d] dark:text-gray-100 dark:placeholder-gray-500"
        />

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button
            onClick={handleNearMeClick}
            disabled={isLocating}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              isNearMeActive
                ? 'bg-[#ff2e9c] border-[#ff2e9c] text-white'
                : 'bg-white border-slate-200 text-slate-700 dark:bg-[#1a1d2a] dark:border-[#2f3346] dark:text-gray-300'
            }`}
          >
            {isLocating ? 'Localisation...' : isNearMeActive ? '📍 Near me now ON' : '📍 Near me now'}
          </button>

          <button
            type="button"
            onClick={() => setIsFavoritesOnly((prev) => !prev)}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors cursor-pointer ${
              isFavoritesOnly
                ? 'bg-[#ff2e9c] border-[#ff2e9c] text-white'
                : 'bg-[#1a1d2a] border-[#2f3346] text-gray-300'
            }`}
          >
            {isFavoritesOnly ? '❤️ Favoris ON' : '🤍 Favoris'}
          </button>

          {isNearMeActive && (
            <span className="text-xs text-slate-500 dark:text-gray-400">Rayon: {NEAR_ME_RADIUS_KM} km</span>
          )}
        </div>

        {geoError && <p className="mt-2 text-xs text-red-400">{geoError}</p>}

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => {
            const active = activeFilter === filter.key
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#ff2e9c] border-[#ff2e9c] text-white'
                    : 'bg-[#1a1d2a] border-[#2f3346] text-gray-300'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </header>

      <main className="relative flex-1 min-h-0 px-4 pb-4 md:px-6 lg:px-8">
        <div className="h-full overflow-hidden rounded-2xl border border-slate-200 shadow-lg dark:border-[#2a2d3d] dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <MapContainer
            center={mapCenter}
            zoom={11}
            scrollWheelZoom
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
                  <p className="font-semibold text-[#111827]">Vous etes ici</p>
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
                  <div className="min-w-45">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{marker.emoji}</span>
                      <p className="font-semibold text-sm text-[#111827]">{marker.category}</p>
                    </div>
                    <p className="font-semibold text-[#111827] mb-1">{marker.name}</p>
                    <p className="text-xs text-gray-600 mb-3">{marker.merchant}</p>
                    {marker.promoId && (
                      <Link
                        to={`/promo/${marker.promoId}`}
                        className="inline-flex items-center rounded-md bg-[#ff2e9c] px-3 py-1.5 text-xs font-semibold text-white"
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
        {isNearMeActive && visibleMarkers.length === 0 && (
          <p className="mt-2 text-xs text-theme-muted">Aucune offre trouvée dans un rayon de {NEAR_ME_RADIUS_KM} km.</p>
        )}
        {isFavoritesOnly && visibleMarkers.length === 0 && (
          <p className="mt-2 text-xs text-theme-muted">Aucun favori avec une position sur la carte.</p>
        )}
      </main>
    </div>
  )
}
