/**
 * Örnek Analiz Componenti
 * 
 * Bu component usePortfolioData hook'unu kullanarak
 * otomatik olarak activePortfolio'ya göre çalışır.
 * 
 * Yeni analizler eklerken bu pattern'i takip edin!
 */

'use client'

import { usePortfolioData } from '@/lib/hooks/usePortfolioData'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { TrendingUp, DollarSign, Activity, PieChart } from 'lucide-react'
import type { Holding, Transaction } from '@/lib/types/database.types'

export default function PortfolioStatistics() {
  const { activePortfolio } = usePortfolio()
  
  // ⚡ Bu hook'lar otomatik olarak activePortfolio'ya göre çalışır
  const { data: holdings, loading: holdingsLoading } = usePortfolioData<Holding>('holdings')
  const { data: transactions, loading: transactionsLoading } = usePortfolioData<Transaction>(
    'transactions',
    { orderBy: { column: 'date', ascending: false }, limit: 100 }
  )

  // Loading state
  if (holdingsLoading || transactionsLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Portfolio seçilmemişse
  if (!activePortfolio) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Portfolio seçin
      </div>
    )
  }

  // İstatistikler hesapla
  const totalHoldings = holdings.length
  const totalTransactions = transactions.length
  const totalBuyTransactions = transactions.filter(t => t.side === 'BUY').length
  const totalSellTransactions = transactions.filter(t => t.side === 'SELL').length
  const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.avg_price), 0)

  // Varlık tipi dağılımı
  const assetTypeCount = holdings.reduce((acc, h) => {
    acc[h.asset_type] = (acc[h.asset_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          Portfolio İstatistikleri
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {activePortfolio.name} için detaylı analiz
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Toplam Varlık */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Varlık</p>
                <p className="text-2xl font-bold text-gray-900">{totalHoldings}</p>
              </div>
              <PieChart className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Toplam İşlem */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam İşlem</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalBuyTransactions} alış • {totalSellTransactions} satış
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Toplam Yatırım */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Yatırım</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₺{totalInvested.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          {/* Varlık Çeşitliliği */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Varlık Dağılımı</p>
              <div className="space-y-1">
                {Object.entries(assetTypeCount).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-700">{type}:</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Veri Yoksa */}
        {totalHoldings === 0 && (
          <div className="mt-6 text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Bu portfolyoda henüz varlık bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
