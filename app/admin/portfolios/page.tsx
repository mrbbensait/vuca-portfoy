'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Globe,
  Lock,
  Heart,
  Package,
  ArrowLeftRight,
  ArrowUpDown,
  Trophy,
} from 'lucide-react'

interface PortfolioRow {
  id: string
  user_id: string
  name: string
  is_public: boolean
  slug: string | null
  follower_count: number
  created_at: string
  updated_at: string
  holding_count: number
  transaction_count: number
  owner: { display_name: string | null } | null
}

interface PortfoliosResponse {
  portfolios: PortfolioRow[]
  total: number
  page: number
  limit: number
  totalPages: number
  quickStats: {
    totalPortfolios: number
    publicPortfolios: number
    topFollowed: { name: string; slug: string | null; follower_count: number; owner: { display_name: string | null } | null }[]
  }
}

export default function AdminPortfoliosPage() {
  const [data, setData] = useState<PortfoliosResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        filter,
        sort: sortBy,
        dir: sortDir,
      })
      const res = await fetch(`/api/admin/portfolios?${params}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [page, filter, sortBy, sortDir])

  useEffect(() => { fetchData() }, [fetchData])

  function handleSort(field: string) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir('desc')
    }
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-purple-600" />
          Portföy İzleme
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {data ? `Toplam ${data.quickStats.totalPortfolios} portföy` : 'Yükleniyor...'}
        </p>
      </div>

      {/* Quick Stats */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Toplam Portföy</p>
            <p className="text-2xl font-bold text-gray-900">{data.quickStats.totalPortfolios}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Public Portföy</p>
            <p className="text-2xl font-bold text-purple-600">{data.quickStats.publicPortfolios}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500" /> En Çok Takipçi
            </p>
            <div className="mt-1 space-y-1">
              {data.quickStats.topFollowed.length > 0 ? (
                data.quickStats.topFollowed.map((p, i) => (
                  <p key={i} className="text-xs text-gray-700">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-gray-400"> · {p.follower_count} takipçi</span>
                  </p>
                ))
              ) : (
                <p className="text-xs text-gray-400">Henüz takipçi yok</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filtreler */}
      <div className="flex items-center gap-2">
        {['all', 'public', 'private'].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === f
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Tümü' : f === 'public' ? 'Public' : 'Private'}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-900">
                    Portföy <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sahibi</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  <span className="flex items-center justify-center gap-1">
                    <Package className="w-3.5 h-3.5" /> Holding
                  </span>
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  <span className="flex items-center justify-center gap-1">
                    <ArrowLeftRight className="w-3.5 h-3.5" /> İşlem
                  </span>
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  <button onClick={() => handleSort('follower_count')} className="flex items-center gap-1 hover:text-gray-900 mx-auto">
                    <Heart className="w-3.5 h-3.5" /> Takipçi <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  <button onClick={() => handleSort('created_at')} className="flex items-center gap-1 hover:text-gray-900">
                    Tarih <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  </td>
                </tr>
              ) : data && data.portfolios.length > 0 ? (
                data.portfolios.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.slug && <p className="text-xs text-gray-400">/{p.slug}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${p.user_id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {p.owner?.display_name || 'İsimsiz'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.is_public ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <Globe className="w-3 h-3" /> Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Private
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{p.holding_count}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{p.transaction_count}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{p.follower_count}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(p.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">Portföy bulunamadı</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} / {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">{page} / {data.totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
