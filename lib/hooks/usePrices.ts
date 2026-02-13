'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * 🎯 Merkezi Fiyat Yönetimi Hook
 * 
 * ÖZELLİKLER:
 * - ✅ Tek seferlik batch fetch (N+1 önleme)
 * - ✅ Otomatik 5 dakikada bir yenileme
 * - ✅ Tüm bileşenler aynı state'i kullanır
 * - ✅ Re-render optimizasyonu
 * 
 * KULLANIM:
 * const { prices, loading, error, refresh } = usePrices(holdings)
 */

export interface Holding {
  symbol: string
  asset_type: string
  quantity: number
  avg_price: number
}

export interface PriceData {
  symbol: string
  name: string
  price: number
  currency: string
  timestamp: string
  cached?: boolean
}

export interface UsePricesReturn {
  prices: Record<string, PriceData>
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// Global cache için singleton pattern
const GLOBAL_PRICE_CACHE: Record<string, PriceData> = {}
const CACHE_TIMESTAMP: Record<string, number> = {}
const CACHE_TTL = 15 * 60 * 1000 // 15 dakika

export function usePrices(holdings: Holding[]): UsePricesReturn {
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(holdings.length > 0)
  const [error, setError] = useState<string | null>(null)
  const isFetchingRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPrices = useCallback(async () => {
    // Aynı anda birden fazla fetch önleme
    if (isFetchingRef.current || holdings.length === 0) return

    isFetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      // 1. Global cache'i kontrol et (component arası paylaşım)
      const now = Date.now()
      const cachedPrices: Record<string, PriceData> = {}
      const needsFetch: Holding[] = []

      holdings.forEach(holding => {
        const cacheKey = `${holding.symbol}_${holding.asset_type}`
        const cachedData = GLOBAL_PRICE_CACHE[cacheKey]
        const cacheTime = CACHE_TIMESTAMP[cacheKey]

        // Cache geçerliyse kullan
        if (cachedData && cacheTime && (now - cacheTime) < CACHE_TTL) {
          cachedPrices[holding.symbol] = cachedData
        } else {
          needsFetch.push(holding)
        }
      })

      // 2. Eğer hepsi cache'den geldiyse, fetch'e gerek yok
      if (needsFetch.length === 0) {
        setPrices(cachedPrices)
        setLoading(false)
        isFetchingRef.current = false
        return
      }

      // 3. Eksik fiyatları batch olarak çek
      const response = await fetch('/api/price/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdings: needsFetch,
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Çok fazla istek. Lütfen bekleyin.')
        }
        throw new Error('Fiyat bilgileri alınamadı')
      }

      const result = await response.json()

      if (result.success) {
        // 4. Yeni fiyatları global cache'e kaydet
        Object.entries(result.data as Record<string, PriceData>).forEach(([symbol, data]) => {
          const holding = holdings.find(h => h.symbol === symbol)
          if (holding) {
            const cacheKey = `${holding.symbol}_${holding.asset_type}`
            GLOBAL_PRICE_CACHE[cacheKey] = data
            CACHE_TIMESTAMP[cacheKey] = now
            cachedPrices[symbol] = data
          }
        })

        setPrices(cachedPrices)

        // Hata varsa konsola yaz
        if (result.errors && result.errors.length > 0) {
          console.warn('Bazı fiyatlar alınamadı:', result.errors)
        }
      } else {
        throw new Error(result.error || 'Beklenmeyen hata')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fiyat bilgileri alınamadı'
      setError(errorMessage)
      console.error('Price fetch error:', err)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [holdings])

  // İlk yükleme ve holding değişikliklerinde fetch
  useEffect(() => {
    if (holdings.length === 0) {
      setLoading(false)
      return
    }
    fetchPrices()
  }, [fetchPrices, holdings.length])

  // 15 dakikada bir otomatik yenileme
  useEffect(() => {
    // Önceki interval'i temizle
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Yeni interval kur
    intervalRef.current = setInterval(() => {
      fetchPrices()
    }, CACHE_TTL) // 15 dakika

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchPrices])

  return {
    prices,
    loading,
    error,
    refresh: fetchPrices,
  }
}

/**
 * Tekil fiyat çekme fonksiyonu (eski kod uyumluluğu için)
 */
export async function fetchSinglePrice(symbol: string, assetType: string): Promise<PriceData | null> {
  try {
    const response = await fetch(
      `/api/price/quote?symbol=${encodeURIComponent(symbol)}&asset_type=${assetType}`,
      { cache: 'no-store' }
    )

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        return result.data
      }
    }
    return null
  } catch (error) {
    console.error('Fiyat çekme hatası:', error)
    return null
  }
}
