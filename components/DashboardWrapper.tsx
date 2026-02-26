'use client'

import { useEffect, useState } from 'react'
import { useRequireConsent } from '@/lib/hooks/useRequireConsent'
import ConsentModal from './legal/ConsentModal'
import Dashboard from './Dashboard'

interface DashboardWrapperProps {
  userId: string
  displayName: string
}

export default function DashboardWrapper({ userId, displayName }: DashboardWrapperProps) {
  const { loading, needsConsent, saveConsents } = useRequireConsent()
  const [showConsentModal, setShowConsentModal] = useState(false)

  useEffect(() => {
    if (!loading && needsConsent) {
      setShowConsentModal(true)
    }
  }, [loading, needsConsent])

  const handleConsentsAccepted = async (consents: {
    spk_disclaimer_accepted: boolean
    spk_risk_disclosure_accepted: boolean
    kvkk_accepted: boolean
    terms_accepted: boolean
  }) => {
    const result = await saveConsents(consents)
    
    if (result.success) {
      setShowConsentModal(false)
    } else {
      alert('Onaylar kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Dashboard userId={userId} displayName={displayName} />
      <ConsentModal 
        isOpen={showConsentModal} 
        onConsentsAccepted={handleConsentsAccepted}
      />
    </>
  )
}
