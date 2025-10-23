'use client'

import { useState } from 'react'
import { UsersPublic } from '@/lib/types/database.types'

interface ProfileSettingsProps {
  userId: string
  userProfile: UsersPublic | null
  userEmail?: string
}

export default function ProfileSettings({ userId, userProfile }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState(userProfile?.display_name || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          display_name: displayName,
        }),
      })

      if (!response.ok) {
        throw new Error('Profil güncellenemedi')
      }

      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setMessage({ type: 'error', text: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
          Ad Soyad
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Ahmet Yılmaz"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
      </button>
    </form>
  )
}
