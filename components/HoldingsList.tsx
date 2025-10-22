'use client'

import { useEffect, useState } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'
import AddTransactionButton from './AddTransactionButton'
import HoldingsListClient from './HoldingsListClient'
import type { Holding } from '@/lib/types/database.types'

interface HoldingsListProps {
  userId: string
}

export default function HoldingsList({ userId }: HoldingsListProps) {
  const { activePortfolio } = usePortfolio()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!activePortfolio) return

      setLoading(true)
      const { data } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', activePortfolio.id)
        .order('created_at', { ascending: true }) // En eski üstte, en yeni altta

      setHoldings(data || [])
      setLoading(false)
    }

    fetchHoldings()
  }, [activePortfolio?.id])

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Varlıklarım</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">
              ⚡ Akıllı cache sistemi • 15dk&apos;da bir güncellenir
            </p>
          </div>
          <AddTransactionButton userId={userId} />
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Yükleniyor...</div>
      ) : (
        <HoldingsListClient 
          holdings={holdings} 
          userId={userId}
          portfolioId={activePortfolio?.id || ''}
        />
      )}
    </div>
  )
}
