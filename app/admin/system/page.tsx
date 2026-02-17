'use client'

import { useState, useEffect } from 'react'
import {
  Server,
  Database,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react'

interface SystemData {
  priceCache: {
    totalCached: number
    expiredCount: number
    activeCached: number
    latestEntries: {
      symbol: string
      updated_at: string
      expires_at: string
      source: string | null
    }[]
  }
  rateLimits: {
    user_id: string
    endpoint: string
    request_count: number
    window_start: string
    display_name: string
  }[]
  tableCounts: { table: string; count: number }[]
}

const TABLE_LABELS: Record<string, string> = {
  users_public: 'Kullanıcılar',
  portfolios: 'Portföyler',
  holdings: 'Holdings',
  transactions: 'İşlemler',
  notes: 'Notlar',
  alerts: 'Uyarılar',
  portfolio_follows: 'Takipler',
  portfolio_activities: 'Aktiviteler',
  price_cache: 'Fiyat Cache',
  roles: 'Roller',
  user_roles: 'Kullanıcı Rolleri',
  admin_audit_log: 'Audit Log',
}

export default function AdminSystemPage() {
  const [data, setData] = useState<SystemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchData(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/admin/system')
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Sistem verileri yüklenemedi
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="w-6 h-6 text-emerald-600" />
            Sistem Sağlığı
          </h1>
          <p className="text-sm text-gray-500 mt-1">Teknik altyapı durumu</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Price Cache */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Fiyat Cache Durumu
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-700">{data.priceCache.activeCached}</p>
            <p className="text-xs text-emerald-600">Aktif Cache</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{data.priceCache.expiredCount}</p>
            <p className="text-xs text-amber-600">Expired</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-700">{data.priceCache.totalCached}</p>
            <p className="text-xs text-gray-500">Toplam</p>
          </div>
        </div>

        {data.priceCache.latestEntries.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Son Güncellenen Semboller
            </p>
            <div className="space-y-1">
              {data.priceCache.latestEntries.map((entry, i) => {
                const isExpired = new Date(entry.expires_at) < new Date()
                return (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      {isExpired ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span className="font-medium text-gray-900">{entry.symbol}</span>
                      {entry.source && (
                        <span className="text-xs text-gray-400">{entry.source}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.updated_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rate Limits */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Rate Limit Durumu (En Çok İstek Atan)
        </h2>
        {data.rateLimits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-2 font-medium">Kullanıcı</th>
                  <th className="pb-2 font-medium">Endpoint</th>
                  <th className="pb-2 font-medium text-right">İstek Sayısı</th>
                  <th className="pb-2 font-medium text-right">Pencere Başlangıcı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.rateLimits.map((rl, i) => (
                  <tr key={i}>
                    <td className="py-2 font-medium text-gray-900">{rl.display_name}</td>
                    <td className="py-2 text-gray-600">{rl.endpoint}</td>
                    <td className="py-2 text-right">
                      <span className={`font-medium ${rl.request_count > 80 ? 'text-red-600' : 'text-gray-700'}`}>
                        {rl.request_count}
                      </span>
                    </td>
                    <td className="py-2 text-right text-xs text-gray-400">
                      {new Date(rl.window_start).toLocaleString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-6">Rate limit kaydı yok</p>
        )}
      </div>

      {/* Veritabanı Tabloları */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-500" />
          Veritabanı İstatistikleri
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.tableCounts.map((tc) => (
            <div key={tc.table} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 truncate">
                {TABLE_LABELS[tc.table] || tc.table}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {tc.count.toLocaleString('tr-TR')}
              </p>
              <p className="text-[10px] text-gray-400 font-mono">{tc.table}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
