import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { usePartner } from '../../context/usePartner'
import OfferFormModal from './OfferFormModal'

function statusBadgeClass(status) {
  if (status === 'active') return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
  if (status === 'expired') return 'border-amber-500/40 bg-amber-500/15 text-amber-300'
  return 'border-slate-500/40 bg-slate-500/10 text-slate-300'
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-FR')
}

export default function PartnerDashboard() {
  const { partner, getPartnerToken, loading } = usePartner()
  const [promos, setPromos] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [modalState, setModalState] = useState({ open: false, mode: 'create', promo: null })

  const api = useCallback(async (path, options = {}) => {
    const token = getPartnerToken()
    const res = await fetch(`/api/partner${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Erreur partenaire')
    return data
  }, [getPartnerToken])

  const loadPromos = useCallback(async () => {
    setError('')
    setFetching(true)
    try {
      const data = await api('/promos')
      setPromos(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }, [api])

  useEffect(() => {
    if (!loading && partner) {
      loadPromos()
    }
  }, [loading, partner, loadPromos])

  async function handleDelete(promoId) {
    setError('')
    try {
      await api(`/promos/${promoId}`, { method: 'DELETE' })
      setPromos((prev) => prev.filter((p) => p.id !== promoId))
    } catch (err) {
      setError(err.message)
    }
  }

  const stats = useMemo(() => {
    const activeCount = promos.filter((p) => p.status === 'active').length
    const expiredCount = promos.filter((p) => p.status === 'expired').length
    return { activeCount, expiredCount }
  }, [promos])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-insolit-pink border-t-transparent" />
      </div>
    )
  }

  if (!partner) {
    return <Navigate to="/partner/login" replace />
  }

  return (
    <div className="page-shell relative min-h-[calc(100vh-4rem)] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-2xl border border-dark-border bg-dark-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-theme-subtle">Espace partenaire</p>
              <h1 className="text-2xl font-bold text-insolit-pink">{partner.business_name}</h1>
            </div>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-dark-border bg-dark-card p-4">
            <p className="text-sm text-theme-muted">Offres actives</p>
            <p className="text-3xl font-bold text-emerald-300">{stats.activeCount}</p>
          </div>
          <div className="rounded-xl border border-dark-border bg-dark-card p-4">
            <p className="text-sm text-theme-muted">Offres expirees</p>
            <p className="text-3xl font-bold text-amber-300">{stats.expiredCount}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-dark-border bg-dark-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-theme">Mes offres</h2>
            <button
              type="button"
              onClick={() => setModalState({ open: true, mode: 'create', promo: null })}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-insolit-pink px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-insolit-pink-hover"
            >
              <Plus className="h-4 w-4" />
              Ajouter une offre
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {fetching ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-insolit-pink border-t-transparent" />
            </div>
          ) : promos.length === 0 ? (
            <p className="py-10 text-center text-theme-muted">Aucune offre pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-dark-border text-theme-muted">
                    <th className="px-3 py-2 font-medium">Titre</th>
                    <th className="px-3 py-2 font-medium">Statut</th>
                    <th className="px-3 py-2 font-medium">Fin</th>
                    <th className="px-3 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => (
                    <tr key={promo.id} className="border-b border-dark-border/60">
                      <td className="px-3 py-3 text-theme">{promo.title}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full border px-2 py-1 text-xs ${statusBadgeClass(promo.status)}`}>
                          {promo.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-theme-muted">{formatDate(promo.end_date)}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setModalState({ open: true, mode: 'edit', promo })}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dark-border px-3 py-1.5 text-xs text-theme-muted hover:border-insolit-pink/40 hover:text-insolit-pink"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(promo.id)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {modalState.open && (
        <OfferFormModal
          mode={modalState.mode}
          promo={modalState.promo}
          onClose={() => setModalState({ open: false, mode: 'create', promo: null })}
          onSaved={async () => {
            await loadPromos()
            setModalState({ open: false, mode: 'create', promo: null })
          }}
        />
      )}
    </div>
  )
}
