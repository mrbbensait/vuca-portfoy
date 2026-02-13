'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PublicPortfolioView from '@/components/PublicPortfolioView'
import type { PublicHolding, PublicTransaction } from '@/components/PublicPortfolioView'

interface PortfolioData {
  id: string
  user_id?: string
  name: string
  slug: string | null
  description: string | null
  follower_count: number
  created_at: string
  owner_name: string
  owner_avatar: string | null
  owner_bio: string | null
}

interface PublicPortfolioClientProps {
  portfolio: PortfolioData
  holdings: PublicHolding[]
  transactions: PublicTransaction[]
  initialIsFollowing: boolean
  isLoggedIn: boolean
  isOwnPortfolio: boolean
  portfolioId: string
}

export default function PublicPortfolioClient({
  portfolio,
  holdings,
  transactions,
  initialIsFollowing,
  isLoggedIn,
  isOwnPortfolio,
  portfolioId,
}: PublicPortfolioClientProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followLoading, setFollowLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState(portfolio.follower_count)

  const handleFollow = async () => {
    if (!isLoggedIn) {
      window.location.href = '/auth/login'
      return
    }
    setFollowLoading(true)
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/follow`, { method: 'POST' })
      if (res.ok) {
        setIsFollowing(true)
        setFollowerCount(c => c + 1)
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleUnfollow = async () => {
    setFollowLoading(true)
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/follow`, { method: 'DELETE' })
      if (res.ok) {
        setIsFollowing(false)
        setFollowerCount(c => Math.max(0, c - 1))
      }
    } catch (error) {
      console.error('Unfollow error:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Keşfet
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-xl font-bold text-blue-600">Portföy Röntgeni</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Ana Panel
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PublicPortfolioView
          portfolio={{ ...portfolio, follower_count: followerCount }}
          holdings={holdings}
          transactions={transactions}
          isFollowing={isFollowing}
          onFollow={isOwnPortfolio ? undefined : handleFollow}
          onUnfollow={isOwnPortfolio ? undefined : handleUnfollow}
          followLoading={followLoading}
        />
      </main>
    </div>
  )
}
