import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin, writeAuditLog } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createInvitation, getInvitationStats } from '@/lib/invitations'

export async function GET(req: NextRequest) {
  try {
    const adminUser = await assertAdmin()
    const supabase = createAdminClient()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const offset = (page - 1) * limit

    let query = supabase
      .from('invitations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    } else if (status === 'full') {
      query = query.eq('is_active', true).filter('max_uses', 'not.is', null)
    }

    if (search) {
      query = query.or(`label.ilike.%${search}%,code.ilike.%${search}%`)
    }

    const { data: invitations, error, count } = await query

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json({ error: 'Davetler getirilemedi' }, { status: 500 })
    }

    const invitationsWithCreator = await Promise.all(
      (invitations || []).map(async (inv) => {
        if (inv.created_by) {
          const { data: userData } = await supabase.auth.admin.getUserById(inv.created_by)
          const { data: profile } = await supabase
            .from('users_public')
            .select('display_name')
            .eq('id', inv.created_by)
            .single()
          
          return {
            ...inv,
            creator: {
              email: userData?.user?.email || null,
              display_name: profile?.display_name || null,
            }
          }
        }
        return { ...inv, creator: null }
      })
    )

    const stats = await getInvitationStats()

    return NextResponse.json({
      invitations: invitationsWithCreator,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats,
    })
  } catch (error: any) {
    console.error('Admin invitations list error:', error)
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await assertAdmin()
    const body = await req.json()

    const { label, max_uses, expires_at } = body

    if (max_uses !== null && max_uses !== undefined) {
      if (typeof max_uses !== 'number' || max_uses < 1) {
        return NextResponse.json(
          { error: 'Geçersiz kullanım limiti' },
          { status: 400 }
        )
      }
    }

    const result = await createInvitation({
      label,
      max_uses: max_uses === undefined ? null : max_uses,
      expires_at: expires_at || null,
      created_by: adminUser.id,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await writeAuditLog({
      adminId: adminUser.id,
      action: 'invitation_created',
      targetType: 'invitation',
      targetId: result.invitation!.id,
      metadata: {
        code: result.invitation!.code,
        label,
        max_uses,
      },
    })

    return NextResponse.json({
      success: true,
      invitation: result.invitation,
    })
  } catch (error: any) {
    console.error('Admin create invitation error:', error)
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
}
