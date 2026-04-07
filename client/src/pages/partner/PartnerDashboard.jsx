import { useCallback, useEffect, useState } from 'react'
import { usePartner } from '../../context/usePartner'
import OfferFormModal from './OfferFormModal'

function getPromoStatus(endDate) {
  if (!endDate) return 'active'
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  return end < now ? 'expired' : 'active'
}

export default function PartnerDashboard() {
  const { partner, getPartnerToken } = usePartner()
  const [promos, setPromos] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [modalState, setModalState] = useState({ open: false, mode: 'create', promo: null })

  const loadPromos = useCallback(async () => {
    setError('')
    setFetching(true)

    try {
      const token = getPartnerToken()
      const res = await fetch('/api/partner/promos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erreur partenaire')
      }

      setPromos(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }, [getPartnerToken])

  useEffect(() => {
    if (partner) {
      loadPromos()
    }
  }, [partner, loadPromos])

  async function handleDelete(promoId) {
    setError('')

    try {
      const token = getPartnerToken()
      const res = await fetch(`/api/partner/promos/${promoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Suppression impossible')
      }

      setPromos((prev) => prev.filter((p) => p.id !== promoId))
    } catch (err) {
      setError(err.message)
    }
  }

  const activeCount = promos.filter((p) => getPromoStatus(p.end_date) === 'active').length
  const expiredCount = promos.filter((p) => getPromoStatus(p.end_date) === 'expired').length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <header className="mb-6 rounded-2xl border border-dark-border bg-dark-card p-5">
        <p className="text-sm text-gray-400">Espace partenaire</p>
        <h1 className="text-2xl font-bold text-neon-cyan">{partner?.business_name || partner?.name || 'Partner'}</h1>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-dark-border bg-dark-card p-4">
          <p className="text-sm text-gray-400">Offres actives</p>
          <p className="text-3xl font-bold text-emerald-300">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-dark-border bg-dark-card p-4">
          <p className="text-sm text-gray-400">Offres expirees</p>
          <p className="text-3xl font-bold text-amber-300">{expiredCount}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-dark-border bg-dark-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Mes offres</h2>
          <button
            type="button"
            onClick={() => setModalState({ open: true, mode: 'create', promo: null })}
            className="px-4 py-2 rounded-lg bg-neon-cyan/90 text-black font-semibold hover:bg-neon-cyan cursor-pointer"
          >
            Ajouter une offre
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {fetching ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
          </div>
        ) : promos.length === 0 ? (
          <p className="py-10 text-center text-gray-400">Aucune offre pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dark-border text-gray-400">
                  <th className="px-3 py-2 font-medium">Titre</th>
                  <th className="px-3 py-2 font-medium">Statut</th>
                  <th className="px-3 py-2 font-medium">Fin</th>
                  <th className="px-3 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => {
                  const status = getPromoStatus(promo.end_date)
                  return (
                    <tr key={promo.id} className="border-b border-dark-border/60">
                      <td className="px-3 py-3 text-white">{promo.title}</td>
                      <td className="px-3 py-3 text-gray-300">{status}</td>
                      <td className="px-3 py-3 text-gray-400">
                        {promo.end_date ? new Date(promo.end_date).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setModalState({ open: true, mode: 'edit', promo })}
                            className="rounded-lg border border-dark-border px-3 py-1.5 text-xs text-gray-300 hover:border-neon-cyan/40 hover:text-neon-cyan cursor-pointer"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(promo.id)}
                            className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300 cursor-pointer"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
