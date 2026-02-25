import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assertAdmin } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  try {
    await assertAdmin()

    const adminClient = createAdminClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = adminClient
      .from('feedback')
      .select(`
        *,
        user:users_public(id, display_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data, error } = await query

    if (error) {
      console.error('Admin feedback fetch error:', error)
      return NextResponse.json(
        { error: 'Geri bildirimler yüklenemedi' },
        { status: 500 }
      )
    }

    const { data: statsData } = await adminClient
      .from('feedback_stats')
      .select('*')
      .single()

    return NextResponse.json({
      data,
      stats: statsData || {
        unresolved_count: 0,
        last_7_days_count: 0,
        critical_count: 0,
        total_count: 0,
        unique_users: 0,
      },
    })
  } catch (error) {
    console.error('Admin feedback API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await assertAdmin()

    const adminClient = createAdminClient()
    const body = await request.json()
    const { id, status, priority, admin_notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID gerekli' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes

    const { data, error } = await adminClient
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Feedback update error:', error)
      return NextResponse.json(
        { error: 'Geri bildirim güncellenemedi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Admin feedback PATCH error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await assertAdmin()

    const adminClient = createAdminClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID gerekli' },
        { status: 400 }
      )
    }

    const { error } = await adminClient
      .from('feedback')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Feedback delete error:', error)
      return NextResponse.json(
        { error: 'Geri bildirim silinemedi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin feedback DELETE error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
