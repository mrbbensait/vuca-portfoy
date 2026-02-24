'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Megaphone, Trash2, Pin, PinOff, Edit, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import AddAnnouncementButton from './AddAnnouncementButton'
import type { PortfolioAnnouncement } from '@/lib/types/database.types'

interface AnnouncementsListProps {
  portfolioId: string
  userId?: string
  isOwner?: boolean
  onEdit?: (announcement: PortfolioAnnouncement) => void
  onAnnouncementAdded?: () => void
  editingAnnouncement?: PortfolioAnnouncement | null
  onCancelEdit?: () => void
}

export default function AnnouncementsList({ 
  portfolioId, 
  userId,
  isOwner = false, 
  onEdit,
  onAnnouncementAdded,
  editingAnnouncement,
  onCancelEdit
}: AnnouncementsListProps) {
  const [announcements, setAnnouncements] = useState<PortfolioAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingPinId, setTogglingPinId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set())
  
  const supabase = createClient()

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('portfolio_announcements')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    setAnnouncements(data || [])
    setLoading(false)
  }, [portfolioId])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) return
    
    setDeletingId(announcementId)
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, { method: 'DELETE' })
      if (response.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== announcementId))
      }
    } catch (err) {
      console.error('Duyuru silinirken hata:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePin = async (announcement: PortfolioAnnouncement) => {
    setTogglingPinId(announcement.id)
    try {
      const response = await fetch(`/api/announcements/${announcement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: !announcement.is_pinned }),
      })
      
      if (response.ok) {
        await fetchAnnouncements()
      }
    } catch (err) {
      console.error('Pin durumu değiştirilirken hata:', err)
    } finally {
      setTogglingPinId(null)
    }
  }

  const toggleAnnouncementExpand = (announcementId: string) => {
    setExpandedAnnouncements(prev => {
      const next = new Set(prev)
      if (next.has(announcementId)) next.delete(announcementId)
      else next.add(announcementId)
      return next
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 group"
          >
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <Megaphone className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                Duyurular ve Analizler
              </h2>
              <p className="text-[11px] text-gray-400">
                {announcements.length} duyuru • Portföy sahibinden notlar
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
            )}
          </button>
          
          {/* Yeni Duyuru Butonu (Sadece Owner) */}
          {isOwner && userId && (
            <AddAnnouncementButton
              userId={userId}
              portfolioId={portfolioId}
              onAnnouncementAdded={onAnnouncementAdded}
              editingAnnouncement={editingAnnouncement}
              onCancelEdit={onCancelEdit}
            />
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Duyurular yükleniyor...</span>
              </div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
                <Megaphone className="w-8 h-8 text-blue-300" />
              </div>
              <p className="text-gray-500 font-medium">Henüz duyuru yayınlanmamış.</p>
              <p className="text-xs text-gray-400 mt-1">
                {isOwner 
                  ? 'Takipçilerinize duyuru ve analiz paylaşmak için "Yeni Duyuru" butonunu kullanın.'
                  : 'Portföy sahibi henüz bir duyuru paylaşmadı.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => {
                const isPinned = announcement.is_pinned
                const isExpanded = expandedAnnouncements.has(announcement.id)
                
                return (
                  <div
                    key={announcement.id}
                    id={`announcement-${announcement.id}`}
                    className={`group relative border rounded-xl p-4 transition-all duration-200 ${
                      isPinned 
                        ? 'border-blue-200 bg-blue-50/30 border-l-[3px] border-l-blue-400' 
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                    }`}
                  >
                    {/* Top row: Pin badge + date + actions */}
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        {isPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md border bg-blue-100 text-blue-700 border-blue-200">
                            <Pin className="w-3 h-3" />
                            Sabitlendi
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400" title={format(new Date(announcement.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}>
                          {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                      
                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleTogglePin(announcement)}
                            disabled={togglingPinId === announcement.id}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                            title={isPinned ? 'Sabitlemeyi kaldır' : 'Üstte sabitle'}
                          >
                            {togglingPinId === announcement.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                            ) : isPinned ? (
                              <PinOff className="w-3.5 h-3.5" />
                            ) : (
                              <Pin className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => onEdit?.(announcement)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                            title="Düzenle"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            disabled={deletingId === announcement.id}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Sil"
                          >
                            {deletingId === announcement.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>

                    {/* Content */}
                    <div className="mb-3">
                      <p className={`text-gray-700 text-sm leading-relaxed whitespace-pre-wrap ${
                        !isExpanded && announcement.content.length > 150 ? 'line-clamp-3' : ''
                      }`}>
                        {announcement.content}
                      </p>
                      {announcement.content.length > 150 && (
                        <button
                          onClick={() => toggleAnnouncementExpand(announcement.id)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-1.5 transition-colors inline-flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              <span>Daha az göster</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <span>Devamını oku</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Links */}
                    {announcement.links && announcement.links.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">🔗 Linkler:</p>
                        {announcement.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1.5 rounded-md transition-colors group"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="flex-1">{link.label}</span>
                            <span className="text-xs text-gray-400 group-hover:text-blue-500">→</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
