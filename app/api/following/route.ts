import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — Kullanıcının takip ettiği portföyler
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Takip edilen portföy ID'leri
    const { data: follows, error: fErr } = await supabase
      .from('portfolio_follows')
      .select('portfolio_id')
      .eq('follower_id', user.id)

    if (fErr) throw fErr
    if (!follows || follows.length === 0) {
      return NextResponse.json({ success: true, data: { portfolios: [] } })
    }

    const portfolioIds = follows.map(f => f.portfolio_id)

    // Portföy bilgileri
    const { data: portfolios, error: pErr } = await supabase
      .from('portfolios')
      .select('id, name, slug, user_id')
      .in('id', portfolioIds)

    if (pErr) throw pErr

    // Sahip profilleri
    const ownerIds = [...new Set((portfolios || []).map(p => p.user_id))]
    const { data: owners } = await supabase
      .from('users_public')
      .select('id, display_name, avatar_url')
      .in('id', ownerIds)

    const ownerMap: Record<string, { display_name: string | null }> = {}
    if (owners) {
      owners.forEach(o => { ownerMap[o.id] = { display_name: o.display_name } })
    }

    // Portföy listesi
    const portfolioList = (portfolios || []).map(p => ({
      portfolio_id: p.id,
      portfolio_name: p.name,
      portfolio_slug: p.slug,
      owner_name: ownerMap[p.user_id]?.display_name || 'Anonim',
    }))

    return NextResponse.json({
      success: true,
      data: { portfolios: portfolioList },
    })
  } catch (error: unknown) {
    console.error('GET following error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
