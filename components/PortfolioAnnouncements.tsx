'use client'

import { useState, useCallback } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import AnnouncementsList from './AnnouncementsList'
import AddAnnouncementButton from './AddAnnouncementButton'
import type { PortfolioAnnouncement } from '@/lib/types/database.types'

interface PortfolioAnnouncementsProps {
  userId: string
}

export default function PortfolioAnnouncements({ userId }: PortfolioAnnouncementsProps) {
  const { activePortfolio } = usePortfolio()
  const [editingAnnouncement, setEditingAnnouncement] = useState<PortfolioAnnouncement | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAnnouncementAdded = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const handleEdit = useCallback((announcement: PortfolioAnnouncement) => {
    setEditingAnnouncement(announcement)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingAnnouncement(null)
  }, [])

  // Portföy public değilse veya yoksa hiçbir şey gösterme
  if (!activePortfolio?.is_public || !activePortfolio) {
    return null
  }

  return (
    <AnnouncementsList
      key={refreshKey}
      portfolioId={activePortfolio.id}
      userId={userId}
      isOwner={true}
      onEdit={handleEdit}
      onAnnouncementAdded={handleAnnouncementAdded}
      editingAnnouncement={editingAnnouncement}
      onCancelEdit={handleCancelEdit}
    />
  )
}
