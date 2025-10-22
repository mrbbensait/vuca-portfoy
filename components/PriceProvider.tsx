'use client'

import { createContext, useContext, ReactNode } from 'react'
import { usePrices, Holding, PriceData, UsePricesReturn } from '@/lib/hooks/usePrices'

/**
 * 🌐 Global Price Context
 * 
 * Tüm alt bileşenler aynı fiyat state'ini paylaşır.
 * Böylece her bileşen ayrı ayrı API çağrısı yapmaz.
 * 
 * KULLANIM:
 * 1. Layout veya parent component'te wrap et:
 *    <PriceProvider holdings={holdings}>
 *      {children}
 *    </PriceProvider>
 * 
 * 2. Alt bileşenlerde kullan:
 *    const { prices, loading } = usePriceContext()
 */

type PriceContextType = UsePricesReturn

const PriceContext = createContext<PriceContextType | undefined>(undefined)

interface PriceProviderProps {
  holdings: Holding[]
  children: ReactNode
}

export function PriceProvider({ holdings, children }: PriceProviderProps) {
  const priceData = usePrices(holdings)

  return (
    <PriceContext.Provider value={priceData}>
      {children}
    </PriceContext.Provider>
  )
}

/**
 * Price Context'i kullanmak için hook
 */
export function usePriceContext(): PriceContextType {
  const context = useContext(PriceContext)
  if (context === undefined) {
    throw new Error('usePriceContext must be used within a PriceProvider')
  }
  return context
}

/**
 * Belirli bir holding için fiyat bilgisi döndüren yardımcı hook
 */
export function useHoldingPrice(symbol: string): {
  price: PriceData | null
  loading: boolean
  error: string | null
} {
  const { prices, loading, error } = usePriceContext()
  
  return {
    price: prices[symbol] || null,
    loading,
    error,
  }
}
