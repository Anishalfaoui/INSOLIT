import { supabase } from '../lib/supabase.js'

export async function requireAdmin(req, res, next) {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ error: 'Authentification requise' })
  }

  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data?.is_admin) {
    return res.status(403).json({ error: 'Accès administrateur requis' })
  }

  next()
}
