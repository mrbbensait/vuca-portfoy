import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { AnnouncementLink } from '@/lib/types/database.types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH — Duyuru güncelle
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, content, links, is_pinned } = body

    if (!title && !content && links === undefined && is_pinned === undefined) {
      return NextResponse.json({ error: 'En az bir alan güncellenmelidir' }, { status: 400 })
    }

    const supabase = await createClient()

    // Mevcut duyuruyu kontrol et
    const { data: existing } = await supabase
      .from('portfolio_announcements')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Duyuru bulunamadı' }, { status: 404 })
    }

    // Güncelleme verisi
    const updates: Record<string, unknown> = {}
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (links !== undefined) updates.links = links as AnnouncementLink[]
    if (is_pinned !== undefined) updates.is_pinned = is_pinned

    // Güncelle
    const { data: updated, error } = await supabase
      .from('portfolio_announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    console.error('PATCH announcement error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE — Duyuru sil
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const supabase = await createClient()

    // Duyuruyu sil (RLS otomatik kontrol eder)
    const { error } = await supabase
      .from('portfolio_announcements')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE announcement error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
