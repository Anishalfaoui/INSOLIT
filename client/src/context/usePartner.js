import { useContext } from 'react'
import { PartnerAuthContext } from './PartnerAuthStore'

export function usePartner() {
  return useContext(PartnerAuthContext)
}
