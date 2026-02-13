import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Public kullanıcı profili ve portföyleri
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 })
    }

    const supabase = await createClient()

    // Kullanıcı profili
    const { data: profile, error: profileError } = await supabase
      .from('users_public')
      .select('id, display_name, avatar_url, bio, is_profile_public, created_at')
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Mevcut kullanıcıyı kontrol et
    const { data: { user } } = await supabase.auth.getUser()
    const isOwnProfile = user?.id === id

    // Public portföyleri getir
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('id, name, slug, description, follower_count, is_public, created_at')
      .eq('user_id', id)
      .eq('is_public', true)
      .order('follower_count', { ascending: false })

    // Profil gizliyse VE public portföyü yoksa VE kendi profili değilse → 403
    const hasPublicPortfolios = (portfolios || []).length > 0
    if (!profile.is_profile_public && !hasPublicPortfolios && !isOwnProfile) {
      return NextResponse.json({ error: 'Bu profil gizli' }, { status: 403 })
    }

    // Holding sayıları
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

    const enrichedPortfolios = (portfolios || []).map(p => ({
      ...p,
      holding_count: holdingCounts[p.id] || 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          created_at: profile.created_at,
        },
        portfolios: enrichedPortfolios,
        isOwnProfile,
      },
    })
  } catch (error: unknown) {
    console.error('GET profile error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
