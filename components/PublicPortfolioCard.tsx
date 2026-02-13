'use client'

import Link from 'next/link'
import { Briefcase, Calendar } from 'lucide-react'

interface PublicPortfolioCardProps {
  id: string
  name: string
  slug: string | null
  description: string | null
  holding_count: number
  owner_name: string
  owner_avatar: string | null
  created_at: string
}

export default function PublicPortfolioCard({
  name,
  slug,
  description,
  holding_count,
  owner_name,
  created_at,
}: PublicPortfolioCardProps) {
  const href = slug ? `/p/${slug}` : '#'
  const createdDate = new Date(created_at).toLocaleDateString('tr-TR', {
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link
      href={href}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Üst renk şeridi */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-600 transition-colors" />

      <div className="p-5">
        {/* Portföy adı */}
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
          {name}
        </h3>

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
            <span>{createdDate}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
