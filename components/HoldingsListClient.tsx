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
const BOTTOM_GROUP_SYMBOLS = ['USD', 'EUR', 'GOLD', 'SILVER', 'TRY']
const BOTTOM_GROUP_ORDER: Record<string, number> = {
  USD: 0,
  EUR: 1,
  GOLD: 2,
  SILVER: 3,
  TRY: 4,
}

export default function HoldingsListClient({ holdings, userId, portfolioId }: HoldingsListClientProps) {
  if (holdings.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Henüz varlık eklenmemiş.</p>
        <p className="text-sm mt-2">Yukarıdaki butona tıklayarak ilk varlığınızı ekleyin.</p>
      </div>
    )
  }

  const bistHoldings = holdings.filter(h => h.asset_type === 'TR_STOCK')
  const abdHoldings = holdings.filter(h => h.asset_type === 'US_STOCK')
  const cryptoHoldings = holdings.filter(h => h.asset_type === 'CRYPTO')
  const bottomHoldings = holdings
    .filter(h => BOTTOM_GROUP_SYMBOLS.includes(h.symbol))
    .sort((a, b) => (BOTTOM_GROUP_ORDER[a.symbol] ?? 99) - (BOTTOM_GROUP_ORDER[b.symbol] ?? 99))

  const groups = [
    { key: 'bist', items: bistHoldings },
    { key: 'abd', items: abdHoldings },
    { key: 'crypto', items: cryptoHoldings },
  ]

  let renderedGroupCount = 0

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
        
        {/* Grouped Holdings: BIST → ABD → Kripto */}
        {groups.map(group => {
          if (group.items.length === 0) return null
          const showSeparator = renderedGroupCount > 0
          renderedGroupCount++
          return (
            <div key={group.key}>
              {showSeparator && <div className="border-t-2 border-gray-300 mx-2" />}
              {group.items.map(holding => (
                <HoldingItem 
                  key={holding.id} 
                  holding={holding}
                  userId={userId}
                  portfolioId={portfolioId}
                />
              ))}
            </div>
          )
        })}

        {/* Bottom Group: USD, EUR, Altın, Gümüş, TL */}
        {bottomHoldings.length > 0 && (
          <div>
            <div className="border-t-2 border-gray-400 mx-2" />
            {bottomHoldings.map(holding => (
              <HoldingItem 
                key={holding.id} 
                holding={holding}
                userId={userId}
                portfolioId={portfolioId}
              />
            ))}
          </div>
        )}
      </div>
    </PriceProvider>
  )
}
