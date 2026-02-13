'use client'

import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, TrendingUp, TrendingDown, Minus, CalendarDays, Clock, Wallet, Plus, FileDown, BarChart3, Loader2, Trophy, ThumbsDown } from 'lucide-react'
import { usePortfolioSummary } from '@/lib/hooks/usePortfolioSummary'
import { formatLargeNumber } from '@/lib/formatPrice'
import { generateHoldingsPDF, PdfApiResponse } from '@/components/DataExport'

interface DashboardProps {
  userId: string
  displayName: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Günaydın'
  if (hour >= 12 && hour < 18) return 'İyi günler'
  if (hour >= 18 && hour < 22) return 'İyi akşamlar'
  return 'İyi geceler'
}

function getFirstName(name: string): string {
  return name.split(' ')[0]
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export default function Dashboard({ userId, displayName }: DashboardProps) {
  const { activePortfolio, loading: portfolioLoading } = usePortfolio()
  const { summary, loading: summaryLoading } = usePortfolioSummary()
  const [now, setNow] = useState(new Date())
  const [pdfLoading, setPdfLoading] = useState(false)
  const router = useRouter()

  // Canlı saat
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleDownloadPDF = async () => {
    if (!activePortfolio) return
    setPdfLoading(true)
    try {
      const response = await fetch(`/api/export/pdf?user_id=${userId}&portfolio_id=${activePortfolio.id}`)
      if (!response.ok) throw new Error('PDF oluşturulamadı')
      const result: PdfApiResponse = await response.json()
      if (!result.success) throw new Error(result.error || 'PDF verisi alınamadı')
      generateHoldingsPDF(result.data)
    } catch (err) {
      console.error('PDF download error:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  if (portfolioLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!activePortfolio) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Lütfen bir portföy seçin.</p>
        </div>
      </div>
    )
  }

  const isPositive = (summary?.totalPL ?? 0) > 0
  const isNegative = (summary?.totalPL ?? 0) < 0
  const isNeutral = !isPositive && !isNegative

  return (
    <div className="space-y-6">
      {/* Hoş Geldin + Günlük Özet Bandı */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl">
        {/* Dekoratif arka plan */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-500 blur-3xl" />
        </div>

        <div className="relative px-6 py-6 sm:px-8 sm:py-7">
          {/* Üst Satır: Selamlama + Tarih/Saat */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Sol: Selamlama */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {getGreeting()}, {getFirstName(displayName)} 👋
              </h1>
              <p className="mt-1 text-blue-200/80 text-sm sm:text-base">
                {activePortfolio.name} portföyün bugün nasıl?
              </p>
            </div>

            {/* Sağ: Tarih ve Saat */}
            <div className="flex items-center gap-4 text-sm text-blue-200/70 shrink-0">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                <span>{formatDate(now)}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono tabular-nums bg-white/10 px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>{formatTime(now)}</span>
              </div>
            </div>
          </div>

          {/* Alt Satır: Portföy Özet Bandı */}
          <div className="mt-6 pt-5 border-t border-white/10">
            {summaryLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-blue-200/60">Portföy değeri hesaplanıyor...</span>
              </div>
            ) : summary ? (
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
                {/* Toplam Değer */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-blue-300/70" />
                    <span className="text-xs uppercase tracking-wider text-blue-300/70 font-medium">
                      Portföy Değeri
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight">
                    ₺{formatLargeNumber(summary.totalTry)}
                  </div>
                </div>

                {/* Günlük Değişim */}
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${
                  isPositive 
                    ? 'bg-emerald-500/15 border border-emerald-400/20' 
                    : isNegative 
                      ? 'bg-red-500/15 border border-red-400/20' 
                      : 'bg-white/5 border border-white/10'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : isNegative ? (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  ) : (
                    <Minus className="w-5 h-5 text-blue-300/70" />
                  )}
                  <div>
                    <div className="text-xs text-blue-200/60 mb-0.5">Toplam Kar/Zarar</div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-lg font-bold ${
                        isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-blue-200'
                      }`}>
                        {isPositive ? '+' : '-'}₺{formatLargeNumber(Math.abs(summary.totalPL))}
                      </span>
                      <span className={`text-sm font-semibold px-2 py-0.5 rounded-md ${
                        isPositive 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : isNegative 
                            ? 'bg-red-500/20 text-red-300' 
                            : 'bg-white/10 text-blue-200/60'
                      }`}>
                        {isNeutral ? '0.00%' : `${summary.totalPLPct >= 0 ? '+' : ''}${summary.totalPLPct.toFixed(2)}%`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Maliyet */}
                <div className="hidden sm:block">
                  <div className="text-xs text-blue-200/50 mb-0.5">Toplam Yatırım</div>
                  <div className="text-sm font-medium text-blue-200/70">
                    ₺{formatLargeNumber(summary.totalCostTry)}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-blue-200/50">Portföy özeti yüklenemedi.</p>
            )}
          </div>
        </div>
      </div>
      {/* Hızlı Aksiyonlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => router.push('/portfolio?action=add')}
          className="group flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Varlık Ekle</p>
            <p className="text-xs text-gray-500">Yeni işlem kaydet</p>
          </div>
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="group flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-emerald-300 hover:shadow-md transition-all disabled:opacity-60"
        >
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            {pdfLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">{pdfLoading ? 'Hazırlanıyor...' : 'PDF Rapor İndir'}</p>
            <p className="text-xs text-gray-500">Portföy varlıkları raporu</p>
          </div>
        </button>

        <Link
          href="/analysis"
          className="group flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Analizi Gör</p>
            <p className="text-xs text-gray-500">Detaylı portföy analizi</p>
          </div>
        </Link>
      </div>

      {/* Günün Kazananı / Kaybedeni */}
      {summary && summary.holdingPerformances.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Top 3 Kazanan */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">En Çok Kazananlar</h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Açık pozisyonlar
              </span>
            </div>
            <div className="space-y-3">
              {summary.holdingPerformances.slice(0, 3).map((hp) => {
                const maxPct = Math.abs(summary.holdingPerformances[0]?.profitLossPercent || 1)
                const barWidth = maxPct > 0 ? Math.min((Math.abs(hp.profitLossPercent) / maxPct) * 100, 100) : 0
                return (
                  <div key={hp.symbol} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-900 w-20 truncate">{hp.symbol}</span>
                    <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold tabular-nums w-16 text-right ${
                      hp.profitLossPercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {hp.profitLossPercent >= 0 ? '+' : ''}{hp.profitLossPercent.toFixed(2)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom 3 Kaybeden */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-50">
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">En Çok Kaybedenler</h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Açık pozisyonlar
              </span>
            </div>
            <div className="space-y-3">
              {summary.holdingPerformances.slice(-3).reverse().map((hp) => {
                const worstPct = Math.abs(summary.holdingPerformances[summary.holdingPerformances.length - 1]?.profitLossPercent || 1)
                const barWidth = worstPct > 0 ? Math.min((Math.abs(hp.profitLossPercent) / worstPct) * 100, 100) : 0
                return (
                  <div key={hp.symbol} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-900 w-20 truncate">{hp.symbol}</span>
                    <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-700"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold tabular-nums w-16 text-right ${
                      hp.profitLossPercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {hp.profitLossPercent >= 0 ? '+' : ''}{hp.profitLossPercent.toFixed(2)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
