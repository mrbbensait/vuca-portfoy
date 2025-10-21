import { getMockHoldings, getMockPortfolio } from '@/lib/mock-data'
import AddHoldingButton from './AddHoldingButton'
import HoldingItem from './HoldingItem'

interface HoldingsListProps {
  userId: string
}

export default async function HoldingsList({ userId }: HoldingsListProps) {
  const { data: portfolio } = await getMockPortfolio()
  const { data: holdings } = await getMockHoldings()

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Varlıklarım</h2>
          <AddHoldingButton userId={userId} portfolioId={portfolio?.id} />
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {!holdings || holdings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Henüz varlık eklenmemiş.</p>
            <p className="text-sm mt-2">Yukarıdaki butona tıklayarak ilk varlığınızı ekleyin.</p>
          </div>
        ) : (
          holdings.map(holding => (
            <HoldingItem 
              key={holding.id} 
              holding={holding}
              userId={userId}
              portfolioId={portfolio?.id || ''}
            />
          ))
        )}
      </div>
    </div>
  )
}
