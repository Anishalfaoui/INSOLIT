import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase.js'

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-secret-change-me'
}

function signPartnerToken(merchant) {
  return jwt.sign(
    { email: merchant.email, role: 'merchant' },
    getJwtSecret(),
    { subject: merchant.id, expiresIn: '7d' }
  )
}

function parsePoint(pointValue) {
  if (!pointValue || typeof pointValue !== 'string') {
    return { latitude: null, longitude: null }
  }

  const match = pointValue.match(/^\(([-\d.]+),([-\d.]+)\)$/)
  if (!match) {
    return { latitude: null, longitude: null }
  }

  return {
    longitude: Number.parseFloat(match[1]),
    latitude: Number.parseFloat(match[2]),
  }
}

function sanitizePartner(merchant) {
  const coords = parsePoint(merchant.coordinates)

  return {
    id: merchant.id,
    email: merchant.email,
    business_name: merchant.name,
    address: merchant.address,
    category_id: merchant.category_id,
    latitude: coords.latitude,
    longitude: coords.longitude,
  }
}

export async function registerPartner(req, res) {
  const { email, password, business_name, name, address, category_id, latitude, longitude } = req.body

  const resolvedName = (business_name || name || '').trim()
  const resolvedAddress = (address || '').trim()

  if (!email || !password || !resolvedName || !resolvedAddress) {
    return res.status(400).json({ error: 'email, password, business_name et address sont requis' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caracteres' })
  }

  const hasLatitude = latitude !== undefined && latitude !== null && latitude !== ''
  const hasLongitude = longitude !== undefined && longitude !== null && longitude !== ''

  if ((hasLatitude && !hasLongitude) || (!hasLatitude && hasLongitude)) {
    return res.status(400).json({ error: 'latitude et longitude doivent etre fournies ensemble' })
  }

  let normalizedLatitude = null
  let normalizedLongitude = null

  if (hasLatitude && hasLongitude) {
    normalizedLatitude = Number.parseFloat(latitude)
    normalizedLongitude = Number.parseFloat(longitude)

    if (!Number.isFinite(normalizedLatitude) || !Number.isFinite(normalizedLongitude)) {
      return res.status(400).json({ error: 'Coordonnees invalides' })
    }

    if (normalizedLatitude < -90 || normalizedLatitude > 90) {
      return res.status(400).json({ error: 'latitude doit etre entre -90 et 90' })
    }

    if (normalizedLongitude < -180 || normalizedLongitude > 180) {
      return res.status(400).json({ error: 'longitude doit etre entre -180 et 180' })
    }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const { data: existingMerchant, error: existingError } = await supabase
    .from('merchants')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingError) {
    return res.status(500).json({ error: existingError.message })
  }

  if (existingMerchant) {
    return res.status(409).json({ error: 'Cet email est deja utilise' })
  }

  const password_hash = await bcrypt.hash(password, 12)

  let normalizedCategoryId = null
  if (category_id !== undefined && category_id !== null && category_id !== '') {
    normalizedCategoryId = Number.parseInt(category_id, 10)
    if (!Number.isInteger(normalizedCategoryId) || normalizedCategoryId <= 0) {
      return res.status(400).json({ error: 'category_id invalide' })
    }
  }

  const basePayload = {
    email: normalizedEmail,
    name: resolvedName,
    address: resolvedAddress,
    category_id: normalizedCategoryId,
    coordinates: normalizedLatitude === null || normalizedLongitude === null
      ? null
      : `(${normalizedLongitude},${normalizedLatitude})`,
  }

  let merchant = null
  let insertError = null

  const insertCandidates = [
    { ...basePayload, password_hash },
    { ...basePayload, password: password_hash },
  ]

  for (const payload of insertCandidates) {
    const { data, error } = await supabase
      .from('merchants')
      .insert(payload)
      .select('id, email, name, address, category_id, coordinates')
      .single()

    if (!error) {
      merchant = data
      insertError = null
      break
    }

    insertError = error
    const message = (error.message || '').toLowerCase()
    const isColumnMismatch =
      message.includes('column') &&
      ((message.includes('password_hash') && Object.hasOwn(payload, 'password_hash')) ||
        (message.includes('password') && Object.hasOwn(payload, 'password')))

    if (!isColumnMismatch) {
      break
    }
  }

  if (insertError || !merchant) {
    return res.status(500).json({ error: insertError?.message || 'Impossible de creer le compte partenaire' })
  }

  const token = signPartnerToken(merchant)
  return res.status(201).json({ token, partner: sanitizePartner(merchant), merchant: sanitizePartner(merchant) })
}

export async function loginPartner(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const selectCandidates = [
    {
      select: 'id, email, name, address, category_id, coordinates, password_hash',
      secretField: 'password_hash',
    },
    {
      select: 'id, email, name, address, category_id, coordinates, password',
      secretField: 'password',
    },
  ]

  let merchant = null
  let secretField = null
  let fetchError = null

  for (const candidate of selectCandidates) {
    const { data, error } = await supabase
      .from('merchants')
      .select(candidate.select)
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (!error) {
      merchant = data
      secretField = candidate.secretField
      fetchError = null
      break
    }

    fetchError = error
    const message = (error.message || '').toLowerCase()
    const isColumnMismatch =
      message.includes('column') &&
      ((candidate.secretField === 'password_hash' && message.includes('password_hash')) ||
        (candidate.secretField === 'password' && message.includes('password')))

    if (!isColumnMismatch) {
      break
    }
  }

  if (fetchError && !merchant) {
    return res.status(500).json({ error: fetchError.message })
  }

  if (!merchant || !secretField || !merchant[secretField]) {
    return res.status(401).json({ error: 'Identifiants invalides' })
  }

  const storedSecret = String(merchant[secretField])
  const shouldUseBcrypt = secretField === 'password_hash' || storedSecret.startsWith('$2')
  const isValid = shouldUseBcrypt
    ? await bcrypt.compare(password, storedSecret)
    : storedSecret === password

  if (!isValid) {
    return res.status(401).json({ error: 'Identifiants invalides' })
  }

  const token = signPartnerToken(merchant)
  return res.json({ token, partner: sanitizePartner(merchant), merchant: sanitizePartner(merchant) })
}

export async function mePartner(req, res) {
  const { data: merchant, error } = await supabase
    .from('merchants')
    .select('id, email, name, address, category_id, coordinates')
    .eq('id', req.merchant.id)
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!merchant) {
    return res.status(404).json({ error: 'Partenaire introuvable' })
  }

  return res.json({ partner: sanitizePartner(merchant), merchant: sanitizePartner(merchant) })
}
