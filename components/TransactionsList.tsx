'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'
import { format, startOfWeek, startOfMonth, subMonths, subYears, startOfYear } from 'date-fns'
import { tr } from 'date-fns/locale'
import {
  TrendingUp, TrendingDown, Search, X, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Trash2, ArrowUpDown, Filter, ReceiptText,
  Calendar, AlertTriangle, StickyNote, Package, Share2
} from 'lucide-react'
import AddTransactionButton from './AddTransactionButton'
import PortfolioVisibilityToggle from './PortfolioVisibilityToggle'
import { formatPrice, formatLargeNumber } from '@/lib/formatPrice'
import type { Transaction, Holding } from '@/lib/types/database.types'
import Blur from './PrivacyBlur'
import { calculateTransactionProfitLoss } from '@/lib/calculations'
import { usePrices } from '@/lib/hooks/usePrices'

interface TransactionsListProps {
  userId: string
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  TR_STOCK: 'TR Hisse',
  US_STOCK: 'ABD Hisse',
  CRYPTO: 'Kripto',
  CASH: 'Nakit',
}

const ASSET_TYPE_COLORS: Record<string, string> = {
  TR_STOCK: 'bg-red-50 text-red-700 border-red-200',
  US_STOCK: 'bg-blue-50 text-blue-700 border-blue-200',
  CRYPTO: 'bg-amber-50 text-amber-700 border-amber-200',
  CASH: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const CASH_SYMBOL_NAMES: Record<string, string> = {
  TRY: 'Türk Lirası',
  USD: 'Amerikan Doları',
  EUR: 'Euro',
  GOLD: 'Gram Altın',
  SILVER: 'Gram Gümüş',
}

type SortField = 'created_at' | 'date' | 'symbol' | 'side' | 'quantity' | 'price' | 'total' | 'pl' | 'plPct'
type SortDir = 'asc' | 'desc'

type DateFilter = 'all' | 'this_week' | 'this_month' | 'last_3m' | 'last_6m' | 'this_year' | 'last_year'

const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  all: 'Tümü',
  this_week: 'Bu Hafta',
  this_month: 'Bu Ay',
  last_3m: 'Son 3 Ay',
  last_6m: 'Son 6 Ay',
  this_year: 'Bu Yıl',
  last_year: 'Geçen Yıl',
}

function getDateRange(filter: DateFilter): { start: Date; end: Date } | null {
  if (filter === 'all') return null
  const now = new Date()
  const end = now
  let start: Date
  switch (filter) {
    case 'this_week': start = startOfWeek(now, { weekStartsOn: 1 }); break
    case 'this_month': start = startOfMonth(now); break
    case 'last_3m': start = subMonths(now, 3); break
    case 'last_6m': start = subMonths(now, 6); break
    case 'this_year': start = startOfYear(now); break
    case 'last_year': {
      const ly = subYears(now, 1)
      start = startOfYear(ly)
      return { start, end: new Date(ly.getFullYear(), 11, 31, 23, 59, 59) }
    }
  }
  return { start, end }
}

const PAGE_SIZE = 15

// Not içindeki linkleri tıklanabilir hale getiren fonksiyon
function renderNoteWithLinks(note: string) {
  // URL pattern: http/https ile başlayan VEYA www. ile başlayan
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g
  const parts = note.split(urlPattern).filter(Boolean)
  
  return parts.map((part, index) => {
    // HTTP/HTTPS ile başlayan link
    if (part && part.match(/^https?:\/\//)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline decoration-1 underline-offset-2 hover:decoration-2 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      )
    }
    // www. ile başlayan link (http:// ekle)
    if (part && part.match(/^www\./)) {
      return (
        <a
          key={index}
          href={`https://${part}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline decoration-1 underline-offset-2 hover:decoration-2 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      )
    }
    // Normal text
    return <span key={index}>{part}</span>
  })
}

export default function TransactionsList({ userId }: TransactionsListProps) {
  const { activePortfolio } = usePortfolio()
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [showVisibilityModal, setShowVisibilityModal] = useState(false)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterSide, setFilterSide] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Sort — default: en son eklenen en üstte (created_at desc)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Date range filter
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Note tooltip
  const [noteTooltipId, setNoteTooltipId] = useState<string | null>(null)

  // USD/TRY kuru (realize edilmemiş K/Z hesabı için)
  const [usdTryRate, setUsdTryRate] = useState<number | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!activePortfolio) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('portfolio_id', activePortfolio.id)
      .order('date', { ascending: true })
    setTransactions(data || [])
    setLoading(false)
  }, [activePortfolio?.id, supabase])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Holdings fetch
  useEffect(() => {
    const fetchHoldings = async () => {
      if (!activePortfolio) return
      const { data } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', activePortfolio.id)
      setHoldings(data || [])
    }
    fetchHoldings()
  }, [activePortfolio?.id, supabase])

  // USD/TRY kuru fetch
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('/api/price/quote?symbol=USD&asset_type=CASH')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setUsdTryRate(result.data.price)
          }
        }
      } catch (error) {
        console.error('USD/TRY rate error:', error)
      }
    }
    if (activePortfolio) fetchRate()
  }, [activePortfolio?.id])

  // Güncel fiyatlar (realize edilmemiş K/Z hesabı için)
  const { prices } = usePrices(holdings)

  // Kar/zarar hesapla (tüm işlemler üzerinden FIFO)
  const profitLossMap = useMemo(
    () => (transactions.length > 0 ? calculateTransactionProfitLoss(transactions) : new Map()),
    [transactions]
  )

  // Filtered + Sorted transactions
  const processedTransactions = useMemo(() => {
    let result = [...transactions]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(tx => {
        const symbolName = tx.asset_type === 'CASH' && CASH_SYMBOL_NAMES[tx.symbol]
          ? CASH_SYMBOL_NAMES[tx.symbol] : tx.symbol
        return symbolName.toLowerCase().includes(q) || tx.symbol.toLowerCase().includes(q)
      })
    }

    // Filter by asset type
    if (filterType) {
      result = result.filter(tx => tx.asset_type === filterType)
    }

    // Filter by side
    if (filterSide) {
      result = result.filter(tx => tx.side === filterSide)
    }

    // Filter by date range
    const range = getDateRange(dateFilter)
    if (range) {
      result = result.filter(tx => {
        const txDate = new Date(tx.date)
        return txDate >= range.start && txDate <= range.end
      })
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'created_at':
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'date':
          cmp = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'symbol':
          cmp = a.symbol.localeCompare(b.symbol)
          break
        case 'side':
          cmp = a.side.localeCompare(b.side)
          break
        case 'quantity':
          cmp = a.quantity - b.quantity
          break
        case 'price':
          cmp = a.price - b.price
          break
        case 'total':
          cmp = (a.quantity * a.price) - (b.quantity * b.price)
          break
        case 'pl': {
          const plA = profitLossMap.get(a.id)?.profit_loss ?? 0
          const plB = profitLossMap.get(b.id)?.profit_loss ?? 0
          cmp = plA - plB
          break
        }
        case 'plPct': {
          const pctA = profitLossMap.get(a.id)?.profit_loss_percent ?? 0
          const pctB = profitLossMap.get(b.id)?.profit_loss_percent ?? 0
          cmp = pctA - pctB
          break
        }
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [transactions, searchQuery, filterType, filterSide, dateFilter, sortField, sortDir, profitLossMap])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedTransactions.length / PAGE_SIZE))
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return processedTransactions.slice(start, start + PAGE_SIZE)
  }, [processedTransactions, currentPage])

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1) }, [searchQuery, filterType, filterSide, dateFilter, sortField, sortDir])

  // Summary stats
  const summary = useMemo(() => {
    const sells = processedTransactions.filter(tx => tx.side === 'SELL')
    const buys = processedTransactions.filter(tx => tx.side === 'BUY')
    
    // Toplam alım - tüm para birimlerini TRY'ye çevir
    let totalBuy = 0
    buys.forEach(tx => {
      const txTotal = tx.quantity * tx.price
      if (tx.asset_type === 'TR_STOCK' || tx.asset_type === 'CASH') {
        totalBuy += txTotal  // Zaten TRY
      } else if (usdTryRate) {  // US_STOCK veya CRYPTO
        totalBuy += txTotal * usdTryRate  // USD → TRY çevir
      }
    })
    
    // Toplam satım - tüm para birimlerini TRY'ye çevir
    let totalSell = 0
    sells.forEach(tx => {
      const txTotal = tx.quantity * tx.price
      if (tx.asset_type === 'TR_STOCK' || tx.asset_type === 'CASH') {
        totalSell += txTotal  // Zaten TRY
      } else if (usdTryRate) {  // US_STOCK veya CRYPTO
        totalSell += txTotal * usdTryRate  // USD → TRY çevir
      }
    })
    
    let realizedPL = 0
    sells.forEach(tx => {
      const pl = profitLossMap.get(tx.id)
      if (pl?.profit_loss !== null && pl?.profit_loss !== undefined) realizedPL += pl.profit_loss
    })

    // Güncel miktar: sembol bazında alış - satış
    const netQuantities = new Map<string, number>()
    processedTransactions.forEach(tx => {
      const current = netQuantities.get(tx.symbol) || 0
      netQuantities.set(tx.symbol, tx.side === 'BUY' ? current + tx.quantity : current - tx.quantity)
    })

    // Realize edilmemiş K/Z: filtrelenen sembollerdeki mevcut holdinglerin unrealized P/L
    const filteredSymbols = new Set(processedTransactions.map(tx => tx.symbol))
    let unrealizedPL = 0
    const matchedHoldings = holdings.filter(h => filteredSymbols.has(h.symbol))
    matchedHoldings.forEach(h => {
      const priceData = prices[h.symbol]
      if (!priceData || !usdTryRate) return
      
      let currentValueTry = 0
      let costTry = 0
      
      if (priceData.currency === 'TRY') {
        currentValueTry = h.quantity * priceData.price
        costTry = h.quantity * h.avg_price
      } else if (priceData.currency === 'USD') {
        currentValueTry = h.quantity * priceData.price * usdTryRate
        costTry = h.quantity * h.avg_price * usdTryRate
      }
      
      unrealizedPL += currentValueTry - costTry
    })

    return { totalBuy, totalSell, realizedPL, unrealizedPL, netQuantities, buyCount: buys.length, sellCount: sells.length }
  }, [processedTransactions, profitLossMap, holdings, prices, usdTryRate])

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/transactions?id=${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Silme işlemi başarısız')
      } else {
        await fetchTransactions()
      }
    } catch {
      alert('Bir hata oluştu')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const activeFilters = [filterType, filterSide, searchQuery, dateFilter !== 'all' ? dateFilter : null].filter(Boolean).length

  // Sort icon helper
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-300" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-blue-600" />
      : <ChevronDown className="w-3 h-3 text-blue-600" />
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-gray-400" />
              İşlem Geçmişi
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {transactions.length} işlem
              {activeFilters > 0 && ` · ${processedTransactions.length} sonuç`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVisibilityModal(true)}
              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Bu Portföyü Paylaş
            </button>
            <AddTransactionButton userId={userId} />
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 space-y-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sembol veya varlık ara..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 transition-colors">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />

          {/* Asset type filters */}
          {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterType(filterType === key ? null : key)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all ${
                filterType === key
                  ? ASSET_TYPE_COLORS[key]
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}

          <div className="w-px h-4 bg-gray-200 mx-1" />

          {/* Side filters */}
          <button
            onClick={() => setFilterSide(filterSide === 'BUY' ? null : 'BUY')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all ${
              filterSide === 'BUY'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Alış
          </button>
          <button
            onClick={() => setFilterSide(filterSide === 'SELL' ? null : 'SELL')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all ${
              filterSide === 'SELL'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Satış
          </button>

          {activeFilters > 0 && (
            <button
              onClick={() => { setSearchQuery(''); setFilterType(null); setFilterSide(null); setDateFilter('all') }}
              className="ml-1 px-2 py-1 text-[11px] text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Temizle
            </button>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1" />
          {Object.entries(DATE_FILTER_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDateFilter(key as DateFilter)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all ${
                dateFilter === key
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {processedTransactions.length === 0 ? (
          <div className="p-12 text-center">
            {transactions.length === 0 ? (
              <>
                <ReceiptText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">Henüz işlem bulunmuyor</p>
                <p className="text-xs text-gray-400 mt-1">Portföyünüze ilk işleminizi ekleyin.</p>
              </>
            ) : (
              <>
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">Sonuç bulunamadı</p>
                <p className="text-xs text-gray-400 mt-1">Arama veya filtre kriterlerini değiştirmeyi deneyin.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    { field: 'date' as SortField, label: 'Tarih', align: 'left' },
                    { field: 'symbol' as SortField, label: 'Sembol', align: 'left' },
                    { field: 'side' as SortField, label: 'İşlem', align: 'left' },
                    { field: 'quantity' as SortField, label: 'Miktar', align: 'right' },
                    { field: 'price' as SortField, label: 'Fiyat', align: 'right' },
                    { field: 'total' as SortField, label: 'Toplam', align: 'right' },
                  ].map(col => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      className={`px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none ${
                        col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        <SortIcon field={col.field} />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Komis.
                  </th>
                  <th
                    onClick={() => handleSort('pl')}
                    className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      K/Z <SortIcon field="pl" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('plPct')}
                    className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      % <SortIcon field="plPct" />
                    </span>
                  </th>
                  <th className="px-3 py-2.5 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedTransactions.map((tx) => {
                  const pl = profitLossMap.get(tx.id)
                  const currency = (tx.asset_type === 'TR_STOCK' || tx.asset_type === 'CASH') ? '₺' : '$'
                  const isSell = tx.side === 'SELL'
                  const hasPL = isSell && pl?.profit_loss !== null && pl?.profit_loss !== undefined

                  let rowBg = 'hover:bg-gray-50'
                  if (hasPL) {
                    rowBg = pl!.profit_loss! > 0 ? 'bg-emerald-50/40 hover:bg-emerald-50' : pl!.profit_loss! < 0 ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-gray-50'
                  }

                  return (
                    <tr key={tx.id} className={`transition-colors ${rowBg} group`}>
                      {/* Tarih */}
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-700">
                        {format(new Date(tx.date), 'dd MMM yyyy', { locale: tr })}
                      </td>

                      {/* Sembol */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {tx.asset_type === 'CASH' && CASH_SYMBOL_NAMES[tx.symbol]
                              ? CASH_SYMBOL_NAMES[tx.symbol]
                              : tx.symbol}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded border ${ASSET_TYPE_COLORS[tx.asset_type]}`}>
                            {ASSET_TYPE_LABELS[tx.asset_type]}
                          </span>
                          {/* Not ikonu */}
                          {tx.note && (
                            <div 
                              className="relative"
                              onMouseEnter={() => setNoteTooltipId(tx.id)}
                              onMouseLeave={() => setNoteTooltipId(null)}
                            >
                              <button
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                              >
                                <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[10px] font-medium text-amber-600">Not</span>
                              </button>
                              {noteTooltipId === tx.id && (
                                <div className="absolute left-0 top-full mt-1.5 z-50 max-w-lg p-4 bg-gray-900 text-white text-sm rounded-lg shadow-2xl max-h-96 overflow-y-auto">
                                  <div className="flex items-center gap-2 mb-2.5 text-amber-300 font-semibold">
                                    <StickyNote className="w-4 h-4" /> İşlem Notu
                                  </div>
                                  <div className="leading-relaxed whitespace-pre-wrap break-words">
                                    {renderNoteWithLinks(tx.note)}
                                  </div>
                                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* İşlem */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {tx.side === 'BUY' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <TrendingUp className="w-3 h-3" /> ALIŞ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            <TrendingDown className="w-3 h-3" /> SATIŞ
                          </span>
                        )}
                      </td>

                      {/* Miktar */}
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-800 text-right font-mono">
                        <Blur>{tx.quantity.toLocaleString('tr-TR')}</Blur>
                      </td>

                      {/* Fiyat */}
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-800 text-right font-mono">
                        <Blur>{currency}{formatPrice(tx.price)}</Blur>
                      </td>

                      {/* Toplam */}
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-gray-900 text-right font-mono">
                        <Blur>{currency}{(tx.quantity * tx.price).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</Blur>
                      </td>

                      {/* Komisyon */}
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-400 text-right font-mono">
                        <Blur>{tx.fee ? `${currency}${formatPrice(tx.fee)}` : '-'}</Blur>
                      </td>

                      {/* K/Z */}
                      {hasPL ? (
                        <>
                          <td className={`px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-right font-mono ${
                            pl!.profit_loss! > 0 ? 'text-emerald-600' : pl!.profit_loss! < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            <Blur>{pl!.profit_loss! >= 0 ? '+' : ''}{currency}{formatPrice(Math.abs(pl!.profit_loss!))}</Blur>
                          </td>
                          <td className={`px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-right font-mono ${
                            (pl!.profit_loss_percent ?? 0) > 0 ? 'text-emerald-600' : (pl!.profit_loss_percent ?? 0) < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {(pl!.profit_loss_percent ?? 0) >= 0 ? '+' : ''}{(pl!.profit_loss_percent ?? 0).toFixed(2)}%
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-300 text-right">-</td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-300 text-right">-</td>
                        </>
                      )}

                      {/* Actions */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => setDeleteId(tx.id)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Summary */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 uppercase tracking-wider font-medium">Toplam Alım</span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5"><Blur>₺{formatLargeNumber(summary.totalBuy)}</Blur></p>
                  <p className="text-gray-400">{summary.buyCount} işlem</p>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider font-medium">Toplam Satım</span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5"><Blur>₺{formatLargeNumber(summary.totalSell)}</Blur></p>
                  <p className="text-gray-400">{summary.sellCount} işlem</p>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider font-medium">Realize K/Z</span>
                  <p className={`text-sm font-bold mt-0.5 ${summary.realizedPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    <Blur>{summary.realizedPL >= 0 ? '+' : '-'}₺{formatLargeNumber(Math.abs(summary.realizedPL))}</Blur>
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1">
                    <Package className="w-3 h-3" /> Güncel Miktar
                  </span>
                  <div className="mt-0.5">
                    {(() => {
                      const held = Array.from(summary.netQuantities.entries()).filter(([, qty]) => qty > 0)
                      if (searchQuery.trim()) {
                        // Arama varsa: sadece aranan sembolleri göster
                        if (held.length === 0) {
                          return <p className="text-sm font-bold text-gray-400">Elde yok</p>
                        }
                        return held.map(([symbol, qty]) => (
                          <p key={symbol} className="text-sm font-bold text-gray-900">
                            <Blur>{qty.toLocaleString('tr-TR')}</Blur> <span className="text-xs font-medium text-gray-500">{symbol}</span>
                          </p>
                        ))
                      }
                      // Arama yoksa: sadece özet sayı göster
                      return held.length > 0 ? (
                        <p className="text-sm font-bold text-gray-900">
                          <Blur>{held.length}</Blur> <span className="text-xs font-medium text-gray-500">farklı varlık</span>
                        </p>
                      ) : (
                        <p className="text-sm font-bold text-gray-400">Elde yok</p>
                      )
                    })()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider font-medium">Realize Edilmemiş K/Z</span>
                  {summary.unrealizedPL !== 0 ? (
                    <p className={`text-sm font-bold mt-0.5 ${summary.unrealizedPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      <Blur>{summary.unrealizedPL >= 0 ? '+' : '-'}₺{formatLargeNumber(Math.abs(summary.unrealizedPL))}</Blur>
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-gray-400 mt-0.5">-</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {processedTransactions.length} işlemden {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, processedTransactions.length)} arası
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page: number
                    if (totalPages <= 5) {
                      page = i + 1
                    } else if (currentPage <= 3) {
                      page = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i
                    } else {
                      page = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (() => {
        const txToDelete = transactions.find(t => t.id === deleteId)
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Big warning header */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 px-6 py-5 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <AlertTriangle className="w-9 h-9 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Dikkat!</h3>
                <p className="text-red-100 text-sm mt-1">Bu işlem geri alınamaz</p>
              </div>

              <div className="p-6">
                {/* Transaction detail */}
                {txToDelete && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{txToDelete.symbol}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${txToDelete.side === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {txToDelete.side === 'BUY' ? 'ALIŞ' : 'SATIŞ'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-gray-500 text-xs">
                      <span>{txToDelete.quantity.toLocaleString('tr-TR')} adet x {formatPrice(txToDelete.price)}</span>
                      <span>{format(new Date(txToDelete.date), 'dd MMM yyyy', { locale: tr })}</span>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-700 font-medium mb-3">
                  Bu işlemi silmek istediğinizden emin misiniz?
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-2 space-y-2">
                  <p className="text-xs text-amber-800 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    Bu işlemi yalnızca hatalı bir kayıt girdiyseniz silin.
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Onayladığınızda aşağıdaki değişiklikler otomatik olarak uygulanacaktır:
                  </p>
                  <ul className="text-xs text-amber-700 space-y-1 ml-4 list-disc">
                    <li>İşlem kaydı kalıcı olarak silinecek</li>
                    <li>Portföyünüzdeki <strong>varlık miktarı</strong> güncellecek</li>
                    <li><strong>Ortalama maliyet</strong> yeniden hesaplanacak</li>
                    <li>Kar/zarar istatistikleri değişecek</li>
                  </ul>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setDeleteId(null)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-500/25"
                  >
                    {deleting ? 'Siliniyor...' : 'Evet, İşlemi Sil'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Portfolio Visibility Modal */}
      {showVisibilityModal && (
        <PortfolioVisibilityToggle onClose={() => setShowVisibilityModal(false)} />
      )}
    </div>
  )
}
