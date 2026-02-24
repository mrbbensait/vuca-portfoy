import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST — Portföyü takip et
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID gerekli' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Portföyü kontrol et: var mı ve public mı?
    const { data: portfolio, error: pError } = await supabase
      .from('portfolios')
      .select('id, user_id, is_public')
      .eq('id', portfolioId)
      .eq('is_public', true)
      .single()

    if (pError || !portfolio) {
      return NextResponse.json({ error: 'Portföy bulunamadı veya gizli' }, { status: 404 })
    }

    // Kendi portföyünü takip edemez
    if (portfolio.user_id === user.id) {
      return NextResponse.json({ error: 'Kendi portföyünüzü takip edemezsiniz' }, { status: 400 })
    }

    // Takip et (last_seen_at'i şu anki zamana set et - eski aktiviteler bildirim olmasın)
    const { data: follow, error: fError } = await supabase
      .from('portfolio_follows')
      .insert({
        follower_id: user.id,
        portfolio_id: portfolioId,
        last_seen_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (fError) {
      // Zaten takip ediyorsa
      if (fError.code === '23505') {
        return NextResponse.json({ error: 'Bu portföyü zaten takip ediyorsunuz' }, { status: 409 })
      }
      throw fError
    }

    return NextResponse.json({ success: true, data: follow }, { status: 201 })
  } catch (error: unknown) {
    console.error('POST follow error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE — Takibi bırak
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID gerekli' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('portfolio_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('portfolio_id', portfolioId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE follow error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
