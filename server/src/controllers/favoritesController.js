import { supabase } from '../lib/supabase.js'

export async function getFavorites(req, res) {
  const user_id = req.user?.id

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      promo_id,
      promos (
        id,
        title,
        description,
        promo_code,
        end_date,
        is_exclusive,
        merchants (
          id,
          name,
          address,
          category_id,
          categories ( label, icon )
        )
      )
    `)
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
}

export async function addFavorite(req, res) {
  const user_id = req.user?.id
  const { promo_id } = req.body

  if (!promo_id) {
    return res.status(400).json({ error: 'promo_id est requis' })
  }

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user_id)
    .eq('promo_id', promo_id)
    .single()

  if (existing) {
    return res.json({ message: 'Déjà en favori', favorite: existing })
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id, promo_id })
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({ message: 'Ajouté aux favoris', favorite: data })
}

export async function removeFavorite(req, res) {
  const user_id = req.user?.id
  const { promoId } = req.params

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user_id)
    .eq('promo_id', promoId)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ message: 'Retiré des favoris' })
}

export async function checkFavorite(req, res) {
  const user_id = req.user?.id
  const { promoId } = req.params

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user_id)
    .eq('promo_id', promoId)
    .single()

  res.json({ isFavorite: !!data })
}
