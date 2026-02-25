import { NextRequest, NextResponse } from 'next/server'
import { useInvitationCode } from '@/lib/invitations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { invitation_id, user_id } = body

    if (!invitation_id || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Eksik parametreler' },
        { status: 400 }
      )
    }

    const result = await useInvitationCode(invitation_id, user_id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invitation use error:', error)
    return NextResponse.json(
      { success: false, error: 'Kayıt işlemi sırasında hata' },
      { status: 500 }
    )
  }
}
