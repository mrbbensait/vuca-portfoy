'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Calendar,
  TrendingUp,
} from 'lucide-react'

interface TransactionRow {
  id: string
  user_id: string
  portfolio_id: string
  symbol: string
  asset_type: string
  side: string
  quantity: number
  price: number
  fee: number | null
  date: string
  note: string | null
  owner: { display_name: string | null } | null
}

interface TransactionsResponse {
  transactions: TransactionRow[]
  total: number
  page: number
  limit: number
  totalPages: number
  quickStats: {
    todayCount: number
    weekCount: number
  }
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  TR_STOCK: 'BIST',
  US_STOCK: 'ABD',
  CRYPTO: 'Kripto',
  CASH: 'Nakit',
}

export default function AdminTransactionsPage() {
  const [data, setData] = useState<TransactionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [symbol, setSymbol] = useState('')
  const [debouncedSymbol, setDebouncedSymbol] = useState('')
  const [side, setSide] = useState('')
  const [assetType, setAssetType] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSymbol(symbol)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [symbol])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '30' })
      if (debouncedSymbol) params.set('symbol', debouncedSymbol)
      if (side) params.set('side', side)
      if (assetType) params.set('asset_type', assetType)

      const res = await fetch(`/api/admin/transactions?${params}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSymbol, side, assetType])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-amber-600" />
          İşlem İzleme
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {data ? `Toplam ${data.total} işlem` : 'Yükleniyor...'}
        </p>
      </div>

      {/* Quick Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.quickStats.todayCount}</p>
              <p className="text-xs text-gray-500">Bugünkü İşlem</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.quickStats.weekCount}</p>
              <p className="text-xs text-gray-500">Bu Hafta</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Sembol ara..."
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-48"
          />
        </div>
        <select
          value={side}
          onChange={(e) => { setSide(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">Tüm İşlemler</option>
          <option value="BUY">Alış</option>
          <option value="SELL">Satış</option>
        </select>
        <select
          value={assetType}
          onChange={(e) => { setAssetType(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">Tüm Varlıklar</option>
          <option value="TR_STOCK">BIST Hisse</option>
          <option value="US_STOCK">ABD Hisse</option>
          <option value="CRYPTO">Kripto</option>
          <option value="CASH">Nakit</option>
        </select>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tarih</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kullanıcı</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sembol</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Tip</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">İşlem</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Miktar</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Fiyat</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Toplam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  </td>
                </tr>
              ) : data && data.transactions.length > 0 ? (
                data.transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(t.date).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${t.user_id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {t.owner?.display_name || 'İsimsiz'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.symbol}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                        {ASSET_TYPE_LABELS[t.asset_type] || t.asset_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        t.side === 'BUY'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {t.side === 'BUY' ? 'ALIŞ' : 'SATIŞ'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {t.quantity.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {t.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {(t.quantity * t.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">İşlem bulunamadı</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              {(page - 1) * 30 + 1}–{Math.min(page * 30, data.total)} / {data.total}
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
