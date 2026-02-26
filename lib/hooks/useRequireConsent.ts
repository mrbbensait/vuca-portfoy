import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserConsents {
  spk_disclaimer_accepted: boolean
  spk_risk_disclosure_accepted: boolean
  kvkk_accepted: boolean
  terms_accepted: boolean
  cookie_consent: {
    necessary: boolean
    analytics: boolean
    marketing: boolean
  }
}

export function useRequireConsent() {
  const [loading, setLoading] = useState(true)
  const [consents, setConsents] = useState<UserConsents | null>(null)
  const [needsConsent, setNeedsConsent] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkConsents()
  }, [])

  async function checkConsents() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/user/consents')
      const data = await response.json()

      if (data.consents) {
        setConsents(data.consents)
        
        const allAccepted = 
          data.consents.spk_disclaimer_accepted &&
          data.consents.spk_risk_disclosure_accepted &&
          data.consents.kvkk_accepted &&
          data.consents.terms_accepted

        setNeedsConsent(!allAccepted)
      } else {
        setNeedsConsent(true)
      }
    } catch (error) {
      console.error('Error checking consents:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveConsents(consentData: Partial<UserConsents>) {
    try {
      const response = await fetch('/api/user/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData),
      })

      const data = await response.json()

      if (data.success) {
        setConsents(data.consents)
        setNeedsConsent(false)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Error saving consents:', error)
      return { success: false, error: 'Failed to save consents' }
    }
  }

  return {
    loading,
    consents,
    needsConsent,
    saveConsents,
    refresh: checkConsents,
  }
}
