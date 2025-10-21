'use client'

import { Power } from 'lucide-react'

interface ToggleAlertButtonProps {
  alertId: string
  isActive: boolean
}

export default function ToggleAlertButton({ isActive }: ToggleAlertButtonProps) {
  const handleToggle = async () => {
    const newState = !isActive ? 'aktif' : 'devre dışı'
    alert(`🔔 Uyarı ${newState} edildi!`)
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title={isActive ? 'Devre Dışı Bırak' : 'Aktif Et'}
    >
      <Power className="w-4 h-4" />
    </button>
  )
}
