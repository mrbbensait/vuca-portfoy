'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'
import { calculateTransactionProfitLoss } from '@/lib/calculations'
import { formatLargeNumber } from '@/lib/formatPrice'
import type { Transaction } from '@/lib/types/database.types'
import type { PriceData } from '@/lib/hooks/usePrices'
import {
  TrendingUp, TrendingDown, DollarSign, BarChart3,
  Target, Award, AlertTriangle, Percent, Scale,
  ArrowDownRight, ArrowUpRight, Receipt, Calendar,
  ChevronDown, Info
} from 'lucide-react'
import Blur from './PrivacyBlur'

// ── Types ──────────────────────────────────────────────
interface ProfitLossSectionProps {
  holdings: Array<{
    symbol: string
    asset_type: string
    quantity: number
    avg_price: number
  }>
  prices: Record<string, PriceData>
  usdTryRate: number
  loading: boolean
}

type TimeFilter =
  | 'this_week'
  | 'this_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'last_1_year'
  | 'last_year'
  | 'all'

interface TimeFilterOption {
  key: TimeFilter
  label: string
}

const TIME_FILTERS: TimeFilterOption[] = [
  { key: 'this_week', label: 'Bu Hafta' },
  { key: 'this_month', label: 'Bu Ay' },
  { key: 'last_3_months', label: 'Son 3 Ay' },
  { key: 'last_6_months', label: 'Son 6 Ay' },
  { key: 'this_year', label: 'Bu Yıl' },
  { key: 'last_1_year', label: 'Son 1 Yıl' },
  { key: 'last_year', label: 'Geçen Yıl' },
  { key: 'all', label: 'Tümü' },
]

// ── Helpers ────────────────────────────────────────────
function getFilterDateRange(filter: TimeFilter): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  switch (filter) {
    case 'this_week': {
      const day = now.getDay()
      const diff = day === 0 ? 6 : day - 1
      const start = new Date(now)
      start.setDate(now.getDate() - diff)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start, end }
    }
    case 'last_3_months': {
      const start = new Date(now)
      start.setMonth(now.getMonth() - 3)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'last_6_months': {
      const start = new Date(now)
      start.setMonth(now.getMonth() - 6)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'this_year': {
      const start = new Date(now.getFullYear(), 0, 1)
      return { start, end }
    }
    case 'last_1_year': {
      const start = new Date(now)
      start.setFullYear(now.getFullYear() - 1)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'last_year': {
      const start = new Date(now.getFullYear() - 1, 0, 1)
      const yearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
      return { start, end: yearEnd }
    }
    case 'all':
    default:
      return { start: new Date(2000, 0, 1), end }
  }
}

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Bilgi"
      >
        <Info className="w-3.5 h-3.5 text-gray-400" />
      </button>
      {show && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl leading-relaxed">
          {text}
          <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────
interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  trend?: 'up' | 'down' | 'neutral'
  tooltip?: string
}

function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend, tooltip }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative">
      {tooltip && (
        <div className="absolute top-2 right-2">
          <InfoTooltip text={tooltip} />
        </div>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</span>
      </div>
      <p className={`text-lg font-bold ${
        trend === 'up' ? 'text-emerald-600' :
        trend === 'down' ? 'text-red-600' :
        'text-gray-900'
      }`}>
        <Blur>{value}</Blur>
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  )
}

// ── Highlight Card (büyük kartlar) ─────────────────────
interface HighlightCardProps {
  title: string
  value: string
  percent?: string
  icon: React.ElementType
  gradient: string
  subtitle?: string
  loading: boolean
}

function HighlightCard({ title, value, percent, icon: Icon, gradient, subtitle, loading }: HighlightCardProps) {
  return (
    <div className={`rounded-xl shadow-lg p-5 text-white ${gradient}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium opacity-80 uppercase tracking-wider">{title}</span>
        <Icon className="w-5 h-5 opacity-70" />
      </div>
      {loading ? (
        <div className="h-8 bg-white/20 rounded animate-pulse w-32" />
      ) : (
        <>
          <p className="text-2xl font-bold"><Blur>{value}</Blur></p>
          {percent && <p className="text-sm font-semibold mt-1 opacity-90">{percent}</p>}
          {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
        </>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────
export default function ProfitLossSection({ holdings, prices, usdTryRate, loading: parentLoading }: ProfitLossSectionProps) {
  const { activePortfolio } = usePortfolio()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('all')
  const [showAllFilters, setShowAllFilters] = useState(false)
  const supabase = createClient()

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!activePortfolio) { setTxLoading(false); return }
      setTxLoading(true)
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('portfolio_id', activePortfolio.id)
          .order('date', { ascending: true })

        if (error) throw error
        setTransactions(data || [])
      } catch (err) {
        console.error('Transaction fetch error:', err)
      } finally {
        setTxLoading(false)
      }
    }
    fetchTransactions()
  }, [activePortfolio?.id])

  // ── P&L Calculations ────────────────────────────────
  const plData = useMemo(() => {
    if (txLoading || parentLoading || !prices || transactions.length === 0) return null

    const { start, end } = getFilterDateRange(activeFilter)

    // Filter transactions by date range
    const filteredTx = transactions.filter(tx => {
      const txDate = new Date(tx.date)
      return txDate >= start && txDate <= end
    })

    // All transactions for FIFO context (need full history for correct cost basis)
    const allProfitLoss = calculateTransactionProfitLoss(transactions)

    // ── Realized P&L (satış işlemlerinden) ──
    const sellTxInRange = filteredTx.filter(tx => tx.side === 'SELL')
    let realizedPL = 0
    let realizedGrossProfit = 0
    let realizedGrossLoss = 0
    let winCount = 0
    let lossCount = 0
    let bestTradeData: { symbol: string; pl: number; plPct: number } | null = null
    let worstTradeData: { symbol: string; pl: number; plPct: number } | null = null
    let totalFees = 0

    sellTxInRange.forEach(tx => {
      const plInfo = allProfitLoss.get(tx.id)
      if (!plInfo || plInfo.profit_loss === null) return

      const pl = plInfo.profit_loss
      const plPct = plInfo.profit_loss_percent || 0
      realizedPL += pl

      if (pl >= 0) {
        realizedGrossProfit += pl
        winCount++
      } else {
        realizedGrossLoss += Math.abs(pl)
        lossCount++
      }

      if (!bestTradeData || pl > bestTradeData.pl) {
        bestTradeData = { symbol: tx.symbol, pl, plPct }
      }
      if (!worstTradeData || pl < worstTradeData.pl) {
        worstTradeData = { symbol: tx.symbol, pl, plPct }
      }
    })

    const bestTrade = bestTradeData as { symbol: string; pl: number; plPct: number } | null
    const worstTrade = worstTradeData as { symbol: string; pl: number; plPct: number } | null

    // Total fees (tüm filtrelenmiş işlemlerden)
    filteredTx.forEach(tx => {
      totalFees += tx.fee || 0
    })

    // ── Unrealized P&L (açık pozisyonlardan) ──
    let unrealizedPL = 0
    let totalCurrentValue = 0
    let totalCostBasis = 0

    holdings.forEach(h => {
      const pd = prices[h.symbol]
      if (!pd) return

      let currentValueTry = 0
      let costTry = 0

      if (pd.currency === 'TRY') {
        currentValueTry = h.quantity * pd.price
        costTry = h.quantity * h.avg_price
      } else if (pd.currency === 'USD') {
        currentValueTry = h.quantity * pd.price * usdTryRate
        costTry = h.quantity * h.avg_price * usdTryRate
      }

      totalCurrentValue += currentValueTry
      totalCostBasis += costTry
    })

    unrealizedPL = totalCurrentValue - totalCostBasis

    // ── Derived Metrics ──
    const totalTrades = sellTxInRange.length
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0
    const profitFactor = realizedGrossLoss > 0 ? realizedGrossProfit / realizedGrossLoss : realizedGrossProfit > 0 ? Infinity : 0
    const avgWin = winCount > 0 ? realizedGrossProfit / winCount : 0
    const avgLoss = lossCount > 0 ? realizedGrossLoss / lossCount : 0
    const expectancy = totalTrades > 0 ? realizedPL / totalTrades : 0
    const totalPL = realizedPL + unrealizedPL
    const realizedPLPct = totalCostBasis > 0 ? (realizedPL / totalCostBasis) * 100 : 0
    const unrealizedPLPct = totalCostBasis > 0 ? (unrealizedPL / totalCostBasis) * 100 : 0
    const totalPLPct = totalCostBasis > 0 ? (totalPL / totalCostBasis) * 100 : 0

    // Buy transactions in range (for filtered stats)
    const buyTxInRange = filteredTx.filter(tx => tx.side === 'BUY')
    const totalInvested = buyTxInRange.reduce((sum, tx) => sum + (tx.quantity * tx.price), 0)
    const totalSold = sellTxInRange.reduce((sum, tx) => sum + (tx.quantity * tx.price), 0)

    // All-time totals for cash flow summary (NOT filtered) - with currency conversion
    const allBuyTx = transactions.filter(tx => tx.side === 'BUY')
    const allSellTx = transactions.filter(tx => tx.side === 'SELL')
    
    let allTimeInvested = 0
    let allTimeSold = 0
    
    // Convert all buy transactions to TRY
    allBuyTx.forEach(tx => {
      const pd = prices[tx.symbol]
      if (!pd) {
        // If no price data, assume TRY (fallback)
        allTimeInvested += tx.quantity * tx.price
        return
      }
      
      if (pd.currency === 'TRY') {
        allTimeInvested += tx.quantity * tx.price
      } else if (pd.currency === 'USD') {
        allTimeInvested += (tx.quantity * tx.price) * usdTryRate
      }
    })
    
    // Convert all sell transactions to TRY
    allSellTx.forEach(tx => {
      const pd = prices[tx.symbol]
      if (!pd) {
        // If no price data, assume TRY (fallback)
        allTimeSold += tx.quantity * tx.price
        return
      }
      
      if (pd.currency === 'TRY') {
        allTimeSold += tx.quantity * tx.price
      } else if (pd.currency === 'USD') {
        allTimeSold += (tx.quantity * tx.price) * usdTryRate
      }
    })

    return {
      realizedPL,
      unrealizedPL,
      totalPL,
      realizedPLPct,
      unrealizedPLPct,
      totalPLPct,
      realizedGrossProfit,
      realizedGrossLoss,
      winCount,
      lossCount,
      totalTrades,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      expectancy,
      bestTrade,
      worstTrade,
      totalFees,
      totalInvested,
      totalSold,
      totalCurrentValue,
      totalCostBasis,
      allTimeInvested,
      allTimeSold,
    }
  }, [transactions, holdings, prices, usdTryRate, activeFilter, txLoading, parentLoading])

  const isLoading = txLoading || parentLoading
  const lastSavedRef = React.useRef<string | null>(null)

  // Save stats to cache when computed (for public portfolio pages)
  useEffect(() => {
    if (!activePortfolio || !plData || isLoading || activeFilter !== 'all') return

    const cacheKey = `${activePortfolio.id}-${JSON.stringify(plData)}`
    if (lastSavedRef.current === cacheKey) return
    lastSavedRef.current = cacheKey

    // Client-side throttling: check last save time in localStorage
    const lastSaveKey = `stats-save-${activePortfolio.id}`
    const lastSaveTime = localStorage.getItem(lastSaveKey)
    
    if (lastSaveTime) {
      const ageMinutes = (Date.now() - parseInt(lastSaveTime)) / 1000 / 60
      if (ageMinutes < 5) {
        return // Skip if saved less than 5 minutes ago
      }
    }

    const saveStats = async () => {
      try {
        const response = await fetch('/api/portfolio-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolio_id: activePortfolio.id,
            stats_data: {
              realizedPL: plData.realizedPL,
              unrealizedPL: plData.unrealizedPL,
              totalPL: plData.totalPL,
              realizedPLPct: plData.realizedPLPct,
              unrealizedPLPct: plData.unrealizedPLPct,
              totalPLPct: plData.totalPLPct,
              realizedGrossProfit: plData.realizedGrossProfit,
              realizedGrossLoss: plData.realizedGrossLoss,
              winCount: plData.winCount,
              lossCount: plData.lossCount,
              totalTrades: plData.totalTrades,
              winRate: plData.winRate,
              profitFactor: plData.profitFactor === Infinity ? 999999 : plData.profitFactor,
              avgWin: plData.avgWin,
              avgLoss: plData.avgLoss,
              expectancy: plData.expectancy,
              bestTrade: plData.bestTrade,
              worstTrade: plData.worstTrade,
              totalFees: plData.totalFees,
              totalInvested: plData.totalInvested,
              totalSold: plData.totalSold,
              totalCurrentValue: plData.totalCurrentValue,
              totalCostBasis: plData.totalCostBasis,
              allTimeInvested: plData.allTimeInvested,
              allTimeSold: plData.allTimeSold,
            },
          }),
        })
        
        // Save successful - update timestamp
        if (response.ok) {
          const result = await response.json()
          if (result.success && !result.skipped) {
            localStorage.setItem(lastSaveKey, Date.now().toString())
          }
        }
      } catch (err) {
        console.error('Failed to save portfolio stats cache:', err)
      }
    }
    saveStats()
  }, [activePortfolio?.id, plData, isLoading, activeFilter])

  if (!activePortfolio) return null

  const visibleFilters = showAllFilters ? TIME_FILTERS : TIME_FILTERS.slice(0, 4)

  return (
    <div className="space-y-4">
      {/* Nakit Akış Özeti - Üstte, filtreden bağımsız */}
      {plData && !isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            Nakit Akış Özeti
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs text-gray-500">Toplam Alım</p>
                <InfoTooltip text="Başlangıçtan bugüne yaptığınız tüm alım işlemlerinin toplam tutarı. Satmış olduklarınız da dahildir." />
              </div>
              <p className="text-sm font-bold text-gray-900"><Blur>₺{formatLargeNumber(plData.allTimeInvested)}</Blur></p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs text-gray-500">Toplam Satım</p>
                <InfoTooltip text="Başlangıçtan bugüne yaptığınız tüm satış işlemlerinden elde ettiğiniz toplam nakit tutarı." />
              </div>
              <p className="text-sm font-bold text-gray-900"><Blur>₺{formatLargeNumber(plData.allTimeSold)}</Blur></p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs text-gray-500">Güncel Değer</p>
                <InfoTooltip text="Şu anda portföyünüzde bulunan tüm varlıkların güncel piyasa değeri. Satmış olduklarınız dahil değildir." />
              </div>
              <p className="text-sm font-bold text-gray-900"><Blur>₺{formatLargeNumber(plData.totalCurrentValue)}</Blur></p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs text-gray-500">Maliyet Bazı</p>
                <InfoTooltip text="Şu anda portföyünüzde bulunan varlıkları satın alma maliyetiniz. Güncel Değer - Maliyet Bazı = Realize Edilmemiş Kar/Zarar" />
              </div>
              <p className="text-sm font-bold text-gray-900"><Blur>₺{formatLargeNumber(plData.totalCostBasis)}</Blur></p>
            </div>
          </div>
        </div>
      )}

      {/* Filtreli İstatistikler Bölümü - Border içinde gruplandırılmış */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border-2 border-blue-100 p-5 space-y-4">
        {/* Section Header + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            Kar & Zarar İstatistikleri
          </h3>
          <div className="flex items-center gap-1 flex-wrap">
            {visibleFilters.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeFilter === f.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
            {!showAllFilters && TIME_FILTERS.length > 4 && (
              <button
                onClick={() => setShowAllFilters(true)}
                className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active filter indicator */}
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500">
            {TIME_FILTERS.find(f => f.key === activeFilter)?.label} verilerine göre gösteriliyor
            {activeFilter !== 'all' && plData && (
              <span className="ml-1 text-gray-400">
                · {plData.totalTrades} satış işlemi
              </span>
            )}
          </span>
        </div>

      {/* 3 Highlight Cards: Realized, Unrealized, Total */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HighlightCard
          title="Realize Edilmiş K/Z"
          value={plData ? `${plData.realizedPL >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(plData.realizedPL))}` : '₺0'}
          percent={plData ? `${plData.realizedPLPct >= 0 ? '+' : ''}${plData.realizedPLPct.toFixed(2)}%` : undefined}
          icon={plData && plData.realizedPL >= 0 ? TrendingUp : TrendingDown}
          gradient={plData && plData.realizedPL >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600'}
          subtitle={plData ? `${plData.totalTrades} kapanmış işlem` : undefined}
          loading={isLoading}
        />
        <HighlightCard
          title="Realize Edilmemiş K/Z"
          value={plData ? `${plData.unrealizedPL >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(plData.unrealizedPL))}` : '₺0'}
          percent={plData ? `${plData.unrealizedPLPct >= 0 ? '+' : ''}${plData.unrealizedPLPct.toFixed(2)}%` : undefined}
          icon={plData && plData.unrealizedPL >= 0 ? TrendingUp : TrendingDown}
          gradient={plData && plData.unrealizedPL >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'}
          subtitle="Açık pozisyonlar"
          loading={isLoading}
        />
        <HighlightCard
          title="Toplam K/Z"
          value={plData ? `${plData.totalPL >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(plData.totalPL))}` : '₺0'}
          percent={plData ? `${plData.totalPLPct >= 0 ? '+' : ''}${plData.totalPLPct.toFixed(2)}%` : undefined}
          icon={plData && plData.totalPL >= 0 ? TrendingUp : TrendingDown}
          gradient={plData && plData.totalPL >= 0 ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-gradient-to-br from-rose-500 to-rose-600'}
          subtitle="Realize + Açık pozisyon"
          loading={isLoading}
        />
      </div>

      {/* Detail Stats Grid */}
      {plData && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Win Rate */}
          <StatCard
            title="Kazanma Oranı"
            value={`%${plData.winRate.toFixed(1)}`}
            subtitle={`${plData.winCount} kazanç / ${plData.lossCount} kayıp`}
            icon={Target}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            trend={plData.winRate >= 50 ? 'up' : plData.winRate > 0 ? 'down' : 'neutral'}
            tooltip="Kârlı kapanan işlemlerin toplam kapanmış işlemlere oranı. %50 üzeri iyi kabul edilir."
          />

          {/* Profit Factor */}
          <StatCard
            title="Kâr Faktörü"
            value={plData.profitFactor === Infinity ? '∞' : plData.profitFactor.toFixed(2)}
            subtitle={plData.profitFactor >= 1.5 ? 'İyi' : plData.profitFactor >= 1 ? 'Orta' : 'Zayıf'}
            icon={Scale}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            trend={plData.profitFactor >= 1.5 ? 'up' : plData.profitFactor >= 1 ? 'neutral' : 'down'}
            tooltip="Brüt kâr / Brüt zarar oranı. 1.5 üzeri iyi, 2.0 üzeri çok iyi kabul edilir."
          />

          {/* Avg Win */}
          <StatCard
            title="Ort. Kazanç"
            value={`+₺${formatLargeNumber(plData.avgWin)}`}
            subtitle={`${plData.winCount} işlemden`}
            icon={ArrowUpRight}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            trend="up"
            tooltip="Kârlı işlemlerdeki ortalama kazanç miktarı."
          />

          {/* Avg Loss */}
          <StatCard
            title="Ort. Kayıp"
            value={`-₺${formatLargeNumber(plData.avgLoss)}`}
            subtitle={`${plData.lossCount} işlemden`}
            icon={ArrowDownRight}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            trend="down"
            tooltip="Zararlı işlemlerdeki ortalama kayıp miktarı."
          />

          {/* Best Trade */}
          <StatCard
            title="En İyi İşlem"
            value={plData.bestTrade ? `+₺${formatLargeNumber(Math.max(0, plData.bestTrade.pl))}` : 'Yok'}
            subtitle={plData.bestTrade ? `${plData.bestTrade.symbol} · ${plData.bestTrade.plPct >= 0 ? '+' : ''}${plData.bestTrade.plPct.toFixed(1)}%` : undefined}
            icon={Award}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            trend="up"
            tooltip="Seçili dönemdeki en yüksek kârlı tek işlem."
          />

          {/* Worst Trade */}
          <StatCard
            title="En Kötü İşlem"
            value={plData.worstTrade ? `-₺${formatLargeNumber(Math.abs(Math.min(0, plData.worstTrade.pl)))}` : 'Yok'}
            subtitle={plData.worstTrade ? `${plData.worstTrade.symbol} · ${plData.worstTrade.plPct >= 0 ? '+' : ''}${plData.worstTrade.plPct.toFixed(1)}%` : undefined}
            icon={AlertTriangle}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            trend="down"
            tooltip="Seçili dönemdeki en yüksek zararlı tek işlem."
          />

          {/* Expectancy */}
          <StatCard
            title="Beklenti Değeri"
            value={`${plData.expectancy >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(plData.expectancy))}`}
            subtitle="İşlem başına ortalama"
            icon={Percent}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            trend={plData.expectancy >= 0 ? 'up' : 'down'}
            tooltip="Her işlemden beklenen ortalama kâr/zarar. Pozitif olması stratejinizin kârlı olduğunu gösterir."
          />

          {/* Total Fees */}
          <StatCard
            title="Toplam Komisyon"
            value={`₺${formatLargeNumber(plData.totalFees)}`}
            subtitle="Ödenen toplam ücret"
            icon={Receipt}
            iconBg="bg-gray-100"
            iconColor="text-gray-600"
            trend="neutral"
            tooltip="Seçili dönemde ödenen toplam işlem komisyonu."
          />
        </div>
      )}

      {/* Gross Profit vs Gross Loss Bar */}
      {plData && !isLoading && plData.totalTrades > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Brüt Kâr vs Brüt Zarar
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-600 font-medium">Brüt Kâr</span>
                <span className="font-semibold text-emerald-700"><Blur>+₺{formatLargeNumber(plData.realizedGrossProfit)}</Blur></span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-emerald-500 transition-all duration-700"
                  style={{
                    width: `${(plData.realizedGrossProfit + plData.realizedGrossLoss) > 0
                      ? (plData.realizedGrossProfit / (plData.realizedGrossProfit + plData.realizedGrossLoss)) * 100
                      : 0}%`
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-600 font-medium">Brüt Zarar</span>
                <span className="font-semibold text-red-700"><Blur>-₺{formatLargeNumber(plData.realizedGrossLoss)}</Blur></span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-red-500 transition-all duration-700"
                  style={{
                    width: `${(plData.realizedGrossProfit + plData.realizedGrossLoss) > 0
                      ? (plData.realizedGrossLoss / (plData.realizedGrossProfit + plData.realizedGrossLoss)) * 100
                      : 0}%`
                  }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between text-xs">
              <span className="text-gray-500">Net Realize</span>
              <span className={`font-bold ${plData.realizedPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                <Blur>{plData.realizedPL >= 0 ? '+' : '-'}₺{formatLargeNumber(Math.abs(plData.realizedPL))}</Blur>
              </span>
            </div>
          </div>
        </div>
      )}

        {/* Empty state */}
        {plData && plData.totalTrades === 0 && !isLoading && activeFilter !== 'all' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Bu dönemde kapanmış işlem bulunmuyor.</p>
            <p className="text-xs text-gray-400 mt-1">Farklı bir zaman aralığı deneyebilirsiniz.</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
                <div className="h-5 bg-gray-100 rounded w-20 mb-1" />
                <div className="h-3 bg-gray-50 rounded w-14" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
