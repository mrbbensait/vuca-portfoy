import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: consents, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ consents: consents || null })
  } catch (error) {
    console.error('Error fetching consents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      spk_disclaimer_accepted,
      spk_risk_disclosure_accepted,
      kvkk_accepted,
      terms_accepted,
      cookie_consent,
    } = body

    const headers = request.headers
    const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'
    const userAgent = headers.get('user-agent') || 'unknown'

    const now = new Date().toISOString()

    const consentData: any = {
      user_id: user.id,
      ip_address: ip,
      user_agent: userAgent,
      cookie_consent: cookie_consent || { necessary: true, analytics: false, marketing: false },
    }

    if (spk_disclaimer_accepted) {
      consentData.spk_disclaimer_accepted = true
      consentData.spk_disclaimer_accepted_at = now
    }

    if (spk_risk_disclosure_accepted) {
      consentData.spk_risk_disclosure_accepted = true
      consentData.spk_risk_disclosure_accepted_at = now
    }

    if (kvkk_accepted) {
      consentData.kvkk_accepted = true
      consentData.kvkk_accepted_at = now
    }

    if (terms_accepted) {
      consentData.terms_accepted = true
      consentData.terms_accepted_at = now
    }

    if (cookie_consent) {
      consentData.cookie_consent_at = now
    }

    const { data, error } = await supabase
      .from('user_consents')
      .upsert(consentData, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, consents: data })
  } catch (error) {
    console.error('Error saving consents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cookie_consent } = body

    const updateData: any = {}

    if (cookie_consent) {
      updateData.cookie_consent = cookie_consent
      updateData.cookie_consent_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_consents')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, consents: data })
  } catch (error) {
    console.error('Error updating consents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
