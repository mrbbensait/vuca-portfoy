import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Fallback values for build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
