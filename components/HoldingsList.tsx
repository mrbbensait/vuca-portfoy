import { createClient } from '@/lib/supabase/server'
import AddHoldingButton from './AddHoldingButton'
import HoldingsListClient from './HoldingsListClient'

interface HoldingsListProps {
  userId: string
}

export default async function HoldingsList({ userId }: HoldingsListProps) {
  const supabase = await createClient()
  
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  const { data: holdings } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Varlıklarım</h2>
            <p className="text-xs text-gray-500 mt-1">
              ⚡ Akıllı cache sistemi • 15dk&apos;da bir güncellenir
            </p>
          </div>
          <AddHoldingButton userId={userId} portfolioId={portfolio?.id} />
        </div>
      </div>

      <HoldingsListClient 
        holdings={holdings || []} 
        userId={userId}
        portfolioId={portfolio?.id || ''}
      />
    </div>
  )
}
