import bcrypt from 'bcryptjs'
import { supabase } from '../lib/supabase.js'
import { signToken } from '../middleware/auth.js'
import { isUnder26 } from '../utils/age.js'

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    avatar_url: user.avatar_url,
    full_name: user.full_name,
    birth_date: user.birth_date,
    phone: user.phone,
    city: user.city,
  }
}

function sanitizeMerchant(merchant) {
  const coords = parsePoint(merchant.coordinates)

  return {
    id: merchant.id,
    email: merchant.email,
    name: merchant.name,
    address: merchant.address,
    category_id: merchant.category_id,
    latitude: coords.latitude,
    longitude: coords.longitude,
  }
}

function parsePoint(pointValue) {
  if (!pointValue || typeof pointValue !== 'string') {
    return { latitude: null, longitude: null }
  }

  const match = pointValue.match(/^\(([-\d.]+),([-\d.]+)\)$/)
  if (!match) {
    return { latitude: null, longitude: null }
  }

  const longitude = Number.parseFloat(match[1])
  const latitude = Number.parseFloat(match[2])

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { latitude: null, longitude: null }
  }

  return { latitude, longitude }
}

export async function register(req, res) {
  const { email, password, full_name, birth_date, phone, city } = req.body

  if (!email || !password || !full_name || !birth_date || !phone || !city) {
    return res.status(400).json({ error: 'Tous les champs sont requis' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' })
  }

  if (!isUnder26(birth_date)) {
    return res.status(403).json({ error: 'Accès réservé aux moins de 26 ans' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingUser) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé' })
  }

  const password_hash = await bcrypt.hash(password, 12)

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: normalizedEmail,
      password_hash,
      avatar_url: null,
      full_name,
      birth_date,
      phone,
      city,
    })
    .select('id, email, avatar_url, full_name, birth_date, phone, city')
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const token = signToken(user)
  res.status(201).json({ token, user: sanitizeUser(user) })
}

export async function registerPartner(req, res) {
  const { email, password, name, address, category_id, latitude, longitude } = req.body

  if (!email || !password || !name || !address) {
    return res.status(400).json({ error: 'name, email, password et address sont requis' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' })
  }

  const hasLatitude = latitude !== undefined && latitude !== null && latitude !== ''
  const hasLongitude = longitude !== undefined && longitude !== null && longitude !== ''

  if ((hasLatitude && !hasLongitude) || (!hasLatitude && hasLongitude)) {
    return res.status(400).json({ error: 'latitude et longitude doivent être fournies ensemble' })
  }

  let normalizedLatitude = null
  let normalizedLongitude = null

  if (hasLatitude && hasLongitude) {
    normalizedLatitude = Number.parseFloat(latitude)
    normalizedLongitude = Number.parseFloat(longitude)

    if (!Number.isFinite(normalizedLatitude) || !Number.isFinite(normalizedLongitude)) {
      return res.status(400).json({ error: 'Coordonnées invalides' })
    }

    if (normalizedLatitude < -90 || normalizedLatitude > 90) {
      return res.status(400).json({ error: 'latitude doit être entre -90 et 90' })
    }

    if (normalizedLongitude < -180 || normalizedLongitude > 180) {
      return res.status(400).json({ error: 'longitude doit être entre -180 et 180' })
    }
  }

  let normalizedCategoryId = null
  if (category_id !== undefined && category_id !== null && category_id !== '') {
    normalizedCategoryId = Number.parseInt(category_id, 10)
    if (!Number.isInteger(normalizedCategoryId) || normalizedCategoryId <= 0) {
      return res.status(400).json({ error: 'category_id invalide' })
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
    return res.status(409).json({ error: 'Cet email partenaire est déjà utilisé' })
  }

  const password_hash = await bcrypt.hash(password, 12)
  const basePayload = {
    email: normalizedEmail,
    name: name.trim(),
    address: address.trim(),
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
    return res.status(500).json({ error: insertError?.message || 'Impossible de créer le compte partenaire' })
  }

  res.status(201).json({
    message: 'Compte partenaire créé. Tu peux maintenant te connecter.',
    merchant: sanitizeMerchant(merchant),
  })
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

  const token = signToken({ id: merchant.id, email: merchant.email })
  res.json({ token, merchant: sanitizeMerchant(merchant) })
}

export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, avatar_url, password_hash, full_name, birth_date, phone, city')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides' })
  }

  const isValid = await bcrypt.compare(password, user.password_hash)
  if (!isValid) {
    return res.status(401).json({ error: 'Identifiants invalides' })
  }

  const token = signToken(user)
  res.json({ token, user: sanitizeUser(user) })
}

export async function me(req, res) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, avatar_url, full_name, birth_date, phone, city')
    .eq('id', req.user.id)
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' })
  }

  res.json({ user: sanitizeUser(user) })
}

export async function updateMe(req, res) {
  const { full_name, birth_date, phone, city, avatar_url } = req.body

  if (!full_name || !birth_date || !phone || !city) {
    return res.status(400).json({ error: 'full_name, birth_date, phone et city sont requis' })
  }

  if (!isUnder26(birth_date)) {
    return res.status(403).json({ error: 'Accès réservé aux moins de 26 ans' })
  }

  if (avatar_url && typeof avatar_url === 'string' && avatar_url.length > 2500000) {
    return res.status(400).json({ error: 'Image trop volumineuse' })
  }

  const payload = {
    full_name,
    birth_date,
    phone,
    city,
    avatar_url: avatar_url || null,
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', req.user.id)
    .select('id, email, avatar_url, full_name, birth_date, phone, city')
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ user: sanitizeUser(user) })
}
