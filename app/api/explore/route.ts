import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Public portföyleri listele (keşfet sayfası)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const sort = searchParams.get('sort') || 'followers' // followers | newest | name
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Base query: public portföyler + sahip bilgisi + holding sayısı
    let query = supabase
      .from('portfolios')
      .select(`
        id, name, slug, description, follower_count, is_public, created_at, user_id,
        users_public!portfolios_user_id_fkey(display_name, avatar_url)
      `, { count: 'exact' })
      .eq('is_public', true)

    // Arama
    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Sıralama
    switch (sort) {
      case 'followers':
        query = query.order('follower_count', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'name':
        query = query.order('name', { ascending: true })
        break
      default:
        query = query.order('follower_count', { ascending: false })
    }

    // Sayfalama
    query = query.range(offset, offset + limit - 1)

    const { data: portfolios, count, error } = await query

    if (error) throw error

    // Her portföy için holding sayısını al
    const portfolioIds = (portfolios || []).map(p => p.id)
    let holdingCounts: Record<string, number> = {}

    if (portfolioIds.length > 0) {
      const { data: counts } = await supabase
        .from('holdings')
        .select('portfolio_id')
        .in('portfolio_id', portfolioIds)

      if (counts) {
        holdingCounts = counts.reduce((acc: Record<string, number>, h: { portfolio_id: string }) => {
          acc[h.portfolio_id] = (acc[h.portfolio_id] || 0) + 1
          return acc
        }, {})
      }
    }

    // Sonuçları zenginleştir
    const enriched = (portfolios || []).map(p => {
      // Supabase join tek kayıt için bile dizi dönebilir
      const profile = Array.isArray(p.users_public)
        ? p.users_public[0]
        : p.users_public
      return {
        ...p,
        owner_name: profile?.display_name || 'Anonim',
        owner_avatar: profile?.avatar_url || null,
        holding_count: holdingCounts[p.id] || 0,
      }
    })

    return NextResponse.json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: unknown) {
    console.error('GET explore error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
