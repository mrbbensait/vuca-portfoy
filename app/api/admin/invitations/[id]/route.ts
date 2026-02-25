import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin, writeAuditLog } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await assertAdmin()
    const supabase = createAdminClient()
    const { id } = await params

    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !invitation) {
      return NextResponse.json({ error: 'Davet bulunamadı' }, { status: 404 })
    }

    let invitationWithCreator = { ...invitation, creator: null }
    if (invitation.created_by) {
      const { data: userData } = await supabase.auth.admin.getUserById(invitation.created_by)
      const { data: profile } = await supabase
        .from('users_public')
        .select('display_name')
        .eq('id', invitation.created_by)
        .single()
      
      invitationWithCreator.creator = {
        email: userData?.user?.email || null,
        display_name: profile?.display_name || null,
      }
    }

    const { data: uses } = await supabase
      .from('invitation_uses')
      .select('id, used_at, user_id')
      .eq('invitation_id', id)
      .order('used_at', { ascending: false })

    const usesWithUserInfo = await Promise.all(
      (uses || []).map(async (use) => {
        const { data: userData } = await supabase.auth.admin.getUserById(use.user_id)
        const { data: profile } = await supabase
          .from('users_public')
          .select('display_name, created_at')
          .eq('id', use.user_id)
          .single()
        
        return {
          ...use,
          user: {
            id: use.user_id,
            email: userData?.user?.email || null,
            display_name: profile?.display_name || null,
            created_at: profile?.created_at || null,
          }
        }
      })
    )

    return NextResponse.json({
      invitation: invitationWithCreator,
      uses: usesWithUserInfo,
    })
  } catch (error: any) {
    console.error('Admin invitation detail error:', error)
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await assertAdmin()
    const supabase = createAdminClient()
    const { id } = await params

    const { data: invitation } = await supabase
      .from('invitations')
      .select('code, label')
      .eq('id', id)
      .single()

    if (!invitation) {
      return NextResponse.json({ error: 'Davet bulunamadı' }, { status: 404 })
    }

    const { error } = await supabase
      .from('invitations')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deactivating invitation:', error)
      return NextResponse.json({ error: 'Davet iptal edilemedi' }, { status: 500 })
    }

    await writeAuditLog({
      adminId: adminUser.id,
      action: 'invitation_deactivated',
      targetType: 'invitation',
      targetId: id,
      metadata: {
        code: invitation.code,
        label: invitation.label,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Admin delete invitation error:', error)
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
}
