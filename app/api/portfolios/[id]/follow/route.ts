import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST — Portföyü takip et
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
    }

    // Portföy public mi kontrol et
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id, user_id, is_public')
      .eq('id', portfolioId)
      .eq('is_public', true)
      .single()

    if (!portfolio) {
      return NextResponse.json({ error: 'Portföy bulunamadı veya gizli' }, { status: 404 })
    }

    // Kendi portföyünü takip edemez
    if (portfolio.user_id === user.id) {
      return NextResponse.json({ error: 'Kendi portföyünüzü takip edemezsiniz' }, { status: 400 })
    }

    // Takip et (duplicate kontrolü UNIQUE constraint ile)
    const { error } = await supabase
      .from('portfolio_follows')
      .insert({
        follower_id: user.id,
        portfolio_id: portfolioId,
      })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Zaten takip ediyorsunuz' }, { status: 200 })
      }
      throw error
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: unknown) {
    console.error('Follow POST error:', error)
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
    }

    const { error } = await supabase
      .from('portfolio_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('portfolio_id', portfolioId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Follow DELETE error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
