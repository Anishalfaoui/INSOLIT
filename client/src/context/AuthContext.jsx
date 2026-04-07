import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})
const TOKEN_KEY = 'insolit_token'

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    restoreSession()
  }, [])

  function getToken() {
    return localStorage.getItem(TOKEN_KEY)
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
  }

  async function restoreSession() {
    const token = getToken()

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        clearToken()
        setUser(null)
      } else {
        const data = await res.json()
        setUser(data.user)
      }
    } catch {
      clearToken()
      setUser(null)
    }

    setLoading(false)
  }

  async function signUp(email, password, fullName, birthDate, phone, city) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        birth_date: birthDate,
        phone,
        city,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Erreur lors de l\'inscription')
    }

    localStorage.removeItem('insolit_partner_token')
    setToken(data.token)
    setUser(data.user)
    return data
  }

  async function signIn(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Identifiants invalides')
    }

    localStorage.removeItem('insolit_partner_token')
    setToken(data.token)
    setUser(data.user)
    return data
  }

  async function signOut() {
    clearToken()
    setUser(null)
  }

  async function updateProfile(payload) {
    const token = getToken()
    if (!token) {
      throw new Error('Session expirée, reconnecte-toi')
    }

    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Impossible de mettre à jour le profil')
    }

    setUser(data.user)
    return data.user
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, getToken, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
