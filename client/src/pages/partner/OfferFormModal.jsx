import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { usePartner } from '../../context/usePartner'

const initialState = {
  title: '',
  description: '',
  promo_code: '',
  end_date: '',
  status: 'active',
  is_exclusive: false,
}

function parseLocalDateFromInput(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
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
        status: promo.status || 'active',
        is_exclusive: Boolean(promo.is_exclusive),
      })
      return
    }
    setForm(initialState)
  }, [mode, promo])

  const title = useMemo(() => (mode === 'edit' ? 'Modifier une offre' : 'Ajouter une offre'), [mode])

  function validate() {
    if (!form.title.trim()) return 'Le titre est requis'
    if (mode === 'create' && form.end_date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const end = parseLocalDateFromInput(form.end_date)
      if (!end) return 'Date de fin invalide'
      if (end <= today) return 'La date de fin doit etre dans le futur'
    }
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
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
          status: form.status || 'active',
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

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-dark-border bg-dark-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-theme">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-theme-muted transition-colors hover:bg-dark-surface hover:text-theme"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-theme-muted">Titre</span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input-theme"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-theme-muted">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input-theme min-h-[100px]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-theme-muted">Code promo</span>
            <input
              value={form.promo_code}
              onChange={(e) => setForm((f) => ({ ...f, promo_code: e.target.value }))}
              className="input-theme"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-theme-muted">Date de fin</span>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="input-theme"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-theme-muted">Statut</span>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="input-theme"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
              </select>
            </label>
          </div>

          <label className="mt-1 flex items-center gap-2 text-sm text-theme">
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
            className="w-full cursor-pointer rounded-lg bg-insolit-pink px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-insolit-pink-hover disabled:opacity-50"
          >
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
