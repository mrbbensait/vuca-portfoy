'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'
import { format, formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { StickyNote, Trash2, BookOpen, TrendingUp, Calendar, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import AddNoteButton from './AddNoteButton'
import type { Note, NoteScope } from '@/lib/types/database.types'

interface NotesListProps {
  userId: string
}

const SCOPE_CONFIG: Record<string, { label: string; icon: typeof BookOpen; gradient: string; badge: string; border: string }> = {
  GENERAL: {
    label: 'Genel',
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-l-emerald-400',
  },
  WEEKLY: {
    label: 'Haftalık',
    icon: Calendar,
    gradient: 'from-violet-500 to-purple-500',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    border: 'border-l-violet-400',
  },
  POSITION: {
    label: 'Pozisyon',
    icon: TrendingUp,
    gradient: 'from-sky-500 to-blue-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    border: 'border-l-sky-400',
  },
}

type FilterType = 'ALL' | NoteScope

export default function NotesList({ userId }: NotesListProps) {
  const { activePortfolio } = usePortfolio()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  
  const supabase = createClient()

  const fetchNotes = useCallback(async () => {
    if (!activePortfolio) return

    setLoading(true)
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('portfolio_id', activePortfolio.id)
      .order('created_at', { ascending: false })

    setNotes(data || [])
    setLoading(false)
  }, [activePortfolio?.id])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleDelete = async (noteId: string) => {
    setDeletingId(noteId)
    try {
      const response = await fetch(`/api/notes?id=${noteId}`, { method: 'DELETE' })
      if (response.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId))
      }
    } catch (err) {
      console.error('Not silinirken hata:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const toggleNoteExpand = (noteId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev)
      if (next.has(noteId)) next.delete(noteId)
      else next.add(noteId)
      return next
    })
  }

  const filteredNotes = filter === 'ALL' ? notes : notes.filter(n => n.scope === filter)

  const scopeCounts = {
    ALL: notes.length,
    GENERAL: notes.filter(n => n.scope === 'GENERAL').length,
    WEEKLY: notes.filter(n => n.scope === 'WEEKLY').length,
    POSITION: notes.filter(n => n.scope === 'POSITION').length,
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 group"
          >
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <StickyNote className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                Notlarım
              </h2>
              <p className="text-[11px] text-gray-400">
                {notes.length} not • Pozisyon, haftalık ve genel
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
            )}
          </button>
          <AddNoteButton userId={userId} portfolioId={activePortfolio?.id} onNoteAdded={fetchNotes} />
        </div>
      </div>

      {expanded && (
        <>
          {/* Filter Tabs */}
          {notes.length > 0 && (
            <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
                {([
                  { key: 'ALL' as FilterType, label: 'Tümü' },
                  { key: 'GENERAL' as FilterType, label: 'Genel' },
                  { key: 'WEEKLY' as FilterType, label: 'Haftalık' },
                  { key: 'POSITION' as FilterType, label: 'Pozisyon' },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                      filter === tab.key
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-200/70'
                    }`}
                  >
                    {tab.label}
                    {scopeCounts[tab.key] > 0 && (
                      <span className={`ml-1 ${filter === tab.key ? 'text-amber-100' : 'text-gray-400'}`}>
                        {scopeCounts[tab.key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Notlar yükleniyor...</span>
                </div>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-2xl mb-4">
                  <StickyNote className="w-8 h-8 text-amber-300" />
                </div>
                <p className="text-gray-500 font-medium">
                  {filter !== 'ALL' ? `${SCOPE_CONFIG[filter]?.label || ''} not bulunamadı.` : 'Henüz not eklenmemiş.'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {filter !== 'ALL' 
                    ? 'Farklı bir filtre deneyin veya yeni not ekleyin.'
                    : 'Portföyünüz hakkında notlar ekleyerek düşüncelerinizi kaydedin.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => {
                  const config = SCOPE_CONFIG[note.scope]
                  const ScopeIcon = config?.icon || BookOpen

                  return (
                    <div
                      key={note.id}
                      className={`group relative border border-gray-100 rounded-xl p-4 pl-5 border-l-[3px] ${config?.border || 'border-l-gray-300'} hover:shadow-md hover:border-gray-200 transition-all duration-200`}
                    >
                      {/* Top row: badge + symbol + date + delete */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md border ${config?.badge || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            <ScopeIcon className="w-3 h-3" />
                            {config?.label || note.scope}
                          </span>
                          {note.symbol && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-mono font-semibold rounded-md">
                              {note.symbol}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400" title={format(new Date(note.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}>
                            {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: tr })}
                          </span>
                          <button
                            onClick={() => handleDelete(note.id)}
                            disabled={deletingId === note.id}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Notu sil"
                          >
                            {deletingId === note.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <p className={`text-gray-700 text-sm leading-relaxed whitespace-pre-wrap ${
                          !expandedNotes.has(note.id) && note.content.length > 200 ? 'line-clamp-3' : ''
                        }`}>
                          {note.content}
                        </p>
                        {note.content.length > 200 && (
                          <button
                            onClick={() => toggleNoteExpand(note.id)}
                            className="text-amber-600 hover:text-amber-700 text-xs font-medium mt-1.5 transition-colors"
                          >
                            {expandedNotes.has(note.id) ? 'Daha az göster' : 'Devamını oku...'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
