'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, ExternalLink, Compass } from 'lucide-react'

interface FollowedPortfolio {
  portfolio_id: string
  portfolio_name: string
  portfolio_slug: string | null
  owner_name: string
}

export default function FollowedPortfolios() {
  const [portfolios, setPortfolios] = useState<FollowedPortfolio[]>([])
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
      }
    } catch {
      // Sessizce yut
    } finally {
      setLoading(false)
    }
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
        <div className="space-y-4">
          {/* Takip Edilen Portföyler */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {portfolios.map((p) => (
                <Link
                  key={p.portfolio_id}
                  href={p.portfolio_slug ? `/p/${p.portfolio_slug}` : '#'}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {p.portfolio_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-900 truncate block group-hover:text-blue-700 transition-colors">
                      {p.portfolio_name}
                    </span>
                    <span className="text-xs text-gray-500">{p.owner_name}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
