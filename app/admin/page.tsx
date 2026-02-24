'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Briefcase,
  ArrowLeftRight,
  UserPlus,
  TrendingUp,
  Package,
  Loader2,
  DollarSign,
  Wallet,
  PiggyBank,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface StatsData {
  overview: {
    totalUsers: number
    totalPortfolios: number
    totalHoldings: number
    totalTransactions: number
    publicPortfolios: number
    totalFollows: number
    newUsersLast7Days: number
    newTransactionsLast7Days: number
  }
  financials: {
    totalTradeVolume: number
    totalBuyVolume: number
    totalSellVolume: number
    totalInvestmentCost: number
    totalCurrentValue: number
    totalPnL: number
    totalPnLPercent: number
  }
  topSymbols: { symbol: string; count: number; asset_type: string; costValue: number; currentValue: number }[]
  assetTypeDistribution: { type: string; label: string; currentValue: number; costValue: number; holdingCount: number }[]
  dailySignups: { date: string; count: number }[]
}

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']

function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}₺${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}₺${(abs / 1_000).toFixed(1)}K`
  return `${sign}₺${abs.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) throw new Error('İstatistikler yüklenemedi')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error || 'Veriler yüklenemedi'}
      </div>
    )
  }

  const { overview, financials } = stats

  // Pie chart verisi (değer bazlı)
  const pieData = stats.assetTypeDistribution.map((d) => ({
    name: d.label,
    value: d.currentValue,
  }))

  // Günlük kayıt grafiği
  const signupChartData = stats.dailySignups.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
  }))

  const pnlColor = financials.totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600'
  const pnlBg = financials.totalPnL >= 0 ? 'bg-emerald-50' : 'bg-red-50'

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Sistem genel görünümü</p>
      </div>

      {/* Finansal Özet — Ana KPI'lar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Toplam İşlem Hacmi</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(financials.totalTradeVolume)}</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-emerald-600">Alış: {formatCurrency(financials.totalBuyVolume)}</span>
            <span className="text-red-500">Satış: {formatCurrency(financials.totalSellVolume)}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Toplam Yatırım Maliyeti</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(financials.totalInvestmentCost)}</p>
          <p className="text-xs text-gray-400 mt-2">{overview.totalHoldings} aktif pozisyon</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Güncel Toplam Değer</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(financials.totalCurrentValue)}</p>
          <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${pnlBg} ${pnlColor}`}>
            {financials.totalPnL >= 0 ? '+' : ''}{formatCurrency(financials.totalPnL)}
            {' '}({financials.totalPnLPercent >= 0 ? '+' : ''}{financials.totalPnLPercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Sistem KPI Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Kullanıcı" value={overview.totalUsers} sub={`+${overview.newUsersLast7Days} bu hafta`} color="blue" />
        <KpiCard icon={Briefcase} label="Portföy" value={overview.totalPortfolios} sub={`${overview.publicPortfolios} public`} color="purple" />
        <KpiCard icon={ArrowLeftRight} label="İşlem" value={overview.totalTransactions} sub={`+${overview.newTransactionsLast7Days} bu hafta`} color="amber" />
        <KpiCard icon={Package} label="Holding" value={overview.totalHoldings} sub={`${overview.totalFollows} takip`} color="emerald" />
      </div>

      {/* Grafikler — 2 sütun */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Varlık Tipi Dağılımı (Değer Bazlı) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-500" />
            Varlık Tipi Dağılımı (Güncel Değer)
          </h2>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={(props: any) =>
                      `${props.name} ${((props.percent as number) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatCurrency(value as number), 'Güncel Değer']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Henüz veri yok</div>
            )}
          </div>
          {/* Varlık tipi detay tablosu */}
          {stats.assetTypeDistribution.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
              {stats.assetTypeDistribution.map((d, i) => {
                const pnl = d.currentValue - d.costValue
                const pnlPct = d.costValue > 0 ? (pnl / d.costValue) * 100 : 0
                return (
                  <div key={d.type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-700 font-medium">{d.label}</span>
                      <span className="text-gray-400 text-xs">({d.holdingCount})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-900 font-medium">{formatCurrency(d.currentValue)}</span>
                      <span className={`ml-2 text-xs ${pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Günlük Kayıt Grafiği */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            Yeni Kayıtlar (Son 30 Gün)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signupChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`${value} kayıt`, 'Yeni Kullanıcı']}
                  labelFormatter={(label: any) => label}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* En Değerli Semboller */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          En Değerli Semboller (Güncel Değer)
        </h2>
        {stats.topSymbols.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-2 font-medium">Sembol</th>
                  <th className="pb-2 font-medium">Tip</th>
                  <th className="pb-2 font-medium text-center">Holding</th>
                  <th className="pb-2 font-medium text-right">Maliyet</th>
                  <th className="pb-2 font-medium text-right">Güncel Değer</th>
                  <th className="pb-2 font-medium text-right">Kâr/Zarar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.topSymbols.map((s) => {
                  const pnl = s.currentValue - s.costValue
                  const pnlPct = s.costValue > 0 ? (pnl / s.costValue) * 100 : 0
                  return (
                    <tr key={s.symbol}>
                      <td className="py-2.5 font-medium text-gray-900">{s.symbol}</td>
                      <td className="py-2.5">
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                          {s.asset_type === 'TR_STOCK' ? 'BIST' : s.asset_type === 'US_STOCK' ? 'ABD' : s.asset_type === 'CRYPTO' ? 'Kripto' : 'Nakit'}
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-gray-500">{s.count}</td>
                      <td className="py-2.5 text-right text-gray-600">{formatCurrency(s.costValue)}</td>
                      <td className="py-2.5 text-right font-medium text-gray-900">{formatCurrency(s.currentValue)}</td>
                      <td className="py-2.5 text-right">
                        <span className={`text-xs font-medium ${pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">Henüz veri yok</div>
        )}
      </div>
    </div>
  )
}

// KPI Kart Bileşeni
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  sub: string
  color: 'blue' | 'purple' | 'amber' | 'emerald'
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900">{value.toLocaleString('tr-TR')}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}
