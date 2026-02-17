import { withAdminAuth, writeAuditLog } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(async (adminUser) => {
    const { id } = await params
    const admin = createAdminClient()

    // Paralel sorgular
    const [profileRes, portfoliosRes, holdingsRes, transactionsRes, rolesRes] =
      await Promise.all([
        // Profil
        admin.from('users_public').select('*').eq('id', id).single(),

        // Portföyler
        admin
          .from('portfolios')
          .select('id, name, is_public, slug, follower_count, created_at, updated_at')
          .eq('user_id', id)
          .order('created_at', { ascending: false }),

        // Holdings (aktif)
        admin
          .from('holdings')
          .select('id, symbol, asset_type, quantity, avg_price, updated_at')
          .eq('user_id', id)
          .gt('quantity', 0)
          .order('updated_at', { ascending: false }),

        // Son 50 işlem
        admin
          .from('transactions')
          .select('id, symbol, asset_type, side, quantity, price, fee, date, note')
          .eq('user_id', id)
          .order('date', { ascending: false })
          .limit(50),

        // Roller
        admin
          .from('user_roles')
          .select('id, assigned_at, role:roles(id, slug, name)')
          .eq('user_id', id),
      ])

    if (profileRes.error || !profileRes.data) {
      return Response.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Auth bilgisi (email, son login) — admin API ile
    const { data: authUser } = await admin.auth.admin.getUserById(id)

    // Kullanıcı detay görüntüleme logu
    writeAuditLog({
      adminId: adminUser.id,
      action: 'user_detail_viewed',
      targetType: 'user',
      targetId: id,
      metadata: { viewedUser: profileRes.data.display_name || 'İsimsiz' },
    }).catch(() => {})

    return Response.json({
      profile: profileRes.data,
      email: authUser?.user?.email || null,
      lastSignIn: authUser?.user?.last_sign_in_at || null,
      portfolios: portfoliosRes.data || [],
      holdings: holdingsRes.data || [],
      transactions: transactionsRes.data || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      roles: (rolesRes.data || []).map((r: any) => ({
        id: r.id,
        assigned_at: r.assigned_at,
        ...r.role,
      })),
    })
  })
}

// Rol atama / kaldırma
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(async (adminUser) => {
    const { id } = await params
    const body = await request.json()
    const { action, roleSlug } = body as { action: 'assign_role' | 'remove_role'; roleSlug: string }

    const admin = createAdminClient()

    // Hedef rolü bul
    const { data: role, error: roleError } = await admin
      .from('roles')
      .select('id, slug, name, is_system')
      .eq('slug', roleSlug)
      .single()

    if (roleError || !role) {
      return Response.json({ error: 'Rol bulunamadı' }, { status: 404 })
    }

    if (action === 'assign_role') {
      const { error } = await admin.from('user_roles').insert({
        user_id: id,
        role_id: role.id,
        assigned_by: adminUser.id,
      })

      if (error) {
        if (error.code === '23505') {
          return Response.json({ error: 'Bu rol zaten atanmış' }, { status: 409 })
        }
        return Response.json({ error: error.message }, { status: 500 })
      }

      await writeAuditLog({
        adminId: adminUser.id,
        action: 'user_role_assigned',
        targetType: 'user',
        targetId: id,
        metadata: { roleSlug, roleName: role.name },
      })

      return Response.json({ success: true, message: `${role.name} rolü atandı` })
    }

    if (action === 'remove_role') {
      const { error } = await admin
        .from('user_roles')
        .delete()
        .eq('user_id', id)
        .eq('role_id', role.id)

      if (error) {
        return Response.json({ error: error.message }, { status: 500 })
      }

      await writeAuditLog({
        adminId: adminUser.id,
        action: 'user_role_removed',
        targetType: 'user',
        targetId: id,
        metadata: { roleSlug, roleName: role.name },
      })

      return Response.json({ success: true, message: `${role.name} rolü kaldırıldı` })
    }

    return Response.json({ error: 'Geçersiz aksiyon' }, { status: 400 })
  })
}
