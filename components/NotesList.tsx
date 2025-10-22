'use client'

import { useEffect, useState } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { StickyNote } from 'lucide-react'
import AddNoteButton from './AddNoteButton'
import type { Note } from '@/lib/types/database.types'

interface NotesListProps {
  userId: string
}

const SCOPE_LABELS: Record<string, string> = {
  POSITION: 'Pozisyon',
  WEEKLY: 'Haftalık',
  GENERAL: 'Genel',
}

const SCOPE_COLORS: Record<string, string> = {
  POSITION: 'bg-blue-100 text-blue-700',
  WEEKLY: 'bg-purple-100 text-purple-700',
  GENERAL: 'bg-green-100 text-green-700',
}

export default function NotesList({ userId }: NotesListProps) {
  const { activePortfolio } = usePortfolio()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    const fetchNotes = async () => {
      if (!activePortfolio) return

      setLoading(true)
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('portfolio_id', activePortfolio.id)
        .order('created_at', { ascending: false })

      setNotes(data || [])
      setLoading(false)
    }

    fetchNotes()
  }, [activePortfolio?.id])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notlarım</h2>
            <p className="text-sm text-gray-600 mt-1">Pozisyon, haftalık ve genel notlarınız</p>
          </div>
          <AddNoteButton userId={userId} portfolioId={activePortfolio?.id} />
        </div>
      </div>

      <div className="p-6">
        {!notes || notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <StickyNote className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Henüz not eklenmemiş.</p>
            <p className="text-sm mt-1">Yukarıdaki butona tıklayarak not ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${SCOPE_COLORS[note.scope]}`}>
                      {SCOPE_LABELS[note.scope]}
                    </span>
                    {note.symbol && (
                      <span className="text-sm font-medium text-gray-700">
                        {note.symbol}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(note.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
