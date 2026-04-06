import { supabase } from '../lib/supabase.js'

function sanitizeStatus(status) {
  const allowed = ['draft', 'active', 'expired']
  if (!status) return 'active'
  return allowed.includes(status) ? status : null
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

async function expireMerchantOutdatedPromosIfPossible(merchantId) {
  const today = getTodayDateString()
  const { error } = await supabase
    .from('promos')
    .update({ status: 'expired' })
    .eq('merchant_id', merchantId)
    .eq('status', 'active')
    .lt('end_date', today)

  if (error && !isMissingStatusColumn(error)) {
    throw error
  }
}

export async function getMyPromos(req, res) {
  try {
    await expireMerchantOutdatedPromosIfPossible(req.merchant.id)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }

  const { data, error } = await supabase
    .from('promos')
    .select(`
      id,
      title,
      description,
      promo_code,
      end_date,
      is_exclusive,
      merchant_id,
      status,
      merchants(id, name, address, coordinates, categories(id, label, icon))
    `)
    .eq('merchant_id', req.merchant.id)
    .order('end_date', { ascending: true, nullsFirst: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.json(data ?? [])
}

export async function createPromo(req, res) {
  const {
    title,
    description,
    promo_code,
    end_date,
    is_exclusive,
    status,
  } = req.body

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Le titre est requis' })
  }

  const normalizedStatus = sanitizeStatus(status)
  if (!normalizedStatus) {
    return res.status(400).json({ error: 'Statut invalide' })
  }

  const { data, error } = await supabase
    .from('promos')
    .insert({
      title: title.trim(),
      description: description || null,
      promo_code: promo_code || null,
      end_date: end_date || null,
      is_exclusive: Boolean(is_exclusive),
      merchant_id: req.merchant.id,
      status: normalizedStatus,
    })
    .select('id, title, description, promo_code, end_date, is_exclusive, merchant_id, status')
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(201).json(data)
}

export async function updatePromo(req, res) {
  const { id } = req.params
  const {
    title,
    description,
    promo_code,
    end_date,
    is_exclusive,
    status,
  } = req.body

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Le titre est requis' })
  }

  const normalizedStatus = sanitizeStatus(status)
  if (!normalizedStatus) {
    return res.status(400).json({ error: 'Statut invalide' })
  }

  const { data, error } = await supabase
    .from('promos')
    .update({
      title: title.trim(),
      description: description || null,
      promo_code: promo_code || null,
      end_date: end_date || null,
      is_exclusive: Boolean(is_exclusive),
      merchant_id: req.merchant.id,
      status: normalizedStatus,
    })
    .eq('id', id)
    .eq('merchant_id', req.merchant.id)
    .select('id, title, description, promo_code, end_date, is_exclusive, merchant_id, status')
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data) {
    return res.status(404).json({ error: 'Offre introuvable' })
  }

  return res.json(data)
}

export async function deletePromo(req, res) {
  const { id } = req.params
  const { error, count } = await supabase
    .from('promos')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('merchant_id', req.merchant.id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!count) {
    return res.status(404).json({ error: 'Offre introuvable' })
  }

  return res.json({ success: true })
}
