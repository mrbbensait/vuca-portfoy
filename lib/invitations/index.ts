import { createAdminClient } from '@/lib/supabase/admin'

export interface Invitation {
  id: string
  code: string
  label: string | null
  max_uses: number | null
  current_uses: number
  expires_at: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface InvitationUse {
  id: string
  invitation_id: string
  user_id: string
  used_at: string
}

export interface InvitationWithStats extends Invitation {
  creator_email?: string
  recent_users?: Array<{
    id: string
    email: string
    display_name: string | null
    created_at: string
  }>
}

export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function validateInvitationCode(code: string): Promise<{
  valid: boolean
  invitation?: Invitation
  error?: string
}> {
  const supabase = createAdminClient()

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (error || !invitation) {
    return { valid: false, error: 'Geçersiz davet kodu' }
  }

  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return { valid: false, error: 'Davet kodunun süresi dolmuş' }
  }

  if (invitation.max_uses !== null && invitation.current_uses >= invitation.max_uses) {
    return { valid: false, error: 'Davet kodu kullanım limitine ulaşmış' }
  }

  return { valid: true, invitation }
}

export async function useInvitationCode(
  invitationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { data: invitation } = await supabase
    .from('invitations')
    .select('current_uses')
    .eq('id', invitationId)
    .single()

  if (!invitation) {
    return { success: false, error: 'Davet bulunamadı' }
  }

  const { error: useError } = await supabase
    .from('invitation_uses')
    .insert({
      invitation_id: invitationId,
      user_id: userId,
    })

  if (useError) {
    return { success: false, error: 'Davet kodu kullanılamadı' }
  }

  const { error: incrementError } = await supabase
    .from('invitations')
    .update({ current_uses: invitation.current_uses + 1 })
    .eq('id', invitationId)

  if (incrementError) {
    console.error('Failed to increment invitation usage:', incrementError)
  }

  return { success: true }
}

export async function createInvitation(data: {
  label?: string
  max_uses?: number | null
  expires_at?: string | null
  created_by: string
}): Promise<{ success: boolean; invitation?: Invitation; error?: string }> {
  const supabase = createAdminClient()

  let code = generateInvitationCode()
  let attempts = 0
  let codeExists = true

  while (codeExists && attempts < 10) {
    const { data: existing } = await supabase
      .from('invitations')
      .select('id')
      .eq('code', code)
      .single()

    if (!existing) {
      codeExists = false
    } else {
      code = generateInvitationCode()
      attempts++
    }
  }

  if (codeExists) {
    return { success: false, error: 'Benzersiz kod oluşturulamadı' }
  }

  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      code,
      label: data.label || null,
      max_uses: data.max_uses || null,
      expires_at: data.expires_at || null,
      created_by: data.created_by,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: 'Davet oluşturulamadı' }
  }

  return { success: true, invitation }
}

export async function getInvitationStats(): Promise<{
  total_invitations: number
  active_invitations: number
  total_uses: number
  available_slots: number
}> {
  const supabase = createAdminClient()

  const { count: totalInvitations } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })

  const { count: activeInvitations } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: totalUses } = await supabase
    .from('invitation_uses')
    .select('*', { count: 'exact', head: true })

  const { data: activeInvs } = await supabase
    .from('invitations')
    .select('max_uses, current_uses')
    .eq('is_active', true)

  let availableSlots = 0
  if (activeInvs) {
    for (const inv of activeInvs) {
      if (inv.max_uses === null) {
        availableSlots = Infinity
        break
      }
      availableSlots += Math.max(0, inv.max_uses - inv.current_uses)
    }
  }

  return {
    total_invitations: totalInvitations || 0,
    active_invitations: activeInvitations || 0,
    total_uses: totalUses || 0,
    available_slots: availableSlots === Infinity ? -1 : availableSlots,
  }
}
