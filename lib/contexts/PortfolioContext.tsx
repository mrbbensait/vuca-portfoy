'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Portfolio } from '@/lib/types/database.types'

interface PortfolioContextType {
  portfolios: Portfolio[]
  activePortfolio: Portfolio | null
  loading: boolean
  setActivePortfolio: (portfolio: Portfolio) => void
  refreshPortfolios: () => Promise<void>
  createPortfolio: (name: string) => Promise<void>
  updatePortfolio: (id: string, name: string) => Promise<void>
  deletePortfolio: (id: string) => Promise<void>
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export function PortfolioProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [activePortfolio, setActivePortfolioState] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchPortfolios = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.warn('No active session found, waiting...')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Portfolio query error:', error)
        throw error
      }

      if (data && data.length > 0) {
        setPortfolios(data)
        
        const savedPortfolioId = localStorage.getItem('activePortfolioId')
        const savedPortfolio = data.find(p => p.id === savedPortfolioId)
        
        setActivePortfolioState(savedPortfolio || data[0])
      } else {
        // Portföy bulunamadı, oluşturmayı dene
        const { data: newPortfolio, error: createError } = await supabase
          .from('portfolios')
          .insert({ user_id: userId, name: 'Varsayılan Portföy' })
          .select()
          .single()

        if (createError) {
          console.error('Portfolio create error:', createError)
          
          // Eğer trigger zaten oluşturmuşsa tekrar fetch et
          // Session timing sorunu olabilir, 500ms bekleyip tekrar dene
          await new Promise(resolve => setTimeout(resolve, 500))
          const { data: retryData, error: retryError } = await supabase
            .from('portfolios')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
          
          if (retryError || !retryData || retryData.length === 0) {
            throw createError
          }
          
          // Retry'da bulundu
          setPortfolios(retryData)
          setActivePortfolioState(retryData[0])
          return
        }

        if (newPortfolio) {
          setPortfolios([newPortfolio])
          setActivePortfolioState(newPortfolio)
        }
      }
    } catch (error: any) {
      console.error('Portfolio fetch error:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let retryCount = 0
    const maxRetries = 3
    const retryDelay = 1000

    async function fetchWithRetry() {
      if (!userId) return

      try {
        await fetchPortfolios()
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++
          console.log(`Retrying portfolio fetch (${retryCount}/${maxRetries})...`)
          setTimeout(fetchWithRetry, retryDelay)
        }
      }
    }

    fetchWithRetry()
  }, [userId])

  // Aktif portfolio değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (activePortfolio) {
      localStorage.setItem('activePortfolioId', activePortfolio.id)
    }
  }, [activePortfolio])

  const setActivePortfolio = (portfolio: Portfolio) => {
    setActivePortfolioState(portfolio)
  }

  const refreshPortfolios = async () => {
    await fetchPortfolios()
  }

  const createPortfolio = async (name: string) => {
    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Portfolio oluşturulamadı')
      }

      // Yeni portfolio oluşturuldu - otomatik seç
      await refreshPortfolios()
      
      // Yeni portfolio'yu aktif yap
      if (result.data) {
        setActivePortfolioState(result.data)
      }
    } catch (error) {
      console.error('Create portfolio error:', error)
      throw error
    }
  }

  const updatePortfolio = async (id: string, name: string) => {
    try {
      const response = await fetch('/api/portfolios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Portfolio güncellenemedi')
      }

      await refreshPortfolios()
    } catch (error) {
      console.error('Update portfolio error:', error)
      throw error
    }
  }

  const deletePortfolio = async (id: string) => {
    try {
      const response = await fetch(`/api/portfolios?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Portfolio silinemedi')
      }

      await refreshPortfolios()
    } catch (error) {
      console.error('Delete portfolio error:', error)
      throw error
    }
  }

  return (
    <PortfolioContext.Provider
      value={{
        portfolios,
        activePortfolio,
        loading,
        setActivePortfolio,
        refreshPortfolios,
        createPortfolio,
        updatePortfolio,
        deletePortfolio,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}
