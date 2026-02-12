'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'
import { usePrices } from '@/lib/hooks/usePrices'
import { formatLargeNumber, formatLargeNumberUSD } from '@/lib/formatPrice'
import type { Holding } from '@/lib/types/database.types'
import {
  DollarSign, TrendingUp, TrendingDown,
  Landmark, Globe, Bitcoin, Coins, Award, PiggyBank,
  Shield, Target, AlertTriangle,
  BarChart3, Activity, Wallet, ArrowUpRight,
  Info, Layers, Eye, Banknote
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface PortfolioAnalysisProps {
  userId: string
}

interface UsdTryRate {
  rate: number
  timestamp: string
  cached: boolean
}

interface CategoryData {
  name: string
  icon: React.ElementType
  color: string
  bgColor: string
  value: number
  cost: number
  valueUsd: number
  costUsd: number
}

interface HoldingPerformance {
  symbol: string
  asset_type: string
  quantity: number
  avg_price: number
  current_price: number
  currency: string
  value: number
  cost: number
  profitLoss: number
  profitLossPercent: number
  weight: number
}

function CategoryCard({ data, loading }: { data: CategoryData; loading: boolean }) {
  const Icon = data.icon
  const profitLoss = data.cost > 0 ? ((data.value - data.cost) / data.cost) * 100 : null
  const isPositive = profitLoss !== null && profitLoss >= 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${data.bgColor}`}>
          <Icon className={`w-4 h-4 ${data.color}`} />
        </div>
        {profitLoss !== null && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {isPositive ? '+' : ''}{profitLoss.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-gray-500 mb-1">{data.name}</p>
      {loading ? (
        <div className="space-y-2">
          <div className="h-5 bg-gray-100 rounded animate-pulse w-24" />
          <div className="h-3 bg-gray-50 rounded animate-pulse w-16" />
        </div>
      ) : (
        <>
          <p className="text-lg font-bold text-gray-900">₺{formatLargeNumber(data.value)}</p>
          <p className="text-xs text-gray-400">${formatLargeNumberUSD(data.valueUsd)}</p>
          <div className="mt-2 pt-2 border-t border-gray-50">
            <p className="text-xs text-gray-400">Maliyet: ₺{formatLargeNumber(data.cost)}</p>
          </div>
        </>
      )}
    </div>
  )
}

function RiskGauge({ score, label }: { score: number; label: string }) {
  const getColor = () => {
    if (score >= 70) return 'text-emerald-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }
  const getBgColor = () => {
    if (score >= 70) return 'bg-emerald-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className={`font-semibold ${getColor()}`}>{score}/100</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-500 ${getBgColor()}`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
    </div>
  )
}

// Hover info tooltip
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
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

const RADIAN = Math.PI / 180
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderCustomLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.05) return null
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function PortfolioAnalysis({ userId: _userId }: PortfolioAnalysisProps) {
  const { activePortfolio } = usePortfolio()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [usdTryRate, setUsdTryRate] = useState<UsdTryRate | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const { prices, loading: pricesLoading } = usePrices(holdings)

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!activePortfolio) { setLoading(false); return }
      setLoading(true)
      const { data } = await supabase.from('holdings').select('*').eq('portfolio_id', activePortfolio.id)
      setHoldings(data || [])
      setLoading(false)
    }
    fetchHoldings()
  }, [activePortfolio?.id, supabase])

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('/api/price/quote?symbol=USD&asset_type=CASH')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setUsdTryRate({ rate: result.data.price, timestamp: result.data.timestamp, cached: result.data.cached || false })
          }
        }
      } catch (error) { console.error('USD/TRY rate error:', error) }
    }
    if (activePortfolio) fetchRate()
  }, [activePortfolio?.id])

  const analysis = useMemo(() => {
    if (!holdings.length || pricesLoading || !prices || !usdTryRate) return null

    let totalTry = 0, totalUsd = 0, totalCostTry = 0, totalCostUsd = 0
    let bist = 0, nasdaq = 0, crypto = 0, goldSilver = 0, cash = 0
    let bistCost = 0, nasdaqCost = 0, cryptoCost = 0, goldSilverCost = 0, cashCost = 0
    const hpList: HoldingPerformance[] = []

    holdings.forEach(h => {
      const pd = prices[h.symbol]
      if (!pd) return
      const val = h.quantity * pd.price
      const cost = h.quantity * h.avg_price
      let valTry = 0, costTry = 0

      if (pd.currency === 'TRY') {
        valTry = val; costTry = cost
        totalTry += val; totalUsd += val / usdTryRate.rate
        totalCostTry += cost; totalCostUsd += cost / usdTryRate.rate
      } else if (pd.currency === 'USD') {
        valTry = val * usdTryRate.rate; costTry = cost * usdTryRate.rate
        totalTry += valTry; totalUsd += val
        totalCostTry += costTry; totalCostUsd += cost
      }

      const pl = valTry - costTry
      const plPct = costTry > 0 ? (pl / costTry) * 100 : 0
      hpList.push({ symbol: h.symbol, asset_type: h.asset_type, quantity: h.quantity, avg_price: h.avg_price, current_price: pd.price, currency: pd.currency, value: valTry, cost: costTry, profitLoss: pl, profitLossPercent: plPct, weight: 0 })

      if (h.asset_type === 'TR_STOCK') { bist += valTry; bistCost += costTry }
      else if (h.asset_type === 'US_STOCK') { nasdaq += valTry; nasdaqCost += costTry }
      else if (h.asset_type === 'CRYPTO') { crypto += valTry; cryptoCost += costTry }
      else if (h.asset_type === 'CASH') {
        if (h.symbol === 'GOLD' || h.symbol === 'SILVER') { goldSilver += valTry; goldSilverCost += costTry }
        else { cash += valTry; cashCost += costTry }
      }
    })

    hpList.forEach(hp => { hp.weight = totalTry > 0 ? (hp.value / totalTry) * 100 : 0 })
    hpList.sort((a, b) => b.weight - a.weight)

    const totalPL = totalTry - totalCostTry
    const totalPLUsd = totalUsd - totalCostUsd
    const totalPLPct = totalCostTry > 0 ? (totalPL / totalCostTry) * 100 : 0

    const sorted = [...hpList].sort((a, b) => b.profitLossPercent - a.profitLossPercent)
    const best = sorted.length > 0 ? sorted[0] : null
    const worst = sorted.length > 0 ? sorted[sorted.length - 1] : null

    const chartData: { name: string; value: number; color: string }[] = []
    if (bist > 0) chartData.push({ name: 'BIST', value: bist, color: '#EF4444' })
    if (nasdaq > 0) chartData.push({ name: 'NASDAQ', value: nasdaq, color: '#3B82F6' })
    if (crypto > 0) chartData.push({ name: 'Kripto', value: crypto, color: '#F59E0B' })
    if (goldSilver > 0) chartData.push({ name: 'Kıymetli Maden', value: goldSilver, color: '#D97706' })
    if (cash > 0) chartData.push({ name: 'Nakit', value: cash, color: '#10B981' })

    const r = usdTryRate.rate
    const cats: CategoryData[] = []
    if (bist > 0 || bistCost > 0) cats.push({ name: 'BIST', icon: Landmark, color: 'text-red-600', bgColor: 'bg-red-50', value: bist, cost: bistCost, valueUsd: bist / r, costUsd: bistCost / r })
    if (nasdaq > 0 || nasdaqCost > 0) cats.push({ name: 'NASDAQ', icon: Globe, color: 'text-blue-600', bgColor: 'bg-blue-50', value: nasdaq, cost: nasdaqCost, valueUsd: nasdaq / r, costUsd: nasdaqCost / r })
    if (crypto > 0 || cryptoCost > 0) cats.push({ name: 'Kripto', icon: Bitcoin, color: 'text-orange-600', bgColor: 'bg-orange-50', value: crypto, cost: cryptoCost, valueUsd: crypto / r, costUsd: cryptoCost / r })
    if (goldSilver > 0 || goldSilverCost > 0) cats.push({ name: 'Kıymetli Maden', icon: Coins, color: 'text-amber-600', bgColor: 'bg-amber-50', value: goldSilver, cost: goldSilverCost, valueUsd: goldSilver / r, costUsd: goldSilverCost / r })
    if (cash > 0 || cashCost > 0) cats.push({ name: 'Nakit', icon: Banknote, color: 'text-emerald-600', bgColor: 'bg-emerald-50', value: cash, cost: cashCost, valueUsd: cash / r, costUsd: cashCost / r })

    // Risk/çeşitlendirme hesapları için TRY, USD, EUR nakit varlıkları hariç tut
    const cashSymbols = new Set(['TRY', 'USD', 'EUR'])
    const investHpList = hpList.filter(hp => !(hp.asset_type === 'CASH' && cashSymbols.has(hp.symbol)))
    const investTotal = investHpList.reduce((s, hp) => s + hp.value, 0)
    // Yatırım bazlı ağırlıklar (nakit hariç)
    const investWts = investHpList.map(hp => investTotal > 0 ? hp.value / investTotal : 0)
    investHpList.forEach((hp, i) => { (hp as HoldingPerformance & { investWeight: number }).investWeight = investWts[i] * 100 })

    // Diversification score (nakit hariç)
    const acScore = Math.min((investHpList.length / 10) * 40, 40)
    const hhi = investWts.reduce((s, w) => s + w * w, 0)
    const balScore = (1 - hhi) * 30
    const uTypes = new Set(investHpList.map(hp => hp.asset_type))
    const tScore = (uTypes.size / 4) * 30
    const divScore = Math.round(acScore + balScore + tScore)

    // Yoğunlaşma: nakit hariç ilk 5 yatırım varlığı
    const investSorted = [...investHpList].sort((a, b) => b.value - a.value)
    const top5Wt = investTotal > 0 ? investSorted.slice(0, 5).reduce((s, hp) => s + (hp.value / investTotal) * 100, 0) : 0
    // Risk skoru: HHI (yoğunlaşma), kategori çeşitliliği ve en büyük pozisyon ağırlığı
    const maxWeight = investWts.length > 0 ? Math.max(...investWts) * 100 : 100
    const hhiNorm = Math.max(0, (1 - hhi) * 100)
    const catNorm = Math.min((uTypes.size / 4) * 100, 100)
    const concNorm = Math.max(0, 100 - maxWeight)
    const riskScore = Math.round(hhiNorm * 0.4 + catNorm * 0.3 + concNorm * 0.3)
    let riskLevel = 'Yüksek'
    if (riskScore >= 60) riskLevel = 'Düşük'
    else if (riskScore >= 35) riskLevel = 'Orta'

    const retScore = Math.min(Math.max(totalPLPct, 0) / 5 * 40, 40)
    const overallScore = Math.round(retScore + (divScore / 100) * 30 + (riskScore / 100) * 30)

    return {
      totalTry, totalUsd, totalCostTry, totalCostUsd, totalPL, totalPLUsd, totalPLPct,
      best, worst, chartData, categories: cats, holdingPerformances: hpList,
      investHoldingPerformances: investSorted,
      diversificationScore: divScore, riskLevel, riskScore, overallScore,
      top5Weight: top5Wt, assetCount: investHpList.length, categoryCount: uTypes.size
    }
  }, [holdings, prices, pricesLoading, usdTryRate])

  const isCalc = pricesLoading || !usdTryRate

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-8 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (!activePortfolio) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Portföy Seçilmedi</h3>
        <p className="text-sm text-gray-500">Analiz için lütfen bir portföy seçin.</p>
      </div>
    )
  }

  if (!loading && holdings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Portföyünüz Boş</h3>
        <p className="text-sm text-gray-500 mb-4">Analiz yapabilmek için portföyünüze varlık eklemeniz gerekiyor.</p>
        <a href="/portfolio" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Portföye Git <ArrowUpRight className="w-4 h-4 ml-1" />
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header: Score + USD/TRY */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {analysis && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              analysis.overallScore >= 60 ? 'bg-emerald-50 text-emerald-700' :
              analysis.overallScore >= 35 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
            }`}>
              <Activity className="w-4 h-4" />
              Portföy Skoru: {analysis.overallScore}/100
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-gray-500">
            ⚡ Akıllı cache sistemi • 15dk&apos;da bir güncellenir
          </p>
          {usdTryRate && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
              <DollarSign className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-600">USD/TRY</span>
              <span className="font-semibold text-gray-900">₺{usdTryRate.rate.toFixed(4)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Toplam Değer (TRY)</span>
            <Wallet className="w-5 h-5 text-slate-400" />
          </div>
          {isCalc ? <div className="h-8 bg-slate-700 rounded animate-pulse w-32" /> : (
            <p className="text-2xl font-bold">₺{formatLargeNumber(analysis?.totalTry || 0)}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">{holdings.length} varlık</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-blue-200 uppercase tracking-wider">Toplam Değer (USD)</span>
            <DollarSign className="w-5 h-5 text-blue-300" />
          </div>
          {isCalc ? <div className="h-8 bg-blue-500 rounded animate-pulse w-32" /> : (
            <p className="text-2xl font-bold">${formatLargeNumberUSD(analysis?.totalUsd || 0)}</p>
          )}
          <p className="text-xs text-blue-200 mt-1">{holdings.length} varlık</p>
        </div>

        <div className={`rounded-xl shadow-lg p-5 text-white ${(analysis?.totalPL || 0) >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Toplam Kar/Zarar</span>
            {(analysis?.totalPL || 0) >= 0 ? <TrendingUp className="w-5 h-5 opacity-70" /> : <TrendingDown className="w-5 h-5 opacity-70" />}
          </div>
          {isCalc ? <div className="h-8 bg-white/20 rounded animate-pulse w-32" /> : (
            <>
              <p className="text-2xl font-bold">{(analysis?.totalPL || 0) >= 0 ? '+' : '-'}₺{formatLargeNumber(Math.abs(analysis?.totalPL || 0))}</p>
              <p className="text-sm font-semibold mt-1 opacity-90">{(analysis?.totalPLPct || 0) >= 0 ? '+' : ''}{(analysis?.totalPLPct || 0).toFixed(2)}%</p>
            </>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-purple-200 uppercase tracking-wider">Toplam Yatırım</span>
            <PiggyBank className="w-5 h-5 text-purple-300" />
          </div>
          {isCalc ? <div className="h-8 bg-purple-400 rounded animate-pulse w-32" /> : (
            <>
              <p className="text-2xl font-bold">₺{formatLargeNumber(analysis?.totalCostTry || 0)}</p>
              <p className="text-xs text-purple-200 mt-1">${formatLargeNumberUSD(analysis?.totalCostUsd || 0)}</p>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats: Best/Worst/Risk */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg"><Award className="w-4 h-4 text-emerald-600" /></div>
              <span className="text-xs font-medium text-gray-500">En İyi Performans</span>
            </div>
            {analysis.best ? (
              <>
                <p className="text-sm font-bold text-gray-900">{analysis.best.symbol}</p>
                <p className={`text-lg font-bold ${analysis.best.profitLossPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {analysis.best.profitLossPercent >= 0 ? '+' : ''}{analysis.best.profitLossPercent.toFixed(2)}%
                </p>
              </>
            ) : <p className="text-sm text-gray-400">Veri yok</p>}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-red-50 rounded-lg"><TrendingDown className="w-4 h-4 text-red-600" /></div>
              <span className="text-xs font-medium text-gray-500">En Kötü Performans</span>
            </div>
            {analysis.worst ? (
              <>
                <p className="text-sm font-bold text-gray-900">{analysis.worst.symbol}</p>
                <p className={`text-lg font-bold ${analysis.worst.profitLossPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {analysis.worst.profitLossPercent >= 0 ? '+' : ''}{analysis.worst.profitLossPercent.toFixed(2)}%
                </p>
              </>
            ) : <p className="text-sm text-gray-400">Veri yok</p>}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative">
            <div className="absolute top-2 right-2">
              <InfoTooltip text="Portföyünüzdeki varlıkların ne kadar dengeli dağıldığına bakılır. Tek bir varlığa çok yüklenilmişse veya sadece tek kategori varsa risk artar. Varlıklar dengeli ve farklı kategorilere yayılmışsa risk düşer." />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${analysis.riskLevel === 'Düşük' ? 'bg-emerald-50' : analysis.riskLevel === 'Orta' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <Shield className={`w-4 h-4 ${analysis.riskLevel === 'Düşük' ? 'text-emerald-600' : analysis.riskLevel === 'Orta' ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
              <span className="text-xs font-medium text-gray-500">Risk Seviyesi</span>
            </div>
            <p className={`text-lg font-bold ${analysis.riskLevel === 'Düşük' ? 'text-emerald-600' : analysis.riskLevel === 'Orta' ? 'text-yellow-600' : 'text-red-600'}`}>{analysis.riskLevel}</p>
            <p className="text-xs text-gray-400">{analysis.categoryCount} kategori · {analysis.assetCount} varlık</p>
          </div>
        </div>
      )}

      {/* Chart + Categories */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" /> Varlık Dağılımı
            </h3>
            {analysis.chartData.length > 0 ? (
              <div className="relative">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={analysis.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value" label={renderCustomLabel} labelLine={false}>
                      {analysis.chartData.map((entry, i) => (<Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`₺${formatLargeNumber(value)}`, 'Değer']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-10px' }}>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Toplam</p>
                    <p className="text-sm font-bold text-gray-900">₺{formatLargeNumber(analysis.totalTry)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {analysis.chartData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Grafik verisi yok</div>}
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-400" /> Kategori Detayları
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {analysis.categories.map(cat => (<CategoryCard key={cat.name} data={cat} loading={isCalc} />))}
            </div>
          </div>
        </div>
      )}

      {/* Risk & Concentration */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
            <div className="absolute top-4 right-4">
              <InfoTooltip text="Genel Skor: Getiriniz (%40), çeşitlendirme (%30) ve risk (%30) puanlarının toplamıdır. Çeşitlendirme: Kaç farklı varlık ve kategoriye sahipsiniz, ağırlıklar ne kadar dengeli? Risk: Tek bir varlığa veya kategoriye aşırı bağımlılık var mı? Puan yükseldikçe portföyünüz daha sağlıklı demektir." />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" /> Risk & Çeşitlendirme Analizi
            </h3>
            <div className="space-y-4">
              <RiskGauge score={analysis.overallScore} label="Genel Portföy Skoru" />
              <RiskGauge score={analysis.diversificationScore} label="Çeşitlendirme Skoru" />
              <RiskGauge score={analysis.riskScore} label="Risk Skoru" />
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
              {analysis.diversificationScore < 40 && (
                <div className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Portföyünüz yeterince çeşitlendirilmemiş. Farklı varlık sınıfları eklemeyi düşünün.</span>
                </div>
              )}
              {analysis.top5Weight > 80 && (
                <div className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Yoğunlaşma riski yüksek. İlk 5 varlık portföyün %{analysis.top5Weight.toFixed(0)}&apos;ini oluşturuyor.</span>
                </div>
              )}
              {analysis.diversificationScore >= 60 && analysis.top5Weight <= 80 && (
                <div className="flex items-start gap-2 text-xs">
                  <Info className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Portföyünüz iyi bir çeşitlendirmeye sahip. Mevcut dengeyi korumaya devam edin.</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
            <div className="absolute top-4 right-4">
              <InfoTooltip text="En ağır 5 varlığınızın portföydeki toplam payını gösterir. Bu oran %80'i geçerse portföyünüz az sayıda varlığa bağımlı hale gelir, bu da riski artırır. Genel kural: Tek bir varlık toplam portföyün %20'sini geçmemelidir." />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-400" /> Yoğunlaşma Analizi (Top 5)
            </h3>
            <div className="space-y-3">
              {analysis.investHoldingPerformances.slice(0, 5).map((hp, i) => {
                const investTotal = analysis.investHoldingPerformances.reduce((s, h) => s + h.value, 0)
                const wt = investTotal > 0 ? (hp.value / investTotal) * 100 : 0
                return (
                  <div key={hp.symbol} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900">{hp.symbol}</span>
                        <span className="text-xs font-mono text-gray-500">%{wt.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-500 ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-blue-300' : i === 3 ? 'bg-blue-200' : 'bg-blue-100'}`} style={{ width: `${Math.min(wt, 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-20 text-right">₺{formatLargeNumber(hp.value)}</span>
                  </div>
                )
              })}
            </div>
            {analysis.investHoldingPerformances.length > 5 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Diğer ({analysis.investHoldingPerformances.length - 5} varlık)</span>
                  <span>%{(100 - analysis.top5Weight).toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <div>
            <p>Fiyatlar 15 dakikada bir otomatik güncellenir. Tüm hesaplamalar güncel piyasa fiyatlarına göre yapılır.</p>
            <p className="mt-1">Portföy skoru getiri, çeşitlendirme ve risk parametrelerine göre hesaplanır (0-100).</p>
          </div>
        </div>
      </div>
    </div>
  )
}
