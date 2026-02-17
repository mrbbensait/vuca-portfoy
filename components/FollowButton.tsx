'use client'

import { useState } from 'react'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'

interface FollowButtonProps {
  portfolioId: string
  initialIsFollowing: boolean
  initialFollowerCount: number
}

export default function FollowButton({
  portfolioId,
  initialIsFollowing,
  initialFollowerCount,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (isFollowing) {
        // Takibi bırak
        const res = await fetch(`/api/portfolios/${portfolioId}/follow`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setIsFollowing(false)
          setFollowerCount(prev => Math.max(0, prev - 1))
        }
      } else {
        // Takip et
        const res = await fetch(`/api/portfolios/${portfolioId}/follow`, {
          method: 'POST',
        })
        if (res.ok) {
          setIsFollowing(true)
          setFollowerCount(prev => prev + 1)
        } else {
          const data = await res.json()
          if (res.status === 409) {
            // Zaten takip ediyor
            setIsFollowing(true)
          } else {
            console.error('Follow error:', data.error)
          }
        }
      }
    } catch (error) {
      console.error('Follow toggle error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
          isFollowing
            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
            : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isFollowing ? (
          <UserCheck className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
      </button>
      <span className="text-sm text-gray-500">
        <span className="font-medium text-gray-700">{followerCount}</span> takipçi
      </span>
    </div>
  )
}
