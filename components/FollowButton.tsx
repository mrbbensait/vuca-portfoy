'use client'

import { useState } from 'react'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

interface FollowButtonProps {
  portfolioId: string
  initialIsFollowing: boolean
  isLoggedIn: boolean
  onFollowChange?: (isFollowing: boolean) => void
  size?: 'sm' | 'md'
}

export default function FollowButton({
  portfolioId,
  initialIsFollowing,
  isLoggedIn,
  onFollowChange,
  size = 'md',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!isLoggedIn) {
      window.location.href = '/auth/login'
      return
    }

    setLoading(true)
    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const res = await fetch(`/api/portfolios/${portfolioId}/follow`, { method })

      if (res.ok) {
        const newState = !isFollowing
        setIsFollowing(newState)
        onFollowChange?.(newState)
      }
    } catch (error) {
      console.error('Follow toggle error:', error)
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = size === 'sm'
    ? 'px-3 py-1.5 text-xs gap-1'
    : 'px-4 py-2 text-sm gap-1.5'

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  if (loading) {
    return (
      <button
        disabled
        className={`inline-flex items-center font-medium rounded-lg border border-gray-200 bg-gray-50 text-gray-400 ${sizeClasses}`}
      >
        <Loader2 className={`${iconSize} animate-spin`} />
        <span>{isFollowing ? 'Bırakılıyor...' : 'Takip ediliyor...'}</span>
      </button>
    )
  }

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        className={`group inline-flex items-center font-medium rounded-lg border transition-all ${sizeClasses} bg-gray-100 text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200`}
      >
        <UserMinus className={`${iconSize} hidden group-hover:block`} />
        <UserPlus className={`${iconSize} group-hover:hidden`} />
        <span className="group-hover:hidden">Takip Ediliyor</span>
        <span className="hidden group-hover:inline">Takibi Bırak</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center font-medium rounded-lg transition-all shadow-sm ${sizeClasses} bg-blue-600 text-white hover:bg-blue-700`}
    >
      <UserPlus className={iconSize} />
      <span>Takip Et</span>
    </button>
  )
}
