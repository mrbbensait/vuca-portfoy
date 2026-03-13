'use client'

import { useState, useEffect } from 'react'
import { X, EyeOff, ShieldAlert } from 'lucide-react'

interface UserNotification {
  id: string
  type: string
  title: string
  message: string
  metadata: Record<string, unknown>
  created_at: string
}

export default function UserNotificationsBanner() {
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user-notifications')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setNotifications(res.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const dismiss = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await fetch('/api/user-notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  if (loading || notifications.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${
            n.type === 'admin_portfolio_hidden'
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {n.type === 'admin_portfolio_hidden' ? (
              <ShieldAlert className="w-4 h-4 text-red-500" />
            ) : (
              <EyeOff className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${
              n.type === 'admin_portfolio_hidden' ? 'text-red-800' : 'text-amber-800'
            }`}>
              {n.title}
            </p>
            <p className={`text-xs mt-0.5 ${
              n.type === 'admin_portfolio_hidden' ? 'text-red-700' : 'text-amber-700'
            }`}>
              {n.message}
            </p>
          </div>
          <button
            onClick={() => dismiss(n.id)}
            className={`shrink-0 p-1 rounded transition-colors ${
              n.type === 'admin_portfolio_hidden'
                ? 'text-red-400 hover:text-red-600 hover:bg-red-100'
                : 'text-amber-400 hover:text-amber-600 hover:bg-amber-100'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
