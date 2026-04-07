import { useCallback, useEffect, useState } from 'react'
import { PartnerAuthContext } from './PartnerAuthStore'

const PARTNER_TOKEN_KEY = 'insolit_partner_token'

export function PartnerAuthProvider({ children }) {
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)

  function getPartnerToken() {
    return localStorage.getItem(PARTNER_TOKEN_KEY)
  }

  function setPartnerToken(token) {
    localStorage.removeItem('insolit_token')
    localStorage.setItem(PARTNER_TOKEN_KEY, token)
  }

  function clearPartnerToken() {
    localStorage.removeItem(PARTNER_TOKEN_KEY)
  }

  const restoreSession = useCallback(async () => {
    const token = getPartnerToken()
    if (!token) {
      setPartner(null)
      return
    }

    try {
      const res = await fetch('/api/partner/me', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        clearPartnerToken()
        setPartner(null)
      } else {
        const data = await res.json()
        setPartner(data.partner || null)
      }
    } catch {
      clearPartnerToken()
      setPartner(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function run() {
      await restoreSession()
      if (!cancelled) {
        setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [restoreSession])

  async function partnerSignUp(email, password, businessName, address, categoryId, latitude, longitude) {
    const res = await fetch('/api/partner/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        business_name: businessName,
        address,
        category_id: categoryId || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Erreur lors de l inscription partenaire')
    }

    setPartnerToken(data.token)
    setPartner(data.partner || null)
    return data
  }

  async function partnerSignIn(email, password) {
    const res = await fetch('/api/partner/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Identifiants invalides')
    }

    setPartnerToken(data.token)
    setPartner(data.partner || null)
    return data
  }

  async function partnerSignOut() {
    clearPartnerToken()
    setPartner(null)
  }

  return (
    <PartnerAuthContext.Provider
      value={{
        partner,
        loading,
        partnerSignUp,
        partnerSignIn,
        partnerSignOut,
        getPartnerToken,
      }}
    >
      {children}
    </PartnerAuthContext.Provider>
  )
}
