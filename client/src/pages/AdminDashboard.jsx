import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  ShieldOff,
  Store,
  Tag,
  Ticket,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import CategoryGlyph from '../components/CategoryGlyph'

function useAdminApi() {
  const { getToken } = useAuth()
  async function api(path, options = {}) {
    const token = getToken()
    const res = await fetch(`/api/admin${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Erreur admin')
    return data
  }
  return { api }
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-theme-muted">{label}</span>
      {children}
    </label>
  )
}

function StatCard({ Icon, label, value }) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-card p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-insolit-pink/10 text-insolit-pink">
        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
      </div>
      <p className="mt-2 text-sm text-theme-muted">{label}</p>
      <p className="text-3xl font-bold text-theme">{value}</p>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-dark-border bg-dark-card p-5">
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
        {children}
      </div>
    </div>
  )
}

function ConfirmDelete({ onCancel, onConfirm }) {
  return (
    <div className="mt-2 flex items-center justify-between rounded-lg border border-red-500/40 bg-red-500/10 p-3">
      <span className="text-sm text-red-300">Confirmer la suppression ?</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-dark-border px-3 py-1.5 text-sm"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="cursor-pointer rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}

const tabConfig = [
  { key: 'stats', label: 'Stats', Icon: BarChart3 },
  { key: 'promos', label: 'Promos', Icon: Ticket },
  { key: 'merchants', label: 'Marchands', Icon: Store },
  { key: 'categories', label: 'Catégories', Icon: Tag },
  { key: 'users', label: 'Utilisateurs', Icon: Users },
]

const btnPrimary =
  'cursor-pointer rounded-lg bg-insolit-pink px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-insolit-pink-hover'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { api } = useAdminApi()
  const [tab, setTab] = useState('stats')
  const [subTab, setSubTab] = useState('users')
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [merchants, setMerchants] = useState([])
  const [promos, setPromos] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [confirmKey, setConfirmKey] = useState('')
  const [promoModal, setPromoModal] = useState(null)
  const [merchantModal, setMerchantModal] = useState(null)
  const [categoryModal, setCategoryModal] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => {
    if (user?.is_admin) loadAll()
  }, [user])

  async function loadAll() {
    setError('')
    try {
      const [s, u, m, p, r, c] = await Promise.all([
        api('/stats'),
        api('/users'),
        api('/merchants'),
        api('/promos'),
        api('/redemptions'),
        fetch('/api/categories').then((x) => x.json()),
      ])
      setStats(s)
      setUsers(u)
      setMerchants(m)
      setPromos(p)
      setRedemptions(r)
      setCategories(Array.isArray(c) ? c : [])
    } catch (e) {
      setError(e.message)
    }
  }

  async function savePromo() {
    try {
      await api(promoModal?.id ? `/promos/${promoModal.id}` : '/promos', {
        method: promoModal?.id ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })
      setPromoModal(null)
      await loadAll()
    } catch (e) {
      setError(e.message)
    }
  }

  async function saveMerchant() {
    try {
      await api(merchantModal?.id ? `/merchants/${merchantModal.id}` : '/merchants', {
        method: merchantModal?.id ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })
      setMerchantModal(null)
      await loadAll()
    } catch (e) {
      setError(e.message)
    }
  }

  async function saveCategory() {
    try {
      await api(categoryModal?.id ? `/categories/${categoryModal.id}` : '/categories', {
        method: categoryModal?.id ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })
      setCategoryModal(null)
      await loadAll()
    } catch (e) {
      setError(e.message)
    }
  }

  if (!user) return <Navigate to="/login" replace />

  if (!user.is_admin) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-insolit-pink/10 text-insolit-pink">
            <ShieldOff className="h-6 w-6" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-theme">Accès refusé</h1>
          <p className="text-theme-muted">Cette section est réservée aux administrateurs.</p>
        </div>
      </div>
    )
  }

  const tabBtn = (active) =>
    `inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
      active
        ? 'border-insolit-pink bg-insolit-pink/10 text-insolit-pink'
        : 'border-dark-border text-slate-600 dark:text-gray-300'
    }`

  return (
    <div className="page-shell mx-auto max-w-7xl px-4 py-6">
      <header className="sticky top-0 z-20 mb-6 border-b border-dark-border bg-dark-bg/90 backdrop-blur">
        <div className="flex items-center justify-between py-3">
          <h1 className="text-xl font-bold text-theme">
            <span className="text-insolit-pink">INSOLIT</span> / Admin
          </h1>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-dark-border px-3 py-2 text-sm text-theme-muted transition-colors hover:border-insolit-pink/40 hover:text-insolit-pink"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            App
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 pb-3">
          {tabConfig.map(({ key, label, Icon }) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={tabBtn(tab === key)}>
              <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
      )}

      {tab === 'stats' && (
        <section>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard Icon={Users} label="Utilisateurs" value={stats?.counts?.users ?? 0} />
            <StatCard Icon={Ticket} label="Promos" value={stats?.counts?.promos ?? 0} />
            <StatCard Icon={Store} label="Marchands" value={stats?.counts?.merchants ?? 0} />
            <StatCard Icon={CheckCircle} label="Utilisations" value={stats?.counts?.redemptions ?? 0} />
          </div>
          <div className="mt-6 rounded-xl border border-dark-border bg-dark-card p-4">
            <h2 className="mb-2 font-semibold text-theme">Dernières utilisations</h2>
            {(stats?.recentRedemptions || []).map((r) => (
              <div key={r.id} className="border-b border-dark-border/50 py-1 text-sm">
                {r.promos?.title || '-'} — {r.users?.full_name || r.users?.email || '-'} —{' '}
                {new Date(r.claimed_at).toLocaleString('fr-FR')}
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'promos' && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-theme-muted">{promos.length} promos</p>
            <button
              type="button"
              onClick={() => {
                setPromoModal({})
                setForm({
                  title: '',
                  description: '',
                  promo_code: '',
                  end_date: '',
                  merchant_id: '',
                  image_url: '',
                  is_exclusive: false,
                })
              }}
              className={btnPrimary}
            >
              Nouvelle promo
            </button>
          </div>
          {promos.map((p) => (
            <div key={p.id} className="mb-2 rounded-xl border border-dark-border bg-dark-card p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-theme-muted">{p.merchants?.name || 'Sans marchand'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {p.promo_code && (
                    <span className="rounded bg-insolit-pink/10 px-2 py-1 font-mono text-xs text-insolit-pink">
                      {p.promo_code}
                    </span>
                  )}
                  {p.end_date && (
                    <span className="text-xs text-theme-muted">
                      {new Date(p.end_date).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  {p.is_exclusive && (
                    <span className="rounded-full bg-insolit-pink px-2 py-1 text-xs font-bold text-white">
                      Exclusif
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPromoModal(p)
                      setForm({
                        title: p.title || '',
                        description: p.description || '',
                        promo_code: p.promo_code || '',
                        end_date: p.end_date || '',
                        merchant_id: p.merchant_id || '',
                        image_url: p.image_url || '',
                        is_exclusive: Boolean(p.is_exclusive),
                      })
                    }}
                    className="cursor-pointer rounded-lg border border-dark-border px-3 py-1.5 text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmKey(`promo:${p.id}`)}
                    className="cursor-pointer rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              {confirmKey === `promo:${p.id}` && (
                <ConfirmDelete
                  onCancel={() => setConfirmKey('')}
                  onConfirm={async () => {
                    await api(`/promos/${p.id}`, { method: 'DELETE' })
                    setConfirmKey('')
                    await loadAll()
                  }}
                />
              )}
            </div>
          ))}
        </section>
      )}

      {tab === 'merchants' && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-theme-muted">{merchants.length} marchands</p>
            <button
              type="button"
              onClick={() => {
                setMerchantModal({})
                setForm({ name: '', address: '', category_id: '', latitude: '', longitude: '' })
              }}
              className={btnPrimary}
            >
              Nouveau marchand
            </button>
          </div>
          {merchants.map((m) => (
            <div key={m.id} className="mb-2 rounded-xl border border-dark-border bg-dark-card p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-theme-muted">
                    {m.categories?.label && (
                      <span className="inline-flex items-center gap-1.5 text-insolit-pink">
                        <CategoryGlyph categoryLabel={m.categories.label} className="h-4 w-4" />
                        {m.categories.label}
                      </span>
                    )}
                    {!m.categories?.label && <span>Sans catégorie</span>}
                    <span>— {m.address}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMerchantModal(m)
                      setForm({
                        name: m.name || '',
                        address: m.address || '',
                        category_id: m.category_id || '',
                        latitude: '',
                        longitude: '',
                      })
                    }}
                    className="cursor-pointer rounded-lg border border-dark-border px-3 py-1.5 text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmKey(`merchant:${m.id}`)}
                    className="cursor-pointer rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              {confirmKey === `merchant:${m.id}` && (
                <ConfirmDelete
                  onCancel={() => setConfirmKey('')}
                  onConfirm={async () => {
                    await api(`/merchants/${m.id}`, { method: 'DELETE' })
                    setConfirmKey('')
                    await loadAll()
                  }}
                />
              )}
            </div>
          ))}
        </section>
      )}

      {tab === 'categories' && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-theme-muted">{categories.length} catégories</p>
            <button
              type="button"
              onClick={() => {
                setCategoryModal({})
                setForm({ label: '', icon: '' })
              }}
              className={btnPrimary}
            >
              Nouvelle catégorie
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="rounded-xl border border-dark-border bg-dark-card p-4">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-insolit-pink/10 text-insolit-pink">
                  <CategoryGlyph categoryLabel={c.label} className="h-6 w-6" strokeWidth={2} />
                </div>
                <p className="font-semibold">{c.label}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryModal(c)
                      setForm({ label: c.label || '', icon: c.icon || '' })
                    }}
                    className="cursor-pointer rounded-lg border border-dark-border px-3 py-1.5 text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmKey(`category:${c.id}`)}
                    className="cursor-pointer rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300"
                  >
                    Supprimer
                  </button>
                </div>
                {confirmKey === `category:${c.id}` && (
                  <ConfirmDelete
                    onCancel={() => setConfirmKey('')}
                    onConfirm={async () => {
                      await api(`/categories/${c.id}`, { method: 'DELETE' })
                      setConfirmKey('')
                      await loadAll()
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'users' && (
        <section>
          <div className="mb-4 flex gap-2">
            <button type="button" onClick={() => setSubTab('users')} className={tabBtn(subTab === 'users')}>
              Utilisateurs ({users.length})
            </button>
            <button type="button" onClick={() => setSubTab('uses')} className={tabBtn(subTab === 'uses')}>
              Utilisations ({redemptions.length})
            </button>
          </div>
          {subTab === 'users'
            ? users.map((u) => (
                <div key={u.id} className="mb-2 rounded-xl border border-dark-border bg-dark-card p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {u.full_name || '-'}{' '}
                        {u.is_admin && (
                          <span className="ml-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-theme-muted">
                        {u.email} — {u.city || '-'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {u.id !== user.id && (
                        <button
                          type="button"
                          onClick={async () => {
                            await api(`/users/${u.id}/admin`, {
                              method: 'PATCH',
                              body: JSON.stringify({ is_admin: !u.is_admin }),
                            })
                            await loadAll()
                          }}
                          className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm ${
                            u.is_admin
                              ? 'border-amber-400/40 bg-amber-500/10 text-amber-300'
                              : 'border-dark-border text-slate-600 dark:text-gray-300'
                          }`}
                        >
                          {u.is_admin ? 'Retirer admin' : 'Passer admin'}
                        </button>
                      )}
                      {u.id !== user.id && (
                        <button
                          type="button"
                          onClick={() => setConfirmKey(`user:${u.id}`)}
                          className="cursor-pointer rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                  {confirmKey === `user:${u.id}` && (
                    <ConfirmDelete
                      onCancel={() => setConfirmKey('')}
                      onConfirm={async () => {
                        await api(`/users/${u.id}`, { method: 'DELETE' })
                        setConfirmKey('')
                        await loadAll()
                      }}
                    />
                  )}
                </div>
              ))
            : redemptions.map((r) => (
                <div key={r.id} className="mb-2 rounded-xl border border-dark-border bg-dark-card p-4">
                  <p className="font-semibold">{r.promos?.title || '-'}</p>
                  <p className="text-sm text-theme-muted">
                    {r.users?.full_name || '-'} ({r.users?.email || '-'})
                  </p>
                  <p className="text-xs text-theme-subtle">{new Date(r.claimed_at).toLocaleString('fr-FR')}</p>
                </div>
              ))}
        </section>
      )}

      {promoModal !== null && (
        <Modal title={promoModal?.id ? 'Modifier promo' : 'Nouvelle promo'} onClose={() => setPromoModal(null)}>
          <div className="space-y-3">
            <Field label="Titre">
              <input
                value={form.title || ''}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input-theme"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description || ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input-theme min-h-[100px]"
              />
            </Field>
            <Field label="Code promo">
              <input
                value={form.promo_code || ''}
                onChange={(e) => setForm((f) => ({ ...f, promo_code: e.target.value }))}
                className="input-theme"
              />
            </Field>
            <Field label="Date de fin">
              <input
                type="date"
                value={form.end_date || ''}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="input-theme"
              />
            </Field>
            <Field label="Marchand">
              <select
                value={form.merchant_id || ''}
                onChange={(e) => setForm((f) => ({ ...f, merchant_id: e.target.value }))}
                className="input-theme"
              >
                <option value="">Aucun</option>
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Image URL">
              <input
                value={form.image_url || ''}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                className="input-theme"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-theme">
              <input
                type="checkbox"
                checked={Boolean(form.is_exclusive)}
                onChange={(e) => setForm((f) => ({ ...f, is_exclusive: e.target.checked }))}
              />
              Exclusif
            </label>
            <button type="button" onClick={savePromo} className={btnPrimary}>
              Enregistrer
            </button>
          </div>
        </Modal>
      )}

      {merchantModal !== null && (
        <Modal
          title={merchantModal?.id ? 'Modifier marchand' : 'Nouveau marchand'}
          onClose={() => setMerchantModal(null)}
        >
          <div className="space-y-3">
            <Field label="Nom">
              <input
                value={form.name || ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-theme"
              />
            </Field>
            <Field label="Adresse">
              <input
                value={form.address || ''}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="input-theme"
              />
            </Field>
            <Field label="Catégorie">
              <select
                value={form.category_id || ''}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="input-theme"
              >
                <option value="">Aucune</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <input
                  type="number"
                  value={form.latitude || ''}
                  onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                  className="input-theme"
                />
              </Field>
              <Field label="Longitude">
                <input
                  type="number"
                  value={form.longitude || ''}
                  onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                  className="input-theme"
                />
              </Field>
            </div>
            <button type="button" onClick={saveMerchant} className={btnPrimary}>
              Enregistrer
            </button>
          </div>
        </Modal>
      )}

      {categoryModal !== null && (
        <Modal
          title={categoryModal?.id ? 'Modifier catégorie' : 'Nouvelle catégorie'}
          onClose={() => setCategoryModal(null)}
        >
          <div className="space-y-3">
            <Field label="Libellé">
              <input
                value={form.label || ''}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                className="input-theme"
              />
            </Field>
            <Field label="Référence (optionnel)">
              <input
                value={form.icon || ''}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className="input-theme"
                placeholder="Texte court — l’app affiche une icône selon le libellé"
              />
            </Field>
            <p className="text-xs text-theme-muted">
              L’interface utilise des icônes vectorielles dérivées du libellé ; ce champ sert surtout au stockage
              legacy.
            </p>
            <button type="button" onClick={saveCategory} className={btnPrimary}>
              Enregistrer
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
