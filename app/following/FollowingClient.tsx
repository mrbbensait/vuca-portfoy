'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Loader2, Heart, Briefcase, Calendar, Compass } from 'lucide-react'
import FollowButton from '@/components/FollowButton'

interface FollowedPortfolio {
  follow_id: string
  followed_at: string
  portfolio: {
    id: string
    name: string
    slug: string | null
    description: string | null
    follower_count: number
    is_public: boolean
    created_at: string
    owner_name: string
    owner_avatar: string | null
    holding_count: number
  }
}

export default function FollowingClient() {
  const [follows, setFollows] = useState<FollowedPortfolio[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFollows = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/my-follows')
      const result = await res.json()
      if (result.success) {
        setFollows(result.data)
      }
    } catch (error) {
      console.error('Fetch follows error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFollows()
  }, [])

  const handleUnfollow = (portfolioId: string) => {
    setFollows(prev => prev.filter(f => f.portfolio.id !== portfolioId))
  }

  return (
    <>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Takip Ettiklerim</h1>
          </div>
          <p className="text-sm text-gray-500">
            Takip ettiğiniz public portföyleri buradan görüntüleyebilirsiniz.
          </p>
        </div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Compass className="w-4 h-4" />
          Keşfet
        </Link>
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-sm text-gray-500">Yükleniyor...</p>
        </div>
      ) : follows.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Henüz takip ettiğiniz portföy yok</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Keşfet sayfasından ilginizi çeken portföyleri takip edin.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Portföyleri Keşfet
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            <span className="font-medium text-gray-700">{follows.length}</span> portföy takip ediyorsunuz
          </p>

          <div className="space-y-3">
            {follows.map(({ follow_id, followed_at, portfolio }) => {
              const href = portfolio.slug ? `/p/${portfolio.slug}` : '#'
              const followedDate = new Date(followed_at).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })

              return (
                <div
                  key={follow_id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all overflow-hidden"
                >
                  <div className="flex items-center justify-between p-5">
                    <Link href={href} className="flex-1 min-w-0 group">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {portfolio.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {portfolio.owner_name}
                          </p>
                          {portfolio.description && (
                            <p className="text-sm text-gray-600 mt-1.5 line-clamp-1">
                              {portfolio.description}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <Users className="w-3 h-3" />
                              {portfolio.follower_count} takipçi
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <Briefcase className="w-3 h-3" />
                              {portfolio.holding_count} varlık
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {followedDate}&apos;den beri takip
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="ml-4 flex-shrink-0">
                      <FollowButton
                        portfolioId={portfolio.id}
                        initialIsFollowing={true}
                        isLoggedIn={true}
                        size="sm"
                        onFollowChange={(isFollowing) => {
                          if (!isFollowing) handleUnfollow(portfolio.id)
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
