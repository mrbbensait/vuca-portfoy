'use client'

import { useEffect, useState, useMemo } from 'react'
import { formatLargeNumber, getDisplaySymbol } from '@/lib/formatPrice'
import { calculateTransactionProfitLoss } from '@/lib/calculations'
import { usePrices } from '@/lib/hooks/usePrices'
import type { PriceData } from '@/lib/hooks/usePrices'
import {
  TrendingUp, TrendingDown, DollarSign, BarChart3,
  Target, Award, AlertTriangle, Percent, Scale,
  ArrowDownRight, ArrowUpRight, Receipt, Info
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────
interface PublicHoldingInput {
  symbol: string
  asset_type: string
  quantity: number
  avg_price: number
  currency?: string
}

interface PublicTransactionInput {
  id: string
  symbol: string
  asset_type: string
  side: string
  currency?: string
  quantity: number
  price: number
  fee: number | null
  date: string
}

interface PublicProfitLossStatsProps {
  holdings: PublicHoldingInput[]
  transactions: PublicTransactionInput[]
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
  loading: boolean
  tooltip?: string
}

function HighlightCard({ title, value, percent, icon: Icon, gradient, subtitle, loading, tooltip }: HighlightCardProps) {
  return (
    <div className={`rounded-xl shadow-lg p-5 text-white relative ${gradient}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium opacity-80 uppercase tracking-wider">{title}</span>
        <Icon className="w-5 h-5 opacity-70" />
      </div>
      {loading ? (
        <div className="h-8 bg-white/20 rounded animate-pulse w-32" />
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────
export default function PublicProfitLossStats({ holdings, transactions }: PublicProfitLossStatsProps) {
  const [usdTryRate, setUsdTryRate] = useState<number | null>(null)

  // usePrices için holdings formatı (quantity/avg_price zorunlu)
  const holdingsForPricing = useMemo(() => holdings, [holdings])
  const { prices, loading: pricesLoading } = usePrices(holdingsForPricing)

  // USD/TRY kuru
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('/api/price/quote?symbol=USD&asset_type=CASH')
        if (res.ok) {
          const result = await res.json()
          if (result.success && result.data) setUsdTryRate(result.data.price)
        }
      } catch (err) {
        console.error('USD/TRY rate error:', err)
      }
    }
    fetchRate()
  }, [])

  // ── P&L Calculations (aynı mantık: ProfitLossSection.tsx) ──
  const plData = useMemo(() => {
    if (pricesLoading || !usdTryRate || !prices || transactions.length === 0) return null

    // FIFO realized P&L
    // calculateTransactionProfitLoss Transaction tipini bekliyor; burada uyumlu alanlar yeterli
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allProfitLoss = calculateTransactionProfitLoss(transactions as any)

    const sellTx = transactions.filter(tx => tx.side === 'SELL')
    let realizedPL = 0
    let realizedGrossProfit = 0
    let realizedGrossLoss = 0
    let winCount = 0
    let lossCount = 0
    let bestTradeData: { symbol: string; asset_type: string; pl: number; plPct: number } | null = null
    let worstTradeData: { symbol: string; asset_type: string; pl: number; plPct: number } | null = null
    let totalFees = 0

    sellTx.forEach(tx => {
      const plInfo = allProfitLoss.get(tx.id)
      if (!plInfo || plInfo.profit_loss === null) return

      const pl = plInfo.profit_loss
      const plPct = plInfo.profit_loss_percent || 0
      realizedPL += pl

      if (pl >= 0) { realizedGrossProfit += pl; winCount++ }
      else { realizedGrossLoss += Math.abs(pl); lossCount++ }

      if (!bestTradeData || pl > bestTradeData.pl)
        bestTradeData = { symbol: tx.symbol, asset_type: tx.asset_type, pl, plPct }
      if (!worstTradeData || pl < worstTradeData.pl)
        worstTradeData = { symbol: tx.symbol, asset_type: tx.asset_type, pl, plPct }
    })

    transactions.forEach(tx => { totalFees += tx.fee || 0 })

    // Unrealized P&L (canlı fiyatlarla)
    let unrealizedPL = 0
    let totalCurrentValue = 0
    let totalCostBasis = 0

    holdings.forEach(h => {
      const pd = prices[h.symbol] as PriceData | undefined
      if (!pd) return

      let currentValueTry = 0
      let costTry = 0

      if (pd.currency === 'TRY') currentValueTry = h.quantity * pd.price
      else if (pd.currency === 'USD') currentValueTry = h.quantity * pd.price * usdTryRate

      const holdingCurrency = h.currency || (h.asset_type === 'TR_STOCK' || h.asset_type === 'CASH' ? 'TRY' : 'USD')
      if (holdingCurrency === 'TRY') costTry = h.quantity * h.avg_price
      else if (holdingCurrency === 'USD') costTry = h.quantity * h.avg_price * usdTryRate

      totalCurrentValue += currentValueTry
      totalCostBasis += costTry
    })

    unrealizedPL = totalCurrentValue - totalCostBasis

    // All-time cash flow (aynı mantık: pd.currency ile dönüşüm)
    let allTimeInvested = 0
    let allTimeSold = 0

    transactions.filter(tx => tx.side === 'BUY').forEach(tx => {
      const pd = prices[tx.symbol] as PriceData | undefined
      if (!pd) { allTimeInvested += tx.quantity * tx.price; return }
      if (pd.currency === 'TRY') allTimeInvested += tx.quantity * tx.price
      else if (pd.currency === 'USD') allTimeInvested += tx.quantity * tx.price * usdTryRate
    })

    transactions.filter(tx => tx.side === 'SELL').forEach(tx => {
      const pd = prices[tx.symbol] as PriceData | undefined
      if (!pd) { allTimeSold += tx.quantity * tx.price; return }
      if (pd.currency === 'TRY') allTimeSold += tx.quantity * tx.price
      else if (pd.currency === 'USD') allTimeSold += tx.quantity * tx.price * usdTryRate
    })

    // Derived metrics
    const totalTrades = sellTx.length
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0
    const profitFactor = realizedGrossLoss > 0
      ? realizedGrossProfit / realizedGrossLoss
      : realizedGrossProfit > 0 ? Infinity : 0
    const avgWin = winCount > 0 ? realizedGrossProfit / winCount : 0
    const avgLoss = lossCount > 0 ? realizedGrossLoss / lossCount : 0
    const expectancy = totalTrades > 0 ? realizedPL / totalTrades : 0
    const totalPL = realizedPL + unrealizedPL
    const realizedPLPct = totalCostBasis > 0 ? (realizedPL / totalCostBasis) * 100 : 0
    const unrealizedPLPct = totalCostBasis > 0 ? (unrealizedPL / totalCostBasis) * 100 : 0
    const totalPLPct = totalCostBasis > 0 ? (totalPL / totalCostBasis) * 100 : 0

    return {
      realizedPL, unrealizedPL, totalPL,
      realizedPLPct, unrealizedPLPct, totalPLPct,
      realizedGrossProfit, realizedGrossLoss,
      winCount, lossCount, totalTrades, winRate,
      profitFactor, avgWin, avgLoss, expectancy,
      bestTrade: bestTradeData as { symbol: string; asset_type: string; pl: number; plPct: number } | null,
      worstTrade: worstTradeData as { symbol: string; asset_type: string; pl: number; plPct: number } | null,
      totalFees, totalCurrentValue, totalCostBasis,
      allTimeInvested, allTimeSold,
    }
  }, [holdings, transactions, prices, pricesLoading, usdTryRate])

  const isLoading = pricesLoading || !usdTryRate

  if (isLoading && !plData) {
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

  if (!plData) return null

  const pf = plData.profitFactor === Infinity ? Infinity : plData.profitFactor

  return (
    <div className="space-y-4">
      {/* Nakit Akış Özeti */}
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
            <p className="text-sm font-bold text-gray-900">₺{formatLargeNumber(plData.allTimeInvested)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-500">Toplam Satım</p>
              <InfoTooltip text="Başlangıçtan bugüne yaptığınız tüm satış işlemlerinden elde ettiğiniz toplam nakit tutarı." />
            </div>
            <p className="text-sm font-bold text-gray-900">₺{formatLargeNumber(plData.allTimeSold)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-500">Güncel Değer</p>
              <InfoTooltip text="Şu anda portföyde bulunan tüm varlıkların güncel piyasa değeri." />
            </div>
            <p className="text-sm font-bold text-gray-900">₺{formatLargeNumber(plData.totalCurrentValue)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-500">Maliyet Bazı</p>
              <InfoTooltip text="Portföydeki varlıkların satın alma maliyeti. Güncel Değer - Maliyet Bazı = Realize Edilmemiş K/Z" />
            </div>
            <p className="text-sm font-bold text-gray-900">₺{formatLargeNumber(plData.totalCostBasis)}</p>
          </div>
        </div>
      </div>

      {/* Kar & Zarar İstatistikleri */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border-2 border-blue-100 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          Kar & Zarar İstatistikleri
        </h3>

        {/* 3 Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightCard
            title="Realize Edilmiş K/Z"
            value={`${plData.realizedPL >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(plData.realizedPL))}`}
            percent={`${plData.realizedPLPct >= 0 ? '+' : ''}${plData.realizedPLPct.toFixed(2)}%`}
            icon={plData.realizedPL >= 0 ? TrendingUp : TrendingDown}
            gradient={plData.realizedPL >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600'}
            subtitle={`${plData.totalTrades} kapanmış işlem`}
            loading={isLoading}
            tooltip="Tamamen kapatılmış işlemlerden elde edilen net kâr veya zarar (FIFO yöntemi)."
          />
          <HighlightCard
            title="Realize Edilmemiş K/Z"
            value={`${plData.unrealizedPL >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(plData.unrealizedPL))}`}
            percent={`${plData.unrealizedPLPct >= 0 ? '+' : ''}${plData.unrealizedPLPct.toFixed(2)}%`}
            icon={plData.unrealizedPL >= 0 ? TrendingUp : TrendingDown}
            gradient={plData.unrealizedPL >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'}
            subtitle="Açık pozisyonlar"
            loading={isLoading}
            tooltip="Halen elde bulunan varlıkların güncel piyasa fiyatına göre kâğıt üzerindeki kâr/zarar durumu."
          />
          <HighlightCard
            title="Toplam K/Z"
            value={`${plData.totalPL >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(plData.totalPL))}`}
            percent={`${plData.totalPLPct >= 0 ? '+' : ''}${plData.totalPLPct.toFixed(2)}%`}
            icon={plData.totalPL >= 0 ? TrendingUp : TrendingDown}
            gradient={plData.totalPL >= 0 ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-gradient-to-br from-rose-500 to-rose-600'}
            subtitle="Realize + Açık pozisyon"
            loading={isLoading}
            tooltip="Realize edilmiş + Realize edilmemiş K/Z toplamı."
          />
        </div>

        {/* Detail Stats */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
            <StatCard
              title="En İyi İşlem"
              value={plData.bestTrade ? `+₺${formatLargeNumber(Math.max(0, plData.bestTrade.pl))}` : 'Yok'}
              subtitle={plData.bestTrade ? `${getDisplaySymbol(plData.bestTrade.symbol, plData.bestTrade.asset_type || 'CRYPTO')} · ${plData.bestTrade.plPct >= 0 ? '+' : ''}${plData.bestTrade.plPct.toFixed(1)}%` : undefined}
              icon={Award}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              trend="up"
              tooltip="En yüksek kârlı tek işlem."
            />
            <StatCard
              title="En Kötü İşlem"
              value={plData.worstTrade ? `-₺${formatLargeNumber(Math.abs(Math.min(0, plData.worstTrade.pl)))}` : 'Yok'}
              subtitle={plData.worstTrade ? `${getDisplaySymbol(plData.worstTrade.symbol, plData.worstTrade.asset_type || 'CRYPTO')} · ${plData.worstTrade.plPct >= 0 ? '+' : ''}${plData.worstTrade.plPct.toFixed(1)}%` : undefined}
              icon={AlertTriangle}
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
              trend="down"
              tooltip="En yüksek zararlı tek işlem."
            />
            <StatCard
              title="Beklenti Değeri"
              value={`${plData.expectancy >= 0 ? '+' : '-'}₺${formatLargeNumber(Math.abs(plData.expectancy))}`}
              subtitle="İşlem başına ortalama"
              icon={Percent}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              trend={plData.expectancy >= 0 ? 'up' : 'down'}
              tooltip="Her işlemden beklenen ortalama kâr/zarar. Pozitif olması stratejinin kârlı olduğunu gösterir."
            />
            <StatCard
              title="Toplam Komisyon"
              value={`₺${formatLargeNumber(plData.totalFees)}`}
              subtitle="Ödenen toplam ücret"
              icon={Receipt}
              iconBg="bg-gray-100"
              iconColor="text-gray-600"
              trend="neutral"
              tooltip="Ödenen toplam işlem komisyonu."
            />
          </div>
        )}

        {/* Brüt Kâr vs Brüt Zarar */}
        {!isLoading && plData.totalTrades > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Brüt Kâr vs Brüt Zarar
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-600 font-medium">Brüt Kâr</span>
                  <span className="font-semibold text-emerald-700">+₺{formatLargeNumber(plData.realizedGrossProfit)}</span>
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
                  <span className="font-semibold text-red-700">-₺{formatLargeNumber(plData.realizedGrossLoss)}</span>
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
                  {plData.realizedPL >= 0 ? '+' : '-'}₺{formatLargeNumber(Math.abs(plData.realizedPL))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
