import { createClient } from '@supabase/supabase-js'

// Admin client — service_role key ile RLS'i bypass eder.
// SADECE server-side (API routes, server components) kullanılmalı.
// ASLA client-side'a sızmamalı.
export function createAdminClient() {
  // Fallback values for build time (matching server.ts pattern)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
