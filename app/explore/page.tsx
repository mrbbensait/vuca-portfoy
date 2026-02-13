'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, Clock, SortAsc, Loader2, Compass } from 'lucide-react'
import PublicPortfolioCard from '@/components/PublicPortfolioCard'
import Link from 'next/link'

interface ExplorePortfolio {
  id: string
  name: string
  slug: string | null
  description: string | null
  holding_count: number
  owner_name: string
  owner_avatar: string | null
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

type SortOption = 'newest' | 'name'

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: 'newest', label: 'En Yeni', icon: Clock },
  { value: 'name', label: 'İsim (A-Z)', icon: SortAsc },
]

export default function ExplorePage() {
  const [portfolios, setPortfolios] = useState<ExplorePortfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [searchDebounce, setSearchDebounce] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounce(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchPortfolios = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sort,
        ...(searchDebounce && { search: searchDebounce }),
      })

      const res = await fetch(`/api/explore?${params}`)
      const result = await res.json()

      if (result.success) {
        setPortfolios(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Explore fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [sort, searchDebounce])

  useEffect(() => {
    fetchPortfolios(1)
  }, [fetchPortfolios])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              Portföy Röntgeni
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Ana Panel
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Compass className="w-4 h-4" />
            Keşfet
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Portföyleri Keşfedin
          </h1>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Diğer yatırımcıların public portföylerini inceleyin, takip edin ve ilham alın.
          </p>
        </div>

        {/* Arama & Filtreler */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Arama */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Portföy adı veya açıklama ara..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Sıralama */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              {SORT_OPTIONS.map(option => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                      sort === option.value
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sonuçlar */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Portföyler yükleniyor...</p>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-20">
            <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Henüz public portföy yok</h3>
            <p className="text-sm text-gray-500 mt-1">
              {search ? 'Arama kriterlerinize uygun portföy bulunamadı.' : 'İlk public portföyü siz oluşturun!'}
            </p>
          </div>
        ) : (
          <>
            {/* Sonuç sayısı */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{pagination.total}</span> portföy bulundu
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolios.map(portfolio => (
                <PublicPortfolioCard key={portfolio.id} {...portfolio} />
              ))}
            </div>

            {/* Sayfalama */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => fetchPortfolios(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Önceki
                </button>
                <span className="text-sm text-gray-500">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchPortfolios(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
