import { useCallback, useEffect, useState } from 'react'
import { PartnerAuthContext } from './PartnerAuthStore'
const PARTNER_TOKEN_KEY = 'insolit_partner_token'

export function PartnerAuthProvider({ children }) {
  const initialToken = localStorage.getItem(PARTNER_TOKEN_KEY)
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(Boolean(initialToken))

  function getPartnerToken() {
    return localStorage.getItem(PARTNER_TOKEN_KEY)
  }

  function setPartnerToken(token) {
    localStorage.setItem(PARTNER_TOKEN_KEY, token)
  }

  function clearPartnerToken() {
    localStorage.removeItem(PARTNER_TOKEN_KEY)
  }

  const restoreSession = useCallback(async () => {
    if (!initialToken) return

    try {
      const res = await fetch('/api/partner/me', {
        headers: { Authorization: `Bearer ${initialToken}` },
      })

      if (!res.ok) {
        clearPartnerToken()
        setPartner(null)
      } else {
        const data = await res.json()
        setPartner(data.partner)
      }
    } catch {
      clearPartnerToken()
      setPartner(null)
    }
  }, [initialToken])

  useEffect(() => {
    let cancelled = false
    async function run() {
      await restoreSession()
      if (!cancelled) setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [restoreSession])

  async function partnerSignUp(email, password, businessName, address) {
    const res = await fetch('/api/partner/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        business_name: businessName,
        address,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Erreur lors de l inscription partenaire')
    }

    setPartnerToken(data.token)
    setPartner(data.partner)
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
    setPartner(data.partner)
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
