import { supabase } from '../lib/supabase.js'

export async function getMyPromos(req, res) {
  const { data, error } = await supabase
    .from('promos')
    .select('id, title, description, promo_code, end_date, is_exclusive, merchant_id, merchants(name, address, coordinates, categories(label, icon))')
    .eq('merchant_id', req.merchant.id)
    .order('end_date', { ascending: true, nullsFirst: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.json(data ?? [])
}

export async function createPromo(req, res) {
  const { title, description, promo_code, end_date, is_exclusive } = req.body

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Le titre est requis' })
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
    })
    .select('id, title, description, promo_code, end_date, is_exclusive, merchant_id')
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(201).json(data)
}

export async function updatePromo(req, res) {
  const { id } = req.params
  const { title, description, promo_code, end_date, is_exclusive } = req.body

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Le titre est requis' })
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
    })
    .eq('id', id)
    .eq('merchant_id', req.merchant.id)
    .select('id, title, description, promo_code, end_date, is_exclusive, merchant_id')
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
