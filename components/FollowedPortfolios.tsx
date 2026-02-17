'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, ExternalLink, TrendingUp, TrendingDown, Compass, Activity } from 'lucide-react'

interface FollowedPortfolio {
  portfolio_id: string
  portfolio_name: string
  portfolio_slug: string | null
  owner_name: string
}

interface RecentActivity {
  id: string
  title: string
  type: string
  created_at: string
  metadata: { side?: string; symbol?: string }
  portfolio_name: string
  portfolio_slug: string | null
}

export default function FollowedPortfolios() {
  const [portfolios, setPortfolios] = useState<FollowedPortfolio[]>([])
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFollowed()
  }, [])

  const fetchFollowed = async () => {
    try {
      const res = await fetch('/api/following')
      const data = await res.json()
      if (data.success) {
        setPortfolios(data.data.portfolios)
        setActivities(data.data.recentActivities)
      }
    } catch {
      // Sessizce yut
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-50">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Takip Ettiklerim</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Takip Ettiklerim</h3>
          {portfolios.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {portfolios.length}
            </span>
          )}
        </div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          Portföyleri Keşfet
        </Link>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-6">
          <Compass className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Henüz takip ettiğiniz portföy yok</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-2 font-medium transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            Portföyleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Takip Edilen Portföy Listesi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {portfolios.map((p) => (
              <Link
                key={p.portfolio_id}
                href={p.portfolio_slug ? `/p/${p.portfolio_slug}` : '#'}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                  {p.portfolio_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 truncate block group-hover:text-blue-700 transition-colors">
                    {p.portfolio_name}
                  </span>
                  <span className="text-xs text-gray-500">{p.owner_name}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>

          {/* Son 5 Hareket */}
          {activities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 pt-4 border-t border-gray-100">
                <div className="p-1 rounded-md bg-amber-50">
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Son Hareketler
                </h4>
              </div>
              <div className="space-y-1.5">
                {activities.map((a) => (
                  <Link
                    key={a.id}
                    href={a.portfolio_slug ? `/p/${a.portfolio_slug}` : '#'}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all group"
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                      a.metadata.side === 'BUY'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      {a.metadata.side === 'BUY' ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-blue-600 font-medium truncate">{a.portfolio_name}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{formatTime(a.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
