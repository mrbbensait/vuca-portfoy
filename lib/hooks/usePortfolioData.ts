/**
 * Custom Hook: Portfolio verisi çekmek için kullanılır
 * 
 * Bu hook'u kullanarak tüm yeni analizler/istatistikler
 * otomatik olarak activePortfolio'ya göre çalışacaktır.
 * 
 * @example
 * ```tsx
 * const { data: holdings, loading } = usePortfolioData('holdings')
 * const { data: transactions, loading } = usePortfolioData('transactions')
 * ```
 */

import { useEffect, useState } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'

type TableName = 'holdings' | 'transactions' | 'notes'

interface UsePortfolioDataOptions {
  /** Otomatik veri çekmeyi devre dışı bırak (manuel fetch için) */
  enabled?: boolean
  /** Supabase sorgusu için ek parametreler */
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
}

export function usePortfolioData<T = Record<string, unknown>>(
  table: TableName,
  options: UsePortfolioDataOptions = {}
) {
  const { activePortfolio } = usePortfolio()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()
  const { enabled = true, orderBy, limit } = options

  useEffect(() => {
    const fetchData = async () => {
      if (!activePortfolio || !enabled) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from(table)
          .select('*')
          .eq('portfolio_id', activePortfolio.id)

        // Sıralama
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
        }

        // Limit
        if (limit) {
          query = query.limit(limit)
        }

        const { data: result, error: queryError } = await query

        if (queryError) throw queryError

        setData(result || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Veri çekme hatası'))
        console.error(`Error fetching ${table}:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activePortfolio?.id, table, enabled, orderBy?.column, orderBy?.ascending, limit])

  const refetch = async () => {
    if (!activePortfolio) return

    setLoading(true)
    try {
      let query = supabase
        .from(table)
        .select('*')
        .eq('portfolio_id', activePortfolio.id)

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data: result, error: queryError } = await query
      if (queryError) throw queryError

      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Veri çekme hatası'))
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    refetch,
    portfolioId: activePortfolio?.id,
    portfolioName: activePortfolio?.name,
  }
}
