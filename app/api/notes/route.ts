import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { scope, symbol, content, portfolio_id, user_id } = body

    if (!scope || !content || !portfolio_id || !user_id) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('notes')
      .insert({
        scope,
        symbol: symbol || null,
        content,
        portfolio_id,
        user_id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Notes POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
