'use client'

import { useEffect, useState } from 'react'
import { formatLargeNumber } from '@/lib/formatPrice'
import {
  TrendingUp, TrendingDown, DollarSign, BarChart3,
  Target, Award, AlertTriangle, Percent, Scale,
  ArrowDownRight, ArrowUpRight, Receipt, Info
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────
interface CachedStatsData {
  realizedPL: number
  unrealizedPL: number
  totalPL: number
  realizedPLPct: number
  unrealizedPLPct: number
  totalPLPct: number
  realizedGrossProfit: number
  realizedGrossLoss: number
  winCount: number
  lossCount: number
  totalTrades: number
  winRate: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  expectancy: number
  bestTrade: { symbol: string; pl: number; plPct: number } | null
  worstTrade: { symbol: string; pl: number; plPct: number } | null
  totalFees: number
  totalInvested: number
  totalSold: number
  totalCurrentValue: number
  totalCostBasis: number
  allTimeInvested: number
  allTimeSold: number
}

interface PublicProfitLossStatsProps {
  portfolioId: string
}

// ── Helpers ────────────────────────────────────────────
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
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  )
}

// ── Highlight Card ─────────────────────────────────────
interface HighlightCardProps {
  title: string
  value: string
  percent?: string
  icon: React.ElementType
  gradient: string
  subtitle?: string
  tooltip?: string
}

function HighlightCard({ title, value, percent, icon: Icon, gradient, subtitle, tooltip }: HighlightCardProps) {
  return (
    <div className={`rounded-xl shadow-lg p-5 text-white relative ${gradient}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium opacity-80 uppercase tracking-wider">{title}</span>
        <Icon className="w-5 h-5 opacity-70" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {percent && <p className="text-sm font-semibold mt-1 opacity-90">{percent}</p>}
      <div className="flex items-center justify-between mt-1">
        {subtitle ? <p className="text-xs opacity-70">{subtitle}</p> : <div />}
        {tooltip && (
          <div className="ml-auto">
            <InfoTooltip text={tooltip} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────
export default function PublicProfitLossStats({ portfolioId }: PublicProfitLossStatsProps) {
  const [stats, setStats] = useState<CachedStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/portfolio-stats?portfolio_id=${portfolioId}`)
        if (!res.ok) throw new Error('Failed to fetch stats')
        const json = await res.json()
        if (json.success && json.data) {
          setStats(json.data.stats_data)
          setUpdatedAt(json.data.updated_at)
          
          // Check cache age - if older than 24 hours, trigger background refresh
          const cacheAge = Date.now() - new Date(json.data.updated_at).getTime()
          const ageHours = cacheAge / 1000 / 60 / 60
          
          if (ageHours > 24) {
            // Trigger background refresh (don't await, let it run async)
            fetch('/api/portfolio-stats/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ portfolio_id: portfolioId }),
            }).catch(err => console.error('Background refresh failed:', err))
          }
        }
      } catch (err) {
        console.error('Failed to fetch portfolio stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [portfolioId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border-2 border-blue-100 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl shadow-lg p-5 bg-gray-200 animate-pulse h-28" />
            ))}
          </div>
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
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const pf = stats.profitFactor >= 999999 ? Infinity : stats.profitFactor

  return (
    <div className="space-y-4">
      {/* Filtreli İstatistikler Bölümü */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border-2 border-blue-100 p-5 space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            Kar & Zarar İstatistikleri
          </h3>
          {updatedAt && (
            <span className="text-[10px] text-gray-400">
              Son güncelleme: {new Date(updatedAt).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* 3 Highlight Cards: Realized, Unrealized, Total */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightCard
            title="Realize Edilmiş K/Z"
            value={`${stats.realizedPL >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(stats.realizedPL))}`}
            percent={`${stats.realizedPLPct >= 0 ? '+' : ''}${stats.realizedPLPct.toFixed(2)}%`}
            icon={stats.realizedPL >= 0 ? TrendingUp : TrendingDown}
            gradient={stats.realizedPL >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600'}
            subtitle={`${stats.totalTrades} kapanmış işlem`}
            tooltip="Tamamen kapatılmış (alım-satım tamamlanmış) işlemlerden elde edilen net kâr veya zarar. Bu değer kesinleşmiştir ve gerçekleşmiştir."
          />
          <HighlightCard
            title="Realize Edilmemiş K/Z"
            value={`${stats.unrealizedPL >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(stats.unrealizedPL))}`}
            percent={`${stats.unrealizedPLPct >= 0 ? '+' : ''}${stats.unrealizedPLPct.toFixed(2)}%`}
            icon={stats.unrealizedPL >= 0 ? TrendingUp : TrendingDown}
            gradient={stats.unrealizedPL >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'}
            subtitle="Açık pozisyonlar"
            tooltip="Halen elinizde bulunan (satılmamış) varlıkların güncel piyasa fiyatına göre kâğıt üzerindeki kâr/zarar durumu. Satış yapılana kadar bu değer değişmeye devam eder."
          />
          <HighlightCard
            title="Toplam K/Z"
            value={`${stats.totalPL >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(stats.totalPL))}`}
            percent={`${stats.totalPLPct >= 0 ? '+' : ''}${stats.totalPLPct.toFixed(2)}%`}
            icon={stats.totalPL >= 0 ? TrendingUp : TrendingDown}
            gradient={stats.totalPL >= 0 ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-gradient-to-br from-rose-500 to-rose-600'}
            subtitle="Realize + Açık pozisyon"
            tooltip="Realize edilmiş + Realize edilmemiş K/Z toplamı. Portföyünüzün genel performansını gösteren ana metrik. Kapanmış işlemlerden kazancınız ve açık pozisyonlarınızın güncel durumu bu değerde birleşir."
          />
        </div>

        {/* Detail Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Win Rate */}
          <StatCard
            title="Kazanma Oranı"
            value={`%${stats.winRate.toFixed(1)}`}
            subtitle={`${stats.winCount} kazanç / ${stats.lossCount} kayıp`}
            icon={Target}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            trend={stats.winRate >= 50 ? 'up' : stats.winRate > 0 ? 'down' : 'neutral'}
            tooltip="Kârlı kapanan işlemlerin toplam kapanmış işlemlere oranı. %50 üzeri iyi kabul edilir."
          />

          {/* Profit Factor */}
          <StatCard
            title="Kâr Faktörü"
            value={pf === Infinity ? '∞' : pf.toFixed(2)}
            subtitle={pf >= 1.5 ? 'İyi' : pf >= 1 ? 'Orta' : 'Zayıf'}
            icon={Scale}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            trend={pf >= 1.5 ? 'up' : pf >= 1 ? 'neutral' : 'down'}
            tooltip="Brüt kâr / Brüt zarar oranı. 1.5 üzeri iyi, 2.0 üzeri çok iyi kabul edilir."
          />

          {/* Avg Win */}
          <StatCard
            title="Ort. Kazanç"
            value={`+₺${formatLargeNumber(stats.avgWin)}`}
            subtitle={`${stats.winCount} işlemden`}
            icon={ArrowUpRight}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            trend="up"
            tooltip="Kârlı işlemlerdeki ortalama kazanç miktarı."
          />

          {/* Avg Loss */}
          <StatCard
            title="Ort. Kayıp"
            value={`-₺${formatLargeNumber(stats.avgLoss)}`}
            subtitle={`${stats.lossCount} işlemden`}
            icon={ArrowDownRight}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            trend="down"
            tooltip="Zararlı işlemlerdeki ortalama kayıp miktarı."
          />

          {/* Best Trade */}
          <StatCard
            title="En İyi İşlem"
            value={stats.bestTrade ? `+₺${formatLargeNumber(Math.max(0, stats.bestTrade.pl))}` : 'Yok'}
            subtitle={stats.bestTrade ? `${stats.bestTrade.symbol} · ${stats.bestTrade.plPct >= 0 ? '+' : ''}${stats.bestTrade.plPct.toFixed(1)}%` : undefined}
            icon={Award}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            trend="up"
            tooltip="En yüksek kârlı tek işlem."
          />

          {/* Worst Trade */}
          <StatCard
            title="En Kötü İşlem"
            value={stats.worstTrade ? `-₺${formatLargeNumber(Math.abs(Math.min(0, stats.worstTrade.pl)))}` : 'Yok'}
            subtitle={stats.worstTrade ? `${stats.worstTrade.symbol} · ${stats.worstTrade.plPct >= 0 ? '+' : ''}${stats.worstTrade.plPct.toFixed(1)}%` : undefined}
            icon={AlertTriangle}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            trend="down"
            tooltip="En yüksek zararlı tek işlem."
          />

          {/* Expectancy */}
          <StatCard
            title="Beklenti Değeri"
            value={`${stats.expectancy >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(stats.expectancy))}`}
            subtitle="İşlem başına ortalama"
            icon={Percent}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            trend={stats.expectancy >= 0 ? 'up' : 'down'}
            tooltip="Her işlemden beklenen ortalama kâr/zarar. Pozitif olması stratejinizin kârlı olduğunu gösterir."
          />

          {/* Total Fees */}
          <StatCard
            title="Toplam Komisyon"
            value={`₺${formatLargeNumber(stats.totalFees)}`}
            subtitle="Ödenen toplam ücret"
            icon={Receipt}
            iconBg="bg-gray-100"
            iconColor="text-gray-600"
            trend="neutral"
            tooltip="Ödenen toplam işlem komisyonu."
          />
        </div>

        {/* Gross Profit vs Gross Loss Bar */}
        {stats.totalTrades > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Brüt Kâr vs Brüt Zarar
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-600 font-medium">Brüt Kâr</span>
                  <span className="font-semibold text-emerald-700">+₺{formatLargeNumber(stats.realizedGrossProfit)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-emerald-500 transition-all duration-700"
                    style={{
                      width: `${(stats.realizedGrossProfit + stats.realizedGrossLoss) > 0
                        ? (stats.realizedGrossProfit / (stats.realizedGrossProfit + stats.realizedGrossLoss)) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-600 font-medium">Brüt Zarar</span>
                  <span className="font-semibold text-red-700">-₺{formatLargeNumber(stats.realizedGrossLoss)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-red-500 transition-all duration-700"
                    style={{
                      width: `${(stats.realizedGrossProfit + stats.realizedGrossLoss) > 0
                        ? (stats.realizedGrossLoss / (stats.realizedGrossProfit + stats.realizedGrossLoss)) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs">
                <span className="text-gray-500">Net Realize</span>
                <span className={`font-bold ${stats.realizedPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.realizedPL >= 0 ? '+' : '-'}₺{formatLargeNumber(Math.abs(stats.realizedPL))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
