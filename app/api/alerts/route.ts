import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, payload, portfolio_id, user_id } = body

    if (!type || !payload || !portfolio_id || !user_id) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        type,
        payload,
        portfolio_id,
        user_id,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Alerts POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
