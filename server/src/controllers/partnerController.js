import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase.js'

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-secret-change-me'
}

function signPartnerToken(partner) {
  return jwt.sign(
    { email: partner.email, role: 'merchant' },
    getJwtSecret(),
    { subject: partner.id, expiresIn: '7d' }
  )
}

function sanitizePartner(partner) {
  return {
    id: partner.id,
    email: partner.email,
    business_name: partner.name,
    address: partner.address,
    created_at: partner.created_at,
  }
}

function isMissingMerchantAuthColumn(error) {
  const message = String(error?.message || '').toLowerCase()
  if (!message.includes('column')) return false
  return (
    message.includes('email') ||
    message.includes('password_hash') ||
    message.includes('created_at')
  )
}

function handleMerchantSchemaError(res, error) {
  if (isMissingMerchantAuthColumn(error)) {
    return res.status(503).json({
      error: 'Migration requise: execute supabase/schema_partner.sql dans Supabase SQL Editor',
    })
  }
  return res.status(500).json({ error: error.message })
}

export async function registerPartner(req, res) {
  const { email, password, business_name, address } = req.body

  if (!email || !password || !business_name || !address) {
    return res.status(400).json({ error: 'email, password, business_name et address sont requis' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caracteres' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedBusinessName = business_name.trim()
  const normalizedAddress = address.trim()

  if (!normalizedBusinessName) {
    return res.status(400).json({ error: 'business_name est requis' })
  }
  if (!normalizedAddress) {
    return res.status(400).json({ error: 'address est requis' })
  }

  const { data: existingPartner, error: existingError } = await supabase
    .from('merchants')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingError) {
    return handleMerchantSchemaError(res, existingError)
  }

  if (existingPartner) {
    return res.status(409).json({ error: 'Cet email est deja utilise' })
  }

  const password_hash = await bcrypt.hash(password, 12)

  const { data: partner, error } = await supabase
    .from('merchants')
    .insert({
      name: normalizedBusinessName,
      address: normalizedAddress,
      email: normalizedEmail,
      password_hash,
    })
    .select('id, name, address, email, created_at')
    .single()

  if (error) {
    return handleMerchantSchemaError(res, error)
  }

  const token = signPartnerToken(partner)
  return res.status(201).json({ token, partner: sanitizePartner(partner) })
}

export async function loginPartner(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { data: partner, error } = await supabase
    .from('merchants')
    .select('id, name, address, email, created_at, password_hash')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (error) {
    return handleMerchantSchemaError(res, error)
  }

  if (!partner) {
    return res.status(401).json({ error: 'Identifiants invalides' })
  }

  const isValid = await bcrypt.compare(password, partner.password_hash)
  if (!isValid) {
    return res.status(401).json({ error: 'Identifiants invalides' })
  }

  const token = signPartnerToken(partner)
  return res.json({ token, partner: sanitizePartner(partner) })
}

export async function mePartner(req, res) {
  const { data: partner, error } = await supabase
    .from('merchants')
    .select('id, name, address, email, created_at')
    .eq('id', req.merchant.id)
    .maybeSingle()

  if (error) {
    return handleMerchantSchemaError(res, error)
  }

  if (!partner) {
    return res.status(404).json({ error: 'Partenaire introuvable' })
  }

  return res.json({ partner: sanitizePartner(partner) })
}
