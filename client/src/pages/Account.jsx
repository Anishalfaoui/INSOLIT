import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Account() {
  const { user, updateProfile, signOut } = useAuth()
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setFullName(user.full_name || '')
    setBirthDate(user.birth_date || '')
    setPhone(user.phone || '')
    setCity(user.city || '')
    setAvatarUrl(user.avatar_url || '')
  }, [user])

  async function handleFileChange(e) {
    setError('')
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image trop lourde (max 2MB)')
      return
    }

    try {
      const dataUrl = await toDataUrl(file)
      setAvatarUrl(dataUrl)
    } catch {
      setError('Impossible de lire cette image')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      await updateProfile({
        full_name: fullName,
        birth_date: birthDate,
        phone,
        city,
        avatar_url: avatarUrl || null,
      })
      setSuccess('Profil mis à jour')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-shell min-h-[calc(100dvh-5rem)] md:min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-bold text-theme">
          <span className="text-insolit-pink">Mon</span> compte
        </h1>
        <p className="mb-6 text-sm text-theme-muted">Photo, coordonnées et préférences</p>

        <div className="rounded-2xl border border-dark-border bg-dark-card p-6 sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dark-border bg-dark-surface">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Photo de profil" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-10 w-10 text-insolit-pink/60" strokeWidth={1.5} aria-hidden />
                )}
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm text-theme-muted">Photo de profil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-insolit-pink/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-insolit-pink dark:text-gray-300"
                />
                <p className="mt-2 text-xs text-theme-subtle">PNG / JPG / WEBP — max 2 Mo</p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-theme-muted">Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="input-theme"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-theme-muted">Date de naissance</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="input-theme"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-theme-muted">Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="input-theme"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-theme-muted">Ville</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="input-theme"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="w-full cursor-pointer rounded-full bg-insolit-pink px-6 py-3 text-sm font-semibold text-white transition-opacity hover:bg-insolit-pink-hover disabled:opacity-60 sm:w-auto"
              >
                {saving ? 'Enregistrement…' : 'Sauvegarder'}
              </button>

              <button
                type="button"
                onClick={signOut}
                className="w-full cursor-pointer rounded-full border border-dark-border bg-dark-surface px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-insolit-pink/40 dark:text-gray-200"
              >
                Déconnexion
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
