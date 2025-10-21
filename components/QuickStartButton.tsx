'use client'

import { useState } from 'react'
import { Rocket } from 'lucide-react'

interface QuickStartButtonProps {
  userId: string
  portfolioId?: string
  compact?: boolean
}

export default function QuickStartButton({ userId, portfolioId, compact = false }: QuickStartButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleQuickStart = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, portfolioId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Seed işlemi başarısız')
      }

      setSuccess(true)
      // Sayfayı yenile
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleQuickStart}
        disabled={loading || success}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Rocket className="w-4 h-4 mr-2" />
        {loading ? 'Yükleniyor...' : success ? 'Tamamlandı!' : 'Hızlı Başlangıç'}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleQuickStart}
        disabled={loading || success}
        className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
      >
        <Rocket className="w-5 h-5 mr-2" />
        {loading ? 'Yükleniyor...' : success ? 'Başarılı! Yönlendiriliyor...' : 'Hızlı Başlangıç Yap'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          Örnek veriler başarıyla yüklendi! Sayfa yenileniyor...
        </div>
      )}
    </div>
  )
}
