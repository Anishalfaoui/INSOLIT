import { useEffect, useState } from 'react'
import { usePartner } from '../../context/usePartner'

const initialState = {
  title: '',
  description: '',
  promo_code: '',
  end_date: '',
  is_exclusive: false,
}

export default function OfferFormModal({ mode, promo, onClose, onSaved }) {
  const { getPartnerToken } = usePartner()
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode === 'edit' && promo) {
      setForm({
        title: promo.title || '',
        description: promo.description || '',
        promo_code: promo.promo_code || '',
        end_date: promo.end_date ? promo.end_date.slice(0, 10) : '',
        is_exclusive: Boolean(promo.is_exclusive),
      })
      return
    }

    setForm(initialState)
  }, [mode, promo])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Le titre est requis')
      return
    }

    setLoading(true)
    try {
      const token = getPartnerToken()
      const path = mode === 'edit' ? `/api/partner/promos/${promo.id}` : '/api/partner/promos'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description || null,
          promo_code: form.promo_code || null,
          end_date: form.end_date || null,
          is_exclusive: Boolean(form.is_exclusive),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Impossible d enregistrer l offre')
      }

      onSaved(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'edit' ? 'Modifier une offre' : 'Ajouter une offre'

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-dark-border bg-dark-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-lg text-gray-300 hover:bg-dark-surface cursor-pointer"
            aria-label="Fermer"
          >
            X
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Titre</span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-purple"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-purple min-h-[100px]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Code promo</span>
            <input
              value={form.promo_code}
              onChange={(e) => setForm((f) => ({ ...f, promo_code: e.target.value }))}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-purple"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Date de fin</span>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-purple"
            />
          </label>

          <label className="mt-1 flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.is_exclusive}
              onChange={(e) => setForm((f) => ({ ...f, is_exclusive: e.target.checked }))}
            />
            Offre exclusive
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
