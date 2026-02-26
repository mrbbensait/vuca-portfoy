'use client'

import { useEffect, useState } from 'react'
import { Cookie, X, Settings } from 'lucide-react'
import Link from 'next/link'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = async () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true }
    await savePreferences(allAccepted)
  }

  const handleAcceptNecessary = async () => {
    await savePreferences({ necessary: true, analytics: false, marketing: false })
  }

  const handleSaveCustom = async () => {
    await savePreferences(preferences)
  }

  const savePreferences = async (prefs: typeof preferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())

    try {
      await fetch('/api/user/consents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookie_consent: prefs }),
      })
    } catch (error) {
      console.error('Failed to save cookie preferences:', error)
    }

    setIsVisible(false)
    setShowSettings(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {!showSettings ? (
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Cookie className="w-6 h-6 text-blue-600" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  🍪 Çerez Kullanımı
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Portföy Röntgeni, size daha iyi hizmet verebilmek için çerezler kullanmaktadır. 
                  Zorunlu çerezler platformun çalışması için gereklidir. Diğer çerezleri tercihlerinize göre yönetebilirsiniz.{' '}
                  <Link href="/legal/cookies" className="text-blue-600 hover:text-blue-700 underline">
                    Çerez Politikası
                  </Link>
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Tümünü Kabul Et
                  </button>
                  <button
                    onClick={handleAcceptNecessary}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Sadece Gerekli Çerezler
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Özelleştir
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Çerez Tercihleri</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">Zorunlu Çerezler</h4>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Zorunlu</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Platformun çalışması için gerekli çerezlerdir. Kimlik doğrulama ve güvenlik için kullanılır.
                  </p>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Performans Çerezleri</h4>
                  <p className="text-sm text-gray-600">
                    Platform kullanımını analiz etmek ve iyileştirmek için kullanılır (ör. Vercel Analytics).
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.analytics ? 'bg-blue-600' : 'bg-gray-300'
                    } flex items-center ${preferences.analytics ? 'justify-end' : 'justify-start'} px-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>

              <div className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Pazarlama Çerezleri</h4>
                  <p className="text-sm text-gray-600">
                    Size özel içerik ve reklamlar göstermek için kullanılır (şu anda kullanılmamaktadır).
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.marketing ? 'bg-blue-600' : 'bg-gray-300'
                    } flex items-center ${preferences.marketing ? 'justify-end' : 'justify-start'} px-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveCustom}
                className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Tercihleri Kaydet
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
