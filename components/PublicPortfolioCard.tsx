'use client'

import Link from 'next/link'
import { Briefcase, Calendar, Check } from 'lucide-react'

interface PublicPortfolioCardProps {
  id: string
  name: string
  slug: string | null
  description: string | null
  holding_count: number
  owner_name: string
  owner_avatar: string | null
  created_at: string
  is_following?: boolean
}

export default function PublicPortfolioCard({
  name,
  slug,
  description,
  holding_count,
  owner_name,
  created_at,
  is_following = false,
}: PublicPortfolioCardProps) {
  const href = slug ? `/p/${slug}` : '#'
  const createdDate = new Date(created_at).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Link
      href={href}
      className={`group block bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
        is_following 
          ? 'border-green-300 hover:border-green-400 hover:shadow-lg shadow-green-50' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
      }`}
    >
      {/* Üst renk şeridi */}
      <div className={`h-1.5 transition-colors ${
        is_following
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 group-hover:from-green-600 group-hover:to-emerald-600'
          : 'bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-600'
      }`} />

      <div className="p-5">
        {/* Portföy adı ve takip badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate flex-1">
            {name}
          </h3>
          {is_following && (
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
              <Check className="w-3 h-3" />
              Takip Ediliyor
            </div>
          )}
        </div>

        {/* Sahip */}
        <p className="text-sm text-gray-500 mt-1">
          {owner_name}
        </p>

        {/* Açıklama */}
        {description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* İstatistikler */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Briefcase className="w-3.5 h-3.5" />
            <span className="font-medium">{holding_count}</span>
            <span>varlık</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            <span className="truncate">{createdDate} tarihinde yayınlandı</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
