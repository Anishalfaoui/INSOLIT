import bcrypt from 'bcryptjs'
import { supabase } from '../lib/supabase.js'
import { signToken } from '../middleware/auth.js'
import { isUnder26 } from '../utils/age.js'

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    is_admin: Boolean(user.is_admin),
    avatar_url: user.avatar_url,
    full_name: user.full_name,
    birth_date: user.birth_date,
    phone: user.phone,
    city: user.city,
  }
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
    .select('id, email, is_admin, avatar_url, full_name, birth_date, phone, city')
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const token = signToken(user)
  res.status(201).json({ token, user: sanitizeUser(user) })
}

export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, is_admin, avatar_url, password_hash, full_name, birth_date, phone, city')
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
    .select('id, email, is_admin, avatar_url, full_name, birth_date, phone, city')
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
    .select('id, email, is_admin, avatar_url, full_name, birth_date, phone, city')
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ user: sanitizeUser(user) })
}
