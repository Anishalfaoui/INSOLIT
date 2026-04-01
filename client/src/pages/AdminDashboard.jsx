import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
  return <label className="block"><span className="text-sm text-theme-muted block mb-1">{label}</span>{children}</label>
}
function StatCard({ icon, label, value }) {
  return <div className="rounded-xl border border-dark-border bg-dark-card p-4"><div>{icon}</div><p className="text-sm text-theme-muted mt-2">{label}</p><p className="text-3xl font-bold text-theme">{value}</p></div>
}
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-dark-border bg-dark-card p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-semibold text-theme">{title}</h3><button onClick={onClose} className="cursor-pointer text-theme-muted hover:text-theme">✕</button></div>
        {children}
      </div>
    </div>
  )
}
function ConfirmDelete({ onCancel, onConfirm }) {
  return <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 flex items-center justify-between"><span className="text-sm text-red-300">Confirmer la suppression ?</span><div className="flex gap-2"><button onClick={onCancel} className="px-3 py-1.5 border border-dark-border rounded-lg text-sm cursor-pointer">Annuler</button><button onClick={onConfirm} className="px-3 py-1.5 border border-red-500/40 rounded-lg text-sm text-red-300 cursor-pointer">Supprimer</button></div></div>
}

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

  useEffect(() => { if (user?.is_admin) loadAll() }, [user])

  async function loadAll() {
    setError('')
    try {
      const [s, u, m, p, r, c] = await Promise.all([api('/stats'), api('/users'), api('/merchants'), api('/promos'), api('/redemptions'), fetch('/api/categories').then((x) => x.json())])
      setStats(s); setUsers(u); setMerchants(m); setPromos(p); setRedemptions(r); setCategories(Array.isArray(c) ? c : [])
    } catch (e) { setError(e.message) }
  }

  async function savePromo() { try { await api(promoModal?.id ? `/promos/${promoModal.id}` : '/promos', { method: promoModal?.id ? 'PUT' : 'POST', body: JSON.stringify(form) }); setPromoModal(null); await loadAll() } catch (e) { setError(e.message) } }
  async function saveMerchant() { try { await api(merchantModal?.id ? `/merchants/${merchantModal.id}` : '/merchants', { method: merchantModal?.id ? 'PUT' : 'POST', body: JSON.stringify(form) }); setMerchantModal(null); await loadAll() } catch (e) { setError(e.message) } }
  async function saveCategory() { try { await api(categoryModal?.id ? `/categories/${categoryModal.id}` : '/categories', { method: categoryModal?.id ? 'PUT' : 'POST', body: JSON.stringify(form) }); setCategoryModal(null); await loadAll() } catch (e) { setError(e.message) } }

  if (!user) return <Navigate to="/login" replace />
  if (!user.is_admin) return <div className="max-w-xl mx-auto p-8"><div className="rounded-2xl border border-dark-border bg-dark-card p-6"><h1 className="text-2xl font-bold mb-2 text-theme">Accès refusé 🚫</h1><p className="text-theme-muted">Cette section est réservée aux administrateurs.</p></div></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="sticky top-0 z-20 bg-dark-bg/90 backdrop-blur border-b border-dark-border mb-6">
        <div className="py-3 flex items-center justify-between"><h1 className="text-xl font-bold text-theme">INSOLIT / Admin</h1><Link to="/" className="text-sm border border-dark-border rounded-lg px-3 py-2 text-theme-muted hover:text-neon-cyan">← App</Link></div>
        <div className="pb-3 flex flex-wrap gap-2">{['stats', 'promos', 'merchants', 'categories', 'users'].map((key) => <button key={key} onClick={() => setTab(key)} className={`px-3 py-2 rounded-lg border text-sm cursor-pointer ${tab === key ? 'border-neon-cyan text-neon-cyan' : 'border-dark-border text-slate-600 dark:text-gray-300'}`}>{key === 'stats' ? '📊 Stats' : key === 'promos' ? '🎟️ Promos' : key === 'merchants' ? '🏪 Marchands' : key === 'categories' ? '🏷️ Catégories' : '👥 Utilisateurs'}</button>)}</div>
      </header>
      {error && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      {tab === 'stats' && <section><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><StatCard icon="👥" label="Utilisateurs" value={stats?.counts?.users ?? 0} /><StatCard icon="🎟️" label="Promos" value={stats?.counts?.promos ?? 0} /><StatCard icon="🏪" label="Marchands" value={stats?.counts?.merchants ?? 0} /><StatCard icon="✅" label="Utilisations" value={stats?.counts?.redemptions ?? 0} /></div><div className="mt-6 rounded-xl border border-dark-border bg-dark-card p-4"><h2 className="font-semibold mb-2 text-theme">Dernières utilisations</h2>{(stats?.recentRedemptions || []).map((r) => <div key={r.id} className="text-sm py-1 border-b border-dark-border/50">{r.promos?.title || '-'} — {r.users?.full_name || r.users?.email || '-'} — {new Date(r.claimed_at).toLocaleString('fr-FR')}</div>)}</div></section>}

      {tab === 'promos' && <section><div className="mb-4 flex items-center justify-between"><p className="text-theme-muted">{promos.length} promos</p><button onClick={() => { setPromoModal({}); setForm({ title: '', description: '', promo_code: '', end_date: '', merchant_id: '', image_url: '', is_exclusive: false }) }} className="px-4 py-2 rounded-lg bg-linear-to-r from-neon-purple to-neon-cyan text-white cursor-pointer">Nouvelle promo</button></div>{promos.map((p) => <div key={p.id} className="rounded-xl border border-dark-border bg-dark-card p-4 mb-2"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold">{p.title}</p><p className="text-sm text-theme-muted">{p.merchants?.name || 'Sans marchand'}</p></div><div className="flex items-center gap-2">{p.promo_code && <span className="text-xs font-mono text-neon-cyan bg-neon-cyan/10 px-2 py-1 rounded">{p.promo_code}</span>}{p.end_date && <span className="text-xs text-theme-muted">{new Date(p.end_date).toLocaleDateString('fr-FR')}</span>}{p.is_exclusive && <span className="text-xs bg-linear-to-r from-neon-purple to-neon-cyan text-white px-2 py-1 rounded-full">Exclusif</span>}<button onClick={() => { setPromoModal(p); setForm({ title: p.title || '', description: p.description || '', promo_code: p.promo_code || '', end_date: p.end_date || '', merchant_id: p.merchant_id || '', image_url: p.image_url || '', is_exclusive: Boolean(p.is_exclusive) }) }} className="px-3 py-1.5 border border-dark-border rounded-lg text-sm cursor-pointer">Modifier</button><button onClick={() => setConfirmKey(`promo:${p.id}`)} className="px-3 py-1.5 border border-red-500/40 rounded-lg text-sm text-red-300 cursor-pointer">Supprimer</button></div></div>{confirmKey === `promo:${p.id}` && <ConfirmDelete onCancel={() => setConfirmKey('')} onConfirm={async () => { await api(`/promos/${p.id}`, { method: 'DELETE' }); setConfirmKey(''); await loadAll() }} />}</div>)}</section>}

      {tab === 'merchants' && <section><div className="mb-4 flex items-center justify-between"><p className="text-theme-muted">{merchants.length} marchands</p><button onClick={() => { setMerchantModal({}); setForm({ name: '', address: '', category_id: '', latitude: '', longitude: '' }) }} className="px-4 py-2 rounded-lg bg-linear-to-r from-neon-purple to-neon-cyan text-white cursor-pointer">Nouveau marchand</button></div>{merchants.map((m) => <div key={m.id} className="rounded-xl border border-dark-border bg-dark-card p-4 mb-2"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold">{m.name}</p><p className="text-sm text-theme-muted">{m.categories?.icon ? `${m.categories.icon} ` : ''}{m.categories?.label || 'Sans catégorie'} — {m.address}</p></div><div className="flex gap-2"><button onClick={() => { setMerchantModal(m); setForm({ name: m.name || '', address: m.address || '', category_id: m.category_id || '', latitude: '', longitude: '' }) }} className="px-3 py-1.5 border border-dark-border rounded-lg text-sm cursor-pointer">Modifier</button><button onClick={() => setConfirmKey(`merchant:${m.id}`)} className="px-3 py-1.5 border border-red-500/40 rounded-lg text-sm text-red-300 cursor-pointer">Supprimer</button></div></div>{confirmKey === `merchant:${m.id}` && <ConfirmDelete onCancel={() => setConfirmKey('')} onConfirm={async () => { await api(`/merchants/${m.id}`, { method: 'DELETE' }); setConfirmKey(''); await loadAll() }} />}</div>)}</section>}

      {tab === 'categories' && <section><div className="mb-4 flex items-center justify-between"><p className="text-theme-muted">{categories.length} catégories</p><button onClick={() => { setCategoryModal({}); setForm({ label: '', icon: '' }) }} className="px-4 py-2 rounded-lg bg-linear-to-r from-neon-purple to-neon-cyan text-white cursor-pointer">Nouvelle catégorie</button></div><div className="grid grid-cols-2 gap-3">{categories.map((c) => <div key={c.id} className="rounded-xl border border-dark-border bg-dark-card p-4"><p className="text-3xl">{c.icon || '🏷️'}</p><p className="font-semibold">{c.label}</p><div className="mt-3 flex gap-2"><button onClick={() => { setCategoryModal(c); setForm({ label: c.label || '', icon: c.icon || '' }) }} className="px-3 py-1.5 border border-dark-border rounded-lg text-sm cursor-pointer">Modifier</button><button onClick={() => setConfirmKey(`category:${c.id}`)} className="px-3 py-1.5 border border-red-500/40 rounded-lg text-sm text-red-300 cursor-pointer">Supprimer</button></div>{confirmKey === `category:${c.id}` && <ConfirmDelete onCancel={() => setConfirmKey('')} onConfirm={async () => { await api(`/categories/${c.id}`, { method: 'DELETE' }); setConfirmKey(''); await loadAll() }} />}</div>)}</div></section>}

      {tab === 'users' && <section><div className="mb-4 flex gap-2"><button onClick={() => setSubTab('users')} className={`px-3 py-2 rounded-lg border text-sm cursor-pointer ${subTab === 'users' ? 'border-neon-cyan text-neon-cyan' : 'border-dark-border text-slate-600 dark:text-gray-300'}`}>Utilisateurs ({users.length})</button><button onClick={() => setSubTab('uses')} className={`px-3 py-2 rounded-lg border text-sm cursor-pointer ${subTab === 'uses' ? 'border-neon-cyan text-neon-cyan' : 'border-dark-border text-slate-600 dark:text-gray-300'}`}>Utilisations ({redemptions.length})</button></div>{subTab === 'users' ? users.map((u) => <div key={u.id} className="rounded-xl border border-dark-border bg-dark-card p-4 mb-2"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold">{u.full_name || '-'} {u.is_admin && <span className="text-xs px-2 py-1 rounded-full border border-amber-400/40 text-amber-300 bg-amber-500/10">Admin</span>}</p><p className="text-sm text-theme-muted">{u.email} — {u.city || '-'}</p></div><div className="flex gap-2">{u.id !== user.id && <button onClick={async () => { await api(`/users/${u.id}/admin`, { method: 'PATCH', body: JSON.stringify({ is_admin: !u.is_admin }) }); await loadAll() }} className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${u.is_admin ? 'border-amber-400/40 text-amber-300 bg-amber-500/10' : 'border-dark-border text-slate-600 dark:text-gray-300'}`}>{u.is_admin ? 'Retirer admin' : 'Passer admin'}</button>}{u.id !== user.id && <button onClick={() => setConfirmKey(`user:${u.id}`)} className="px-3 py-1.5 border border-red-500/40 rounded-lg text-sm text-red-300 cursor-pointer">Supprimer</button>}</div></div>{confirmKey === `user:${u.id}` && <ConfirmDelete onCancel={() => setConfirmKey('')} onConfirm={async () => { await api(`/users/${u.id}`, { method: 'DELETE' }); setConfirmKey(''); await loadAll() }} />}</div>) : redemptions.map((r) => <div key={r.id} className="rounded-xl border border-dark-border bg-dark-card p-4 mb-2"><p className="font-semibold">{r.promos?.title || '-'}</p><p className="text-sm text-theme-muted">{r.users?.full_name || '-'} ({r.users?.email || '-'})</p><p className="text-xs text-theme-subtle">{new Date(r.claimed_at).toLocaleString('fr-FR')}</p></div>)}</section>}

      {promoModal !== null && <Modal title={promoModal?.id ? 'Modifier promo' : 'Nouvelle promo'} onClose={() => setPromoModal(null)}><div className="space-y-3"><Field label="Titre"><input value={form.title || ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-theme" /></Field><Field label="Description"><textarea value={form.description || ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-theme min-h-[100px]" /></Field><Field label="Code promo"><input value={form.promo_code || ''} onChange={(e) => setForm((f) => ({ ...f, promo_code: e.target.value }))} className="input-theme" /></Field><Field label="Date de fin"><input type="date" value={form.end_date || ''} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} className="input-theme" /></Field><Field label="Marchand"><select value={form.merchant_id || ''} onChange={(e) => setForm((f) => ({ ...f, merchant_id: e.target.value }))} className="input-theme"><option value="">Aucun</option>{merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field><Field label="Image URL"><input value={form.image_url || ''} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} className="input-theme" /></Field><label className="flex items-center gap-2 text-sm text-theme"><input type="checkbox" checked={Boolean(form.is_exclusive)} onChange={(e) => setForm((f) => ({ ...f, is_exclusive: e.target.checked }))} /> Exclusif</label><button onClick={savePromo} className="px-4 py-2 rounded-lg bg-linear-to-r from-neon-purple to-neon-cyan text-white cursor-pointer">Enregistrer</button></div></Modal>}
      {merchantModal !== null && <Modal title={merchantModal?.id ? 'Modifier marchand' : 'Nouveau marchand'} onClose={() => setMerchantModal(null)}><div className="space-y-3"><Field label="Nom"><input value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-theme" /></Field><Field label="Adresse"><input value={form.address || ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="input-theme" /></Field><Field label="Catégorie"><select value={form.category_id || ''} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className="input-theme"><option value="">Aucune</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></Field><div className="grid grid-cols-2 gap-3"><Field label="Latitude"><input type="number" value={form.latitude || ''} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} className="input-theme" /></Field><Field label="Longitude"><input type="number" value={form.longitude || ''} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} className="input-theme" /></Field></div><button onClick={saveMerchant} className="px-4 py-2 rounded-lg bg-linear-to-r from-neon-purple to-neon-cyan text-white cursor-pointer">Enregistrer</button></div></Modal>}
      {categoryModal !== null && <Modal title={categoryModal?.id ? 'Modifier catégorie' : 'Nouvelle catégorie'} onClose={() => setCategoryModal(null)}><div className="space-y-3"><Field label="Label"><input value={form.label || ''} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="input-theme" /></Field><Field label="Icône"><input maxLength={4} value={form.icon || ''} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="input-theme" /></Field><button onClick={saveCategory} className="px-4 py-2 rounded-lg bg-linear-to-r from-neon-purple to-neon-cyan text-white cursor-pointer">Enregistrer</button></div></Modal>}
    </div>
  )
}
