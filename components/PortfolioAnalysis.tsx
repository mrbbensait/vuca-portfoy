'use client'

import { useEffect, useState } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'
import { usePrices } from '@/lib/hooks/usePrices'
import { formatLargeNumber } from '@/lib/formatPrice'
import type { Holding } from '@/lib/types/database.types'
import { DollarSign, TrendingUp, RefreshCw, Landmark, Globe, Bitcoin, Coins } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface PortfolioAnalysisProps {
  userId: string
}

interface UsdTryRate {
  rate: number
  timestamp: string
  cached: boolean
}

export default function PortfolioAnalysis({ userId }: PortfolioAnalysisProps) {
  const { activePortfolio } = usePortfolio()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [usdTryRate, setUsdTryRate] = useState<UsdTryRate | null>(null)
  const [fetchingRate, setFetchingRate] = useState(false)
  
  const supabase = createClient()
  const { prices, loading: pricesLoading } = usePrices(holdings)

  // Holdings'i çek
  useEffect(() => {
    const fetchHoldings = async () => {
      if (!activePortfolio) {
        setLoading(false)
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', activePortfolio.id)

      setHoldings(data || [])
      setLoading(false)
    }

    fetchHoldings()
  }, [activePortfolio?.id])

  // USD/TRY kuru çek
  useEffect(() => {
    const fetchUsdTryRate = async () => {
      setFetchingRate(true)
      try {
        // Cache kontrolü ve API çağrısı (15dk cache)
        const response = await fetch('/api/price/quote?symbol=USD&asset_type=CASH')
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setUsdTryRate({
              rate: result.data.price,
              timestamp: result.data.timestamp,
              cached: result.data.cached || false
            })
          }
        }
      } catch (error) {
        console.error('USD/TRY kuru çekme hatası:', error)
      } finally {
        setFetchingRate(false)
      }
    }

    if (activePortfolio) {
      fetchUsdTryRate()
    }
  }, [activePortfolio?.id])

  // Detaylı yatırım hesaplamaları
  const calculateInvestments = () => {
    if (!holdings.length || pricesLoading || !prices || !usdTryRate) {
      return {
        totalTry: 0,
        totalUsd: 0,
        bist: 0,
        nasdaq: 0,
        crypto: 0,
        gold: 0,
        silver: 0,
        cash: 0,
        bistCost: 0,
        nasdaqCost: 0,
        cryptoCost: 0,
        goldCost: 0,
        silverCost: 0,
        cashCost: 0,
        chartData: []
      }
    }

    let totalTry = 0
    let totalUsd = 0
    let bist = 0        // TR_STOCK güncel
    let nasdaq = 0      // US_STOCK güncel
    let crypto = 0      // CRYPTO güncel
    let gold = 0        // CASH - GOLD güncel
    let silver = 0      // CASH - SILVER güncel
    let cash = 0        // CASH - TRY, USD, EUR güncel

    let bistCost = 0        // TR_STOCK maliyet
    let nasdaqCost = 0      // US_STOCK maliyet
    let cryptoCost = 0      // CRYPTO maliyet
    let goldCost = 0        // CASH - GOLD maliyet
    let silverCost = 0      // CASH - SILVER maliyet
    let cashCost = 0        // CASH - TRY, USD, EUR maliyet

    holdings.forEach(holding => {
      const priceData = prices[holding.symbol]
      if (!priceData) return

      const currentPrice = priceData.price
      const currency = priceData.currency
      const value = holding.quantity * currentPrice
      const costBasis = holding.quantity * holding.avg_price // Maliyet (TRY bazında)

      // TRY bazında değer hesapla
      let valueInTry = 0
      if (currency === 'TRY') {
        valueInTry = value
        totalTry += value
        totalUsd += value / usdTryRate.rate
      } else if (currency === 'USD') {
        valueInTry = value * usdTryRate.rate
        totalTry += valueInTry
        totalUsd += value
      }

      // Kategorilere ayır (hem güncel hem maliyet)
      if (holding.asset_type === 'TR_STOCK') {
        bist += valueInTry
        bistCost += costBasis
      } else if (holding.asset_type === 'US_STOCK') {
        nasdaq += valueInTry
        nasdaqCost += costBasis
      } else if (holding.asset_type === 'CRYPTO') {
        crypto += valueInTry
        cryptoCost += costBasis
      } else if (holding.asset_type === 'CASH') {
        if (holding.symbol === 'GOLD') {
          gold += valueInTry
          goldCost += costBasis
        } else if (holding.symbol === 'SILVER') {
          silver += valueInTry
          silverCost += costBasis
        } else {
          // TRY, USD, EUR
          cash += valueInTry
          cashCost += costBasis
        }
      }
    })

    // Pasta grafik için data
    const chartData = []
    if (bist > 0) chartData.push({ name: 'BIST', value: bist, color: '#EF4444' })
    if (nasdaq > 0) chartData.push({ name: 'NASDAQ', value: nasdaq, color: '#3B82F6' })
    if (crypto > 0) chartData.push({ name: 'Kripto', value: crypto, color: '#F59E0B' })
    if (gold > 0) chartData.push({ name: 'Altın', value: gold, color: '#FBBF24' })
    if (silver > 0) chartData.push({ name: 'Gümüş', value: silver, color: '#9CA3AF' })
    if (cash > 0) chartData.push({ name: 'Nakit', value: cash, color: '#10B981' })

    return {
      totalTry,
      totalUsd,
      bist,
      nasdaq,
      crypto,
      gold,
      silver,
      cash,
      bistCost,
      nasdaqCost,
      cryptoCost,
      goldCost,
      silverCost,
      cashCost,
      chartData
    }
  }

  const { 
    totalTry, totalUsd, 
    bist, nasdaq, crypto, gold, silver, cash,
    bistCost, nasdaqCost, cryptoCost, goldCost, silverCost, cashCost,
    chartData 
  } = calculateInvestments()

  // Kar/Zarar yüzde hesaplama fonksiyonu
  const calculateProfitLoss = (current: number, cost: number) => {
    if (cost === 0) return null
    return ((current - cost) / cost) * 100
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (!activePortfolio) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Lütfen bir portföy seçin</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* USD/TRY Kur Göstergesi - Sağ Üst Köşe */}
      {usdTryRate && (
        <div className="flex justify-end">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <div className="text-sm">
              <span className="font-semibold text-blue-900">USD/TRY:</span>
              <span className="ml-2 text-blue-700">₺{usdTryRate.rate.toFixed(4)}</span>
              {fetchingRate && (
                <RefreshCw className="inline-block w-3 h-3 ml-2 animate-spin text-blue-600" />
              )}
            </div>
            {usdTryRate.cached && (
              <span className="text-xs text-blue-600">
                (Cache)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Toplam Kasa Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toplam Kasa - TRY */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Toplam Kasa (TRY)</h3>
            <TrendingUp className="w-6 h-6 opacity-80" />
          </div>
          
          {pricesLoading ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Hesaplanıyor...</span>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold mb-2">
                ₺{formatLargeNumber(totalTry)}
              </div>
              <div className="text-sm opacity-90">
                {holdings.length} varlık
              </div>
            </div>
          )}
        </div>

        {/* Toplam Kasa - USD */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Toplam Kasa (USD)</h3>
            <DollarSign className="w-6 h-6 opacity-80" />
          </div>
          
          {pricesLoading || !usdTryRate ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Hesaplanıyor...</span>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold mb-2">
                ${totalUsd.toFixed(2)}
              </div>
              <div className="text-sm opacity-90">
                {holdings.length} varlık
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Yatırım Dağılımı Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* BIST */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <Landmark className="w-5 h-5 text-red-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(bist, bistCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-xs text-gray-600 mb-1">BIST Yatırımı</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-lg font-bold text-gray-900">
              ₺{formatLargeNumber(bist)}
            </p>
          )}
        </div>

        {/* NASDAQ */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <Globe className="w-5 h-5 text-blue-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(nasdaq, nasdaqCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-xs text-gray-600 mb-1">NASDAQ Yatırımı</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-lg font-bold text-gray-900">
              ₺{formatLargeNumber(nasdaq)}
            </p>
          )}
        </div>

        {/* Kripto */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <Bitcoin className="w-5 h-5 text-orange-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(crypto, cryptoCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-xs text-gray-600 mb-1">Kripto Yatırımı</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-lg font-bold text-gray-900">
              ₺{formatLargeNumber(crypto)}
            </p>
          )}
        </div>

        {/* Altın */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(gold, goldCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-xs text-gray-600 mb-1">Altın Yatırımı</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-lg font-bold text-gray-900">
              ₺{formatLargeNumber(gold)}
            </p>
          )}
        </div>

        {/* Gümüş */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-500">
          <div className="flex items-center justify-between mb-2">
            <Coins className="w-5 h-5 text-gray-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(silver, silverCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-xs text-gray-600 mb-1">Gümüş Yatırımı</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-lg font-bold text-gray-900">
              ₺{formatLargeNumber(silver)}
            </p>
          )}
        </div>

        {/* Nakit */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(cash, cashCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-xs text-gray-600 mb-1">Nakit</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-lg font-bold text-gray-900">
              ₺{formatLargeNumber(cash)}
            </p>
          )}
        </div>
      </div>

      {/* Pasta Grafik */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yatırım Dağılımı</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(1)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `₺${formatLargeNumber(value)}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Ek Bilgi */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-xs text-gray-500">
          <p className="mb-1">
            ⚡ Fiyatlar otomatik olarak güncellenir (15 dakikada bir)
          </p>
          <p>
            💡 Tüm hesaplamalar güncel piyasa fiyatlarına göre yapılır
          </p>
        </div>
      </div>
    </div>
  )
}
