import { supabase } from '../lib/supabase.js'

function parsePoint(pointValue) {
  if (!pointValue || typeof pointValue !== 'string') {
    return { latitude: null, longitude: null }
  }

  const match = pointValue.match(/^\(([-\d.]+),([-\d.]+)\)$/)
  if (!match) {
    return { latitude: null, longitude: null }
  }

  // PostgreSQL point stores x,y. We use x=longitude and y=latitude.
  const longitude = Number.parseFloat(match[1])
  const latitude = Number.parseFloat(match[2])

  return { latitude, longitude }
}

function normalizePromo(promo) {
  const coords = parsePoint(promo.merchants?.coordinates)
  const category = promo.merchants?.categories

  return {
    ...promo,
    category: category?.label ?? null,
    category_icon: category?.icon ?? null,
    latitude: coords.latitude,
    longitude: coords.longitude,
  }
}

function isMissingStatusColumn(error) {
  const message = String(error?.message || '').toLowerCase()
  return message.includes('status') && message.includes('column')
}

function getTodayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function expireOutdatedPromosIfPossible() {
  const today = getTodayDateString()
  const { error } = await supabase
    .from('promos')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('end_date', today)

  // Ignore until schema_partner.sql is applied.
  if (error && !isMissingStatusColumn(error)) {
    throw error
  }
}

export async function getAllPromos(req, res) {
  const { category } = req.query

  try {
    await expireOutdatedPromosIfPossible()
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }

  const buildQuery = () => supabase
    .from('promos')
    .select('*, merchants(name, address, coordinates, categories(label, icon))')
    .order('end_date', { ascending: true, nullsFirst: false })

  let { data, error } = await buildQuery().eq('status', 'active')

  // Backward compatibility until schema_partner.sql is executed.
  if (error && isMissingStatusColumn(error)) {
    const fallback = await buildQuery()
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const normalized = (data ?? []).map(normalizePromo)
  const filtered = category
    ? normalized.filter((promo) => promo.category === category)
    : normalized

  res.json(filtered)
}

export async function getPromoById(req, res) {
  const { id } = req.params

  try {
    await expireOutdatedPromosIfPossible()
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }

  const buildQuery = () => supabase
    .from('promos')
    .select('*, merchants(name, address, coordinates, categories(label, icon))')
    .eq('id', id)

  let { data, error } = await buildQuery().eq('status', 'active').single()

  // Backward compatibility until schema_partner.sql is executed.
  if (error && isMissingStatusColumn(error)) {
    const fallback = await buildQuery().single()
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    return res.status(404).json({ error: 'Promo introuvable' })
  }

  res.json(normalizePromo(data))
}
