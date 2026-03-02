'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PublicPortfolioView from '@/components/PublicPortfolioView'
import type { PublicHolding, PublicTransaction } from '@/components/PublicPortfolioView'
import FollowButton from '@/components/FollowButton'
import PublicProfitLossStats from '@/components/PublicProfitLossStats'

interface PortfolioData {
  id: string
  user_id?: string
  name: string
  slug: string | null
  description: string | null
  created_at: string
  owner_name: string
  owner_avatar: string | null
  owner_bio: string | null
}

interface PublicPortfolioClientProps {
  portfolio: PortfolioData
  holdings: PublicHolding[]
  transactions: PublicTransaction[]
  followerCount: number
  isFollowing: boolean
  isOwnPortfolio: boolean
}

export default function PublicPortfolioClient({
  portfolio,
  holdings,
  transactions,
  followerCount,
  isFollowing,
  isOwnPortfolio,
}: PublicPortfolioClientProps) {
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
              <span className="text-xl font-bold text-blue-600">XPortfoy</span>
            </div>
            <div className="flex items-center gap-3">
              {!isOwnPortfolio && (
                <FollowButton
                  portfolioId={portfolio.id}
                  initialIsFollowing={isFollowing}
                  initialFollowerCount={followerCount}
                />
              )}
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
          portfolio={portfolio}
          holdings={holdings}
          transactions={transactions}
          isOwner={isOwnPortfolio}
        />

        {/* Kar/Zarar İstatistikleri (cached from analysis page) */}
        <div className="mt-6">
          <PublicProfitLossStats portfolioId={portfolio.id} />
        </div>
      </main>
    </div>
  )
}
