'use client'

import { Holding } from '@/lib/types/database.types'
import { PriceProvider } from './PriceProvider'
import HoldingItem from './HoldingItem'

interface HoldingsListClientProps {
  holdings: Holding[]
  userId: string
  portfolioId: string
}

/**
 * Client-side wrapper for holdings list
 * Provides centralized price management to all HoldingItem components
 */
export default function HoldingsListClient({ holdings, userId, portfolioId }: HoldingsListClientProps) {
  if (holdings.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Henüz varlık eklenmemiş.</p>
        <p className="text-sm mt-2">Yukarıdaki butona tıklayarak ilk varlığınızı ekleyin.</p>
      </div>
    )
  }

  return (
    <PriceProvider holdings={holdings}>
      <div className="divide-y divide-gray-200">
        {holdings.map(holding => (
          <HoldingItem 
            key={holding.id} 
            holding={holding}
            userId={userId}
            portfolioId={portfolioId}
          />
        ))}
      </div>
    </PriceProvider>
  )
}
