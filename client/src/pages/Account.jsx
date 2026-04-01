import { useEffect, useState } from 'react'
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-theme">Mon compte</h1>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg p-3 mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-dark-border bg-dark-surface shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Photo de profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm text-theme-muted mb-2">Photo de profil</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-600 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-dark-surface file:text-slate-800 dark:text-gray-300 dark:file:text-gray-200"
              />
              <p className="text-xs text-theme-subtle mt-2">PNG/JPG/WEBP - max 2MB</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-purple"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-theme-muted mb-1">Date de naissance</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="input-theme"
              />
            </div>

            <div>
              <label className="block text-sm text-theme-muted mb-1">Téléphone</label>
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
            <label className="block text-sm text-theme-muted mb-1">Ville</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="input-theme"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-white font-medium bg-linear-to-r from-neon-purple to-neon-cyan hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Enregistrement...' : 'Sauvegarder'}
            </button>

            <button
              type="button"
              onClick={signOut}
              className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium border border-dark-border bg-dark-surface text-slate-700 hover:border-neon-purple/50 transition-colors cursor-pointer dark:text-gray-200"
            >
              Déconnexion
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
