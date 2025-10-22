import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Kullanıcının tüm portfolyolarını listele
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data: portfolios })
  } catch (error: unknown) {
    console.error('GET portfolios error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST - Yeni portfolio oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Portfolio adı gerekli' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        name: name.trim(),
      })
      .select()
      .single()

    if (error) {
      // Duplicate name hatası
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Bu isimde bir portfolio zaten var' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ success: true, data: portfolio }, { status: 201 })
  } catch (error: unknown) {
    console.error('POST portfolio error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH - Portfolio adını güncelle
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, name } = body

    if (!id || !name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Portfolio ID ve adı gerekli' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .update({ name: name.trim() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Bu isimde bir portfolio zaten var' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ success: true, data: portfolio })
  } catch (error: unknown) {
    console.error('PATCH portfolio error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE - Portfolio sil (CASCADE ile tüm ilişkili veriler de silinir)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Portfolio ID gerekli' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Kullanıcının kaç portfolyosu var kontrol et (en az 1 kalmalı)
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)

    if (portfolios && portfolios.length <= 1) {
      return NextResponse.json({ error: 'En az bir portfolio bulunmalıdır' }, { status: 400 })
    }

    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE portfolio error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
