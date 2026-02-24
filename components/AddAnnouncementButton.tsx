'use client'

import { useState } from 'react'
import { Plus, X, Send, Link as LinkIcon, Trash2 } from 'lucide-react'
import type { PortfolioAnnouncement, AnnouncementLink } from '@/lib/types/database.types'

interface AddAnnouncementButtonProps {
  userId: string
  portfolioId: string
  onAnnouncementAdded?: () => void
  editingAnnouncement?: PortfolioAnnouncement | null
  onCancelEdit?: () => void
}

export default function AddAnnouncementButton({ 
  userId, 
  portfolioId, 
  onAnnouncementAdded,
  editingAnnouncement,
  onCancelEdit
}: AddAnnouncementButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: editingAnnouncement?.title || '',
    content: editingAnnouncement?.content || '',
    links: editingAnnouncement?.links || [] as AnnouncementLink[],
    is_pinned: editingAnnouncement?.is_pinned || false,
    send_to_telegram: false,
  })

  const [newLink, setNewLink] = useState({ url: '', label: '' })
  const [addingLink, setAddingLink] = useState(false)

  // Edit mode açıldığında formu güncelle
  useState(() => {
    if (editingAnnouncement) {
      setFormData({
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
        links: editingAnnouncement.links,
        is_pinned: editingAnnouncement.is_pinned,
        send_to_telegram: false,
      })
      setIsOpen(true)
    }
  })

  const handleAddLink = () => {
    if (!newLink.url.trim() || !newLink.label.trim()) {
      setError('Link URL ve etiket gereklidir')
      return
    }

    // URL formatını kontrol et
    try {
      new URL(newLink.url)
    } catch {
      setError('Geçerli bir URL girin (örn: https://example.com)')
      return
    }

    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { url: newLink.url.trim(), label: newLink.label.trim() }]
    }))
    setNewLink({ url: '', label: '' })
    setAddingLink(false)
    setError(null)
  }

  const handleRemoveLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!portfolioId || !userId) return
    
    setLoading(true)
    setError(null)

    try {
      if (editingAnnouncement) {
        // Güncelleme modu
        const response = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            links: formData.links,
            is_pinned: formData.is_pinned,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Duyuru güncellenirken hata oluştu')
        }
      } else {
        // Yeni duyuru modu
        const response = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            links: formData.links,
            is_pinned: formData.is_pinned,
            send_to_telegram: formData.send_to_telegram,
            portfolio_id: portfolioId,
            user_id: userId,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Duyuru eklenirken hata oluştu')
        }
      }

      // Reset form
      setFormData({ 
        title: '', 
        content: '', 
        links: [], 
        is_pinned: false,
        send_to_telegram: false 
      })
      setIsOpen(false)
      onAnnouncementAdded?.()
      onCancelEdit?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onCancelEdit?.()
    setFormData({ 
      title: '', 
      content: '', 
      links: [], 
      is_pinned: false,
      send_to_telegram: false 
    })
    setError(null)
  }

  if (!isOpen && !editingAnnouncement) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 active:scale-95 transition-all shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Yeni Duyuru
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              {editingAnnouncement ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Yayınla'}
            </h3>
            <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Başlık */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Başlık</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-shadow"
              placeholder="Ör: Tesla Alım Planı"
            />
          </div>

          {/* İçerik */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">İçerik</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={6}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 resize-none transition-shadow"
              placeholder="Duyurunuzu buraya yazın..."
            />
          </div>

          {/* Linkler */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              🔗 Linkler (opsiyonel)
            </label>
            
            {/* Mevcut linkler */}
            {formData.links.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.links.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{link.label}</p>
                      <p className="text-xs text-gray-500 truncate">{link.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Link ekleme formu */}
            {addingLink ? (
              <div className="space-y-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="Link URL (örn: https://tradingview.com/...)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <input
                  type="text"
                  value={newLink.label}
                  onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  placeholder="Link etiketi (örn: TradingView Grafiği)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="flex-1 px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingLink(false)
                      setNewLink({ url: '', label: '' })
                    }}
                    className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingLink(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Link Ekle
              </button>
            )}
          </div>

          {/* Seçenekler */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Üstte sabitle (Pin)</span>
            </label>

            {!editingAnnouncement && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.send_to_telegram}
                  onChange={(e) => setFormData({ ...formData, send_to_telegram: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Telegram kanalına gönder</span>
              </label>
            )}
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              <Send className="w-4 h-4" />
              {loading ? 'İşleniyor...' : editingAnnouncement ? 'Güncelle' : 'Yayınla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
