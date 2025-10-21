import { NextResponse } from 'next/server'

export async function GET() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return NextResponse.json({
    status: 'ok',
    environment: {
      supabaseUrl: hasSupabaseUrl ? 'configured' : 'missing',
      supabaseKey: hasSupabaseKey ? 'configured' : 'missing',
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...' || 'not set',
    },
    timestamp: new Date().toISOString(),
  })
}
