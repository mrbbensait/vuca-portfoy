import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface AdminUser {
  id: string
  email: string
  displayName: string
  role: string
  permissions: Record<string, boolean>
}

// Admin doğrulama: kullanıcının auth + admin rolü kontrolü
// 1. Normal supabase client ile auth doğrulaması (cookie-based)
// 2. Admin client (service_role) ile user_roles + roles tablosu kontrolü
export async function assertAdmin(): Promise<AdminUser> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new AdminAuthError('Unauthorized', 401)
  }

  const adminClient = createAdminClient()

  // Kullanıcının rollerini al (roles tablosu ile join)
  const { data: userRoles, error: roleError } = await adminClient
    .from('user_roles')
    .select(`
      role:roles (
        id,
        slug,
        name,
        permissions
      )
    `)
    .eq('user_id', user.id)

  if (roleError || !userRoles || userRoles.length === 0) {
    throw new AdminAuthError('Forbidden: Admin rolü gerekli', 403)
  }

  // Herhangi bir admin rolü var mı kontrol et
  // Super admin: permissions = {"*": true}
  // Diğer roller: permissions = {"users.read": true, ...}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminRole = userRoles.find((ur: any) => {
    const perms = ur.role?.permissions
    return perms && (perms['*'] === true || Object.keys(perms).length > 0)
  })

  if (!adminRole?.role) {
    throw new AdminAuthError('Forbidden: Admin rolü gerekli', 403)
  }

  const role = adminRole.role as unknown as { id: string; slug: string; name: string; permissions: Record<string, boolean> }

  // Profil bilgisi al
  const { data: profile } = await adminClient
    .from('users_public')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email || '',
    displayName: profile?.display_name || user.email || '',
    role: role.slug,
    permissions: role.permissions as Record<string, boolean>,
  }
}

// Belirli bir permission kontrolü
export function hasPermission(
  admin: AdminUser,
  permission: string
): boolean {
  // Super admin her şeye erişebilir
  if (admin.permissions['*'] === true) return true
  // Granüler permission kontrolü
  return admin.permissions[permission] === true
}

// Admin auth hatası
export class AdminAuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'AdminAuthError'
    this.status = status
  }
}

// API route'ları için yardımcı: hata yakalama wrapper
export async function withAdminAuth(
  handler: (admin: AdminUser) => Promise<Response>
): Promise<Response> {
  try {
    const admin = await assertAdmin()
    return await handler(admin)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return Response.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error('Admin auth error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Audit log yazma helper
export async function writeAuditLog(params: {
  adminId: string
  action: string
  targetType: string
  targetId?: string
  metadata?: Record<string, unknown>
}) {
  const adminClient = createAdminClient()
  await adminClient.from('admin_audit_log').insert({
    admin_id: params.adminId,
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId || null,
    metadata: params.metadata || {},
  })
}
