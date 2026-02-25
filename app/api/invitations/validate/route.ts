import { NextRequest, NextResponse } from 'next/server'
import { validateInvitationCode } from '@/lib/invitations'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Davet kodu belirtilmedi' },
        { status: 400 }
      )
    }

    const result = await validateInvitationCode(code)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Invitation validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Doğrulama hatası' },
      { status: 500 }
    )
  }
}
