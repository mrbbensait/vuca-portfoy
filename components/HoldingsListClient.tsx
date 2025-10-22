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
      <div>
        {/* Desktop Header */}
        <div className="hidden lg:grid lg:grid-cols-10 gap-3 px-4 py-2 bg-gray-100 border-b-2 border-gray-300 font-semibold text-[11px] text-gray-700 uppercase tracking-wide">
          <div>Sembol</div>
          <div className="text-right">Miktar</div>
          <div className="text-right">Maliyet</div>
          <div className="text-right">Güncel Fiyat</div>
          <div className="text-right">Toplam Alış</div>
          <div className="text-right">Güncel Toplam</div>
          <div className="text-right">% K/Z</div>
          <div className="text-right">Kar/Zarar</div>
          <div className="text-right">Eklenme</div>
          <div className="text-right">İşlem</div>
        </div>
        
        {/* Holdings List */}
        <div>
          {holdings.map(holding => (
            <HoldingItem 
              key={holding.id} 
              holding={holding}
              userId={userId}
              portfolioId={portfolioId}
            />
          ))}
        </div>
      </div>
    </PriceProvider>
  )
}
