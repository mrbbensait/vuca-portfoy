'use client'

import { useState } from 'react'
import { Power } from 'lucide-react'

interface ToggleAlertButtonProps {
  alertId: string
  isActive: boolean
}

export default function ToggleAlertButton({ alertId, isActive }: ToggleAlertButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    // DEMO MODE: Sadece UI göster
    const newState = !isActive ? 'aktif' : 'devre dışı'
    alert(`🔔 Uyarı ${newState} edildi! (Demo Mode - Sayfa yenilenince geri gelecek)`)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50`}
      title={isActive ? 'Devre Dışı Bırak' : 'Aktif Et'}
    >
      <Power className="w-4 h-4" />
    </button>
  )
}
