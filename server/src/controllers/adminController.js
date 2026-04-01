import { supabase } from '../lib/supabase.js'

function toPoint(longitude, latitude) {
  if (longitude == null || latitude == null || longitude === '' || latitude === '') return null
  return `(${longitude},${latitude})`
}

export async function getStats(_req, res) {
  const [usersQ, promosQ, merchantsQ, redemptionsQ, recentQ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('promos').select('*', { count: 'exact', head: true }),
    supabase.from('merchants').select('*', { count: 'exact', head: true }),
    supabase.from('redemptions').select('*', { count: 'exact', head: true }),
    supabase
      .from('redemptions')
      .select('id, claimed_at, users(full_name, email), promos(title)')
      .order('claimed_at', { ascending: false })
      .limit(5),
  ])

  const error = usersQ.error || promosQ.error || merchantsQ.error || redemptionsQ.error || recentQ.error
  if (error) return res.status(500).json({ error: error.message })

  return res.json({
    counts: {
      users: usersQ.count ?? 0,
      promos: promosQ.count ?? 0,
      merchants: merchantsQ.count ?? 0,
      redemptions: redemptionsQ.count ?? 0,
    },
    recentRedemptions: recentQ.data ?? [],
  })
}

export async function getUsers(_req, res) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, city, avatar_url, birth_date, phone, created_at, is_admin')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data ?? [])
}

export async function toggleAdmin(req, res) {
  const { id } = req.params
  const { is_admin } = req.body
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Action impossible sur ton propre compte' })
  }
  const { data, error } = await supabase
    .from('users')
    .update({ is_admin: Boolean(is_admin) })
    .eq('id', id)
    .select('id, is_admin')
    .maybeSingle()
  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Utilisateur introuvable' })
  return res.json(data)
}

export async function deleteUser(req, res) {
  const { id } = req.params
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Action impossible sur ton propre compte' })
  }
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ success: true })
}

export async function createCategory(req, res) {
  const { label, icon } = req.body
  if (!label) return res.status(400).json({ error: 'Le label est requis' })
  const { data, error } = await supabase.from('categories').insert({ label, icon: icon || null }).select('*').single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

export async function updateCategory(req, res) {
  const { id } = req.params
  const { label, icon } = req.body
  if (!label) return res.status(400).json({ error: 'Le label est requis' })
  const { data, error } = await supabase.from('categories').update({ label, icon: icon || null }).eq('id', id).select('*').maybeSingle()
  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Catégorie introuvable' })
  return res.json(data)
}

export async function deleteCategory(req, res) {
  const { id } = req.params
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ success: true })
}

export async function getMerchants(_req, res) {
  const { data, error } = await supabase
    .from('merchants')
    .select('id, name, address, coordinates, category_id, categories(label, icon)')
    .order('name', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data ?? [])
}

export async function createMerchant(req, res) {
  const { name, address, category_id, latitude, longitude } = req.body
  if (!name || !address) return res.status(400).json({ error: 'Nom et adresse requis' })
  const { data, error } = await supabase
    .from('merchants')
    .insert({
      name,
      address,
      category_id: category_id || null,
      coordinates: toPoint(longitude, latitude),
    })
    .select('*')
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

export async function updateMerchant(req, res) {
  const { id } = req.params
  const { name, address, category_id, latitude, longitude } = req.body
  if (!name || !address) return res.status(400).json({ error: 'Nom et adresse requis' })
  const { data, error } = await supabase
    .from('merchants')
    .update({
      name,
      address,
      category_id: category_id || null,
      coordinates: toPoint(longitude, latitude),
    })
    .eq('id', id)
    .select('*')
    .maybeSingle()
  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Marchand introuvable' })
  return res.json(data)
}

export async function deleteMerchant(req, res) {
  const { id } = req.params
  const { error } = await supabase.from('merchants').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ success: true })
}

export async function getAdminPromos(_req, res) {
  const { data, error } = await supabase
    .from('promos')
    .select('id, title, description, promo_code, end_date, is_exclusive, merchant_id, merchants(id, name, categories(label, icon))')
    .order('end_date', { ascending: true, nullsFirst: false })
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data ?? [])
}

export async function createPromo(req, res) {
  const { title, description, promo_code, end_date, merchant_id, is_exclusive } = req.body
  if (!title) return res.status(400).json({ error: 'Le titre est requis' })
  const { data, error } = await supabase
    .from('promos')
    .insert({
      title,
      description: description || null,
      promo_code: promo_code || null,
      end_date: end_date || null,
      merchant_id: merchant_id || null,
      is_exclusive: Boolean(is_exclusive),
    })
    .select('*')
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

export async function updatePromo(req, res) {
  const { id } = req.params
  const { title, description, promo_code, end_date, merchant_id, is_exclusive } = req.body
  if (!title) return res.status(400).json({ error: 'Le titre est requis' })
  const { data, error } = await supabase
    .from('promos')
    .update({
      title,
      description: description || null,
      promo_code: promo_code || null,
      end_date: end_date || null,
      merchant_id: merchant_id || null,
      is_exclusive: Boolean(is_exclusive),
    })
    .eq('id', id)
    .select('*')
    .maybeSingle()
  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Promo introuvable' })
  return res.json(data)
}

export async function deletePromo(req, res) {
  const { id } = req.params
  const { error } = await supabase.from('promos').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ success: true })
}

export async function getRedemptions(_req, res) {
  const { data, error } = await supabase
    .from('redemptions')
    .select('id, claimed_at, users(full_name, email), promos(title)')
    .order('claimed_at', { ascending: false })
    .limit(200)
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data ?? [])
}
