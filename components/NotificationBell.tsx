'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, TrendingUp, TrendingDown, X, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
  id: string
  portfolio_id: string
  actor_id: string
  type: 'NEW_TRADE' | 'HOLDING_CLOSED' | 'PORTFOLIO_UPDATED'
  title: string
  metadata: {
    symbol?: string
    side?: string
    quantity?: number
    price?: number
    asset_type?: string
  }
  created_at: string
  portfolio_name: string
  portfolio_slug: string | null
  actor_name: string
  actor_avatar: string | null
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Okunmamış sayısını çek
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count')
      const data = await res.json()
      if (data.success) {
        setUnreadCount(data.count)
      }
    } catch {
      // Sessizce yut
    }
  }, [])

  // Aktiviteleri çek
  const fetchActivities = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=10')
      const data = await res.json()
      if (data.success) {
        setActivities(data.data)
      }
    } catch {
      // Sessizce yut
    } finally {
      setLoading(false)
    }
  }

  // Tümünü okundu işaretle
  const markAllSeen = async () => {
    try {
      await fetch('/api/notifications/mark-seen', { method: 'PATCH' })
      setUnreadCount(0)
    } catch {
      // Sessizce yut
    }
  }

  // Sayfa yüklendiğinde ve 60 saniyede bir okunmamış sayısını çek
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Sayfa odağına geldiğinde de kontrol et
  useEffect(() => {
    const handleFocus = () => fetchUnreadCount()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchUnreadCount])

  // Dropdown dışına tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleToggle = () => {
    if (!isOpen) {
      fetchActivities()
    }
    setIsOpen(!isOpen)
  }

  const handleMarkSeen = () => {
    markAllSeen()
    setIsOpen(false)
  }

  const formatTime = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHour = Math.floor(diffMs / 3600000)
    const diffDay = Math.floor(diffMs / 86400000)

    if (diffMin < 1) return 'Az önce'
    if (diffMin < 60) return `${diffMin} dk önce`
    if (diffHour < 24) return `${diffHour} saat önce`
    if (diffDay < 7) return `${diffDay} gün önce`
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  const getActivityIcon = (metadata: ActivityItem['metadata']) => {
    if (metadata.side === 'BUY') {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />
  }

  const getAssetLabel = (assetType?: string) => {
    const labels: Record<string, string> = {
      TR_STOCK: 'TR Hisse',
      US_STOCK: 'US Hisse',
      CRYPTO: 'Kripto',
      CASH: 'Nakit',
    }
    return labels[assetType || ''] || assetType || ''
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className={`relative inline-flex items-center px-2.5 py-2 text-sm font-medium rounded-md transition-colors ${
          isOpen
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
        title="Bildirimler"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4.5 h-4.5 px-1 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none min-w-[18px]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Bildirimler</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Henüz bildirim yok</p>
                <p className="text-xs text-gray-400 mt-1">
                  Takip ettiğiniz portföylerdeki işlemler burada görünecek
                </p>
              </div>
            ) : (
              activities.map((activity) => (
                <Link
                  key={activity.id}
                  href={activity.portfolio_slug ? `/p/${activity.portfolio_slug}` : '#'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  {/* Icon */}
                  <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {getActivityIcon(activity.metadata)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.actor_name}</span>
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.title}
                      <span className="text-gray-400"> · </span>
                      <span className="text-xs text-gray-400">
                        {getAssetLabel(activity.metadata.asset_type)}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-blue-500 font-medium truncate">
                        {activity.portfolio_name}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        {formatTime(activity.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ExternalLink className="w-3.5 h-3.5 text-gray-300 mt-1 flex-shrink-0" />
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          {activities.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleMarkSeen}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Tümünü gördüm
                </button>
                <Link
                  href="/explore"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                >
                  Keşfet →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
