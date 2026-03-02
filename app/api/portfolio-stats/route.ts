import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Fetch cached portfolio stats (for public portfolio pages)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolio_id')

    if (!portfolioId) {
      return NextResponse.json({ error: 'portfolio_id is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('portfolio_stats_cache')
      .select('stats_data, updated_at')
      .eq('portfolio_id', portfolioId)
      .single()

    if (error) {
      // PGRST116 = no rows found
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: true, data: null })
      }
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    console.error('GET portfolio-stats error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST — Save/update portfolio stats cache (only portfolio owner)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { portfolio_id, stats_data } = body

    if (!portfolio_id || !stats_data) {
      return NextResponse.json({ error: 'portfolio_id and stats_data are required' }, { status: 400 })
    }

    // Verify ownership
    const { data: portfolio, error: portError } = await supabase
      .from('portfolios')
      .select('id, user_id')
      .eq('id', portfolio_id)
      .single()

    if (portError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (portfolio.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check cache age (throttling: skip if updated < 5 minutes ago)
    const { data: existing } = await supabase
      .from('portfolio_stats_cache')
      .select('updated_at')
      .eq('portfolio_id', portfolio_id)
      .single()

    if (existing) {
      const ageMinutes = (Date.now() - new Date(existing.updated_at).getTime()) / 1000 / 60
      if (ageMinutes < 5) {
        return NextResponse.json({ 
          success: true, 
          skipped: true, 
          reason: 'Cache is fresh (< 5 minutes)',
          age_minutes: Math.round(ageMinutes)
        })
      }
    }

    // Upsert stats
    const { error } = await supabase
      .from('portfolio_stats_cache')
      .upsert({
        portfolio_id,
        stats_data,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'portfolio_id',
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('POST portfolio-stats error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
