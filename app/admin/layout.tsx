import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Admin Panel — Portföy Röntgeni',
  description: 'Sistem yönetim paneli',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Auth kontrolü
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 2. Role kontrolü — service_role ile (RLS bypass)
  const adminClient = createAdminClient()

  const { data: userRoles } = await adminClient
    .from('user_roles')
    .select(`
      role:roles (
        slug,
        name,
        permissions
      )
    `)
    .eq('user_id', user.id)

  // Admin rolü var mı kontrol et
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminRole = userRoles?.find((ur: any) => {
    const perms = ur.role?.permissions
    return perms && (perms['*'] === true || Object.keys(perms).length > 0)
  })

  if (!adminRole?.role) {
    // Admin değil — sessizce dashboard'a yönlendir
    // Admin panelinin varlığını bile göstermiyoruz
    redirect('/dashboard')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = adminRole.role as any

  // Profil bilgisi
  const { data: profile } = await adminClient
    .from('users_public')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const adminName = profile?.display_name || user.email || 'Admin'
  const adminRoleLabel = role.name || 'Admin'

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar adminName={adminName} adminRole={adminRoleLabel} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
