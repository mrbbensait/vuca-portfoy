import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Tek bir public portföyün detayını getir (holdings + transactions)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Portfolio ID gerekli' }, { status: 400 })
    }

    const supabase = await createClient()

    // Portföyü getir
    const { data: portfolio, error: pError } = await supabase
      .from('portfolios')
      .select('id, name, slug, description, is_public, created_at, user_id')
      .eq('id', id)
      .eq('is_public', true)
      .single()

    if (pError || !portfolio) {
      return NextResponse.json({ error: 'Portföy bulunamadı veya gizli' }, { status: 404 })
    }

    // Profil bilgisi (ayrı sorgu — FK yok)
    const { data: profile } = await supabase
      .from('users_public')
      .select('display_name, avatar_url, bio')
      .eq('id', portfolio.user_id)
      .single()

    // Holdings
    const { data: holdings } = await supabase
      .from('holdings')
      .select('id, symbol, asset_type, quantity, avg_price, created_at')
      .eq('portfolio_id', id)
      .order('created_at', { ascending: true })

    // Transactions (son 50)
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id, symbol, asset_type, side, quantity, price, fee, date, created_at')
      .eq('portfolio_id', id)
      .order('date', { ascending: false })
      .limit(50)

    return NextResponse.json({
      success: true,
      data: {
        portfolio: {
          ...portfolio,
          owner_name: profile?.display_name || 'Anonim',
          owner_avatar: profile?.avatar_url || null,
          owner_bio: profile?.bio || null,
        },
        holdings: holdings || [],
        transactions: transactions || [],
      },
    })
  } catch (error: unknown) {
    console.error('GET public portfolio error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
