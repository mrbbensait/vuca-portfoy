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
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        setPortfolios(data)
        
        // LocalStorage'dan aktif portfolio ID'yi al
        const savedPortfolioId = localStorage.getItem('activePortfolioId')
        const savedPortfolio = data.find(p => p.id === savedPortfolioId)
        
        // Eğer kayıtlı portfolio varsa onu, yoksa ilkini seç
        setActivePortfolioState(savedPortfolio || data[0])
      } else {
        // Hiç portfolio yoksa oluştur
        const { data: newPortfolio, error: createError } = await supabase
          .from('portfolios')
          .insert({ user_id: userId, name: 'Varsayılan Portföy' })
          .select()
          .single()

        if (createError) throw createError

        if (newPortfolio) {
          setPortfolios([newPortfolio])
          setActivePortfolioState(newPortfolio)
        }
      }
    } catch (error) {
      console.error('Portfolio fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchPortfolios()
    }
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
