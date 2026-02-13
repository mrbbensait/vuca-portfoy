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

    // Portföyü getir (is_public kontrolü RLS'de zaten var ama ek güvenlik)
    const { data: portfolio, error: pError } = await supabase
      .from('portfolios')
      .select(`
        id, name, slug, description, follower_count, is_public, created_at, user_id,
        users_public!portfolios_user_id_fkey(display_name, avatar_url, bio)
      `)
      .eq('id', id)
      .eq('is_public', true)
      .single()

    if (pError || !portfolio) {
      return NextResponse.json({ error: 'Portföy bulunamadı veya gizli' }, { status: 404 })
    }

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

    // Profil bilgisi
    const profile = Array.isArray(portfolio.users_public)
      ? portfolio.users_public[0]
      : portfolio.users_public

    // Mevcut kullanıcı takip ediyor mu?
    const { data: { user } } = await supabase.auth.getUser()
    let isFollowing = false
    if (user) {
      const { data: follow } = await supabase
        .from('portfolio_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('portfolio_id', id)
        .single()
      isFollowing = !!follow
    }

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
        isFollowing,
      },
    })
  } catch (error: unknown) {
    console.error('GET public portfolio error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
