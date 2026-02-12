'use client'

import { useState } from 'react'
import { Plus, X, Send } from 'lucide-react'
import { NoteScope } from '@/lib/types/database.types'

interface AddNoteButtonProps {
  userId: string
  portfolioId?: string
  onNoteAdded?: () => void
}

export default function AddNoteButton({ userId, portfolioId, onNoteAdded }: AddNoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    scope: 'GENERAL' as NoteScope,
    symbol: '',
    content: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!portfolioId || !userId) return
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: formData.scope,
          symbol: formData.scope === 'POSITION' ? formData.symbol : null,
          content: formData.content,
          portfolio_id: portfolioId,
          user_id: userId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Not eklenirken hata oluştu')
      }

      setFormData({ scope: 'GENERAL', symbol: '', content: '' })
      setIsOpen(false)
      onNoteAdded?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 active:scale-95 transition-all shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Not Ekle
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setIsOpen(false)}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Yeni Not</h3>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kapsam</label>
            <div className="flex gap-2">
              {([
                { value: 'GENERAL', label: 'Genel', color: 'bg-emerald-100 text-emerald-700 border-emerald-300 ring-emerald-500' },
                { value: 'WEEKLY', label: 'Haftalık', color: 'bg-violet-100 text-violet-700 border-violet-300 ring-violet-500' },
                { value: 'POSITION', label: 'Pozisyon', color: 'bg-sky-100 text-sky-700 border-sky-300 ring-sky-500' },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, scope: option.value })}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                    formData.scope === option.value
                      ? `${option.color} ring-2 ring-offset-1`
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {formData.scope === 'POSITION' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sembol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 transition-shadow"
                placeholder="Ör: ASELS.IS"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">İçerik</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={4}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 resize-none transition-shadow"
              placeholder="Notunuzu buraya yazın..."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !formData.content.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Ekleniyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
